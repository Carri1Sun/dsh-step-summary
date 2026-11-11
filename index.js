import z from 'zod';
import {
  SummaryEngine, STEP_PROMPT, INPUT_PROMPT, STEP_PROMPT_VERSION, INPUT_PROMPT_VERSION, MAX_INPUT_CHARS,
  buildView, deriveSession, inputCacheKey, promptPayload, reduce, resolveFlash, stepCacheKey, emptyState,
} from './core.js';

export const inject = ['commands', 'llm', 'sessionQuery', 'storageDomain', 'sessionProjections'];

const clippedSchema = z.object({ text: z.string(), cut: z.boolean() });
const entrySchema = z.object({ kind: z.string(), label: z.string(), text: z.string(), cut: z.boolean() });
const callSchema = z.object({
  callId: z.string(),
  name: z.string(),
  args: clippedSchema,
  result: clippedSchema.nullable(),
  isError: z.boolean(),
});
const stepSchema = z.object({
  id: z.string(),
  turn: z.number(),
  step: z.number(),
  complete: z.boolean(),
  hash: z.string().nullable(),
  inputHash: z.string(),
  input: z.array(entrySchema),
  thinking: z.array(clippedSchema),
  texts: z.array(clippedSchema),
  calls: z.array(callSchema),
});
const stateSchema = z.object({
  steps: z.array(stepSchema),
  pending: z.array(entrySchema),
  callNames: z.record(z.string(), z.string()),
  currentTurn: z.number().nullable(),
  currentStep: z.string().nullable(),
});
const viewSchema = z.object({
  impl: z.string(),
  steps: z.array(z.object({
    id: z.string(),
    turn: z.number(),
    step: z.number(),
    complete: z.boolean(),
    detail: z.boolean(),
    counts: z.object({ input: z.number(), thinking: z.number(), texts: z.number(), calls: z.number() }),
    input: z.array(entrySchema),
    thinking: z.array(clippedSchema),
    texts: z.array(clippedSchema),
    calls: z.array(callSchema),
  })),
});

const summarySchema = z.object({
  text: z.string(),
  createdAt: z.string(),
  hash: z.string(),
  promptVersion: z.number(),
  model: z.object({ provider: z.string(), model: z.string(), reasoningEffort: z.string() }).optional(),
});

export async function apply(ctx) {
  const inspector = ctx.get?.('cordisInspect');
  if (inspector) {
    ctx.effect(() => inspector.register({
      manifest: {
        id: 'StepSummary',
        description: 'Read-only configured Flash metadata diagnostics; never generates text.',
        methods: [{
          name: 'models',
          description: 'List registered DeepSeek Flash routes, their reasoning metadata, and the selected effort.',
          inputSchema: { type: 'object', properties: {}, additionalProperties: false },
          outputSchema: { description: 'Provider/model identifiers, declared reasoning efforts, and the resolved selection; no credentials or model calls.' },
        }],
      },
      async query(method) {
        if (method !== 'models') throw new Error('Unknown diagnostic');
        const models = [];
        for (const provider of ctx.llm.listProviders()) {
          for (const model of await ctx.llm.listModels(provider.id)) {
            const label = `${model.id} ${model.name ?? ''}`;
            if (!/deepseek/i.test(label) || !/flash/i.test(label)) continue;
            const info = await ctx.llm.resolveModelInfo(provider.id, model.id);
            models.push({ provider: provider.id, model: model.id, name: model.name, reasoning: info.reasoning ?? null });
          }
        }
        let resolvedSelection = null;
        try {
          const { provider, model, reasoningEffort } = await resolveFlash(ctx.llm);
          resolvedSelection = { provider, model, reasoningEffort };
        } catch (error) {
          resolvedSelection = { error: String(error.message ?? error) };
        }
        return { impl: '1.0.0', models, resolvedSelection };
      },
    }), 'step-summary: read-only model diagnostics');
  }

  let lastSteps;
  let lastView;
  const projection = await ctx.sessionProjections.register({
    key: 'stepsummary',
    stateSchema,
    stateVersion: 2,
    init: () => emptyState(),
    apply: (state, event) => reduce(state, event),
    wire: {
      summary: false,
      viewSchema,
      view: state => {
        if (state.steps === lastSteps && lastView !== undefined) return lastView;
        lastSteps = state.steps;
        lastView = buildView(state);
        return lastView;
      },
    },
  });
  ctx.effect(() => () => projection.dispose());

  const domain = await ctx.storageDomain.open({
    name: 'stepsummary',
    version: 1,
    tables: { summaries: { valueSchema: summarySchema } },
  });
  ctx.effect(() => () => domain.close());
  const table = domain.table('summaries');

  const engine = new SummaryEngine({
    table,
    generate: async (subject, kind, signal) => {
      const model = await resolveFlash(ctx.llm);
      const input = JSON.stringify(promptPayload(kind, subject));
      if (input.length > MAX_INPUT_CHARS) throw new Error(`本次摘要输入超过上限（${MAX_INPUT_CHARS} 字符），未调用模型。`);
      const isInput = kind === 'input';
      const prompt = isInput ? INPUT_PROMPT : STEP_PROMPT;
      const wrapper = isInput ? 'untrusted_context_delta' : 'untrusted_step_records';
      let text = '';
      let finish;
      for await (const chunk of ctx.llm.stream({
        ...model,
        purpose: isInput ? 'manual-step-input-summary' : 'manual-step-summary',
        maxTokens: 8192,
        signal,
        messages: [{ role: 'user', content: [{ type: 'text', text: `${prompt}\n<${wrapper}>\n${input}\n</${wrapper}>` }] }],
      })) {
        if (chunk.type === 'text-delta') text += chunk.text;
        if (chunk.type === 'finish') finish = chunk.reason;
      }
      if (finish?.kind !== 'stop') throw new Error(finish?.failure?.message ?? `摘要请求未正常完成：${finish?.kind ?? 'missing finish'}`);
      return { text, model: { provider: model.provider, model: model.model, reasoningEffort: model.reasoningEffort } };
    },
  });

  const readDerived = async sessionId => deriveSession((await ctx.sessionQuery.readSession(sessionId)).events);

  ctx.commands.register({
    recordInput: false,
    name: 'step-summary',
    description: 'Manually summarize each step output and its context input delta with the configured DeepSeek Flash.',
    input: { hint: 'list | generate <step,...> | regenerate <step,...> | input <step,...> | input-regenerate <step,...>' },
    handler: async ({ agent, rawInput, signal }) => {
      try {
        const [action = 'list', ids = ''] = rawInput.trim().split(/\s+/);
        const derived = await readDerived(agent.id);
        const summaryOf = (step, key) => (step.hash ? table.get(key) ?? null : null);
        if (action === 'list') {
          return {
            kind: 'success',
            text: JSON.stringify({
              steps: derived.steps.map(step => ({
                id: step.id,
                complete: step.complete,
                hash: step.hash,
                inputHash: step.inputHash,
                summary: summaryOf(step, stepCacheKey(agent.id, step)),
                inputSummary: table.get(inputCacheKey(agent.id, step)) ?? null,
              })),
              scope: 'full-session',
            }),
          };
        }
        const selected = [...new Set(ids.split(',').filter(Boolean))];
        if (!selected.length) throw new Error('请选择至少一个已完成步骤。');
        const targets = selected.map(id => {
          const step = derived.steps.find(candidate => candidate.id === id);
          if (!step) throw new Error(`找不到步骤 ${id}`);
          if (!step.complete || !step.hash) throw new Error(`步骤 ${id} 尚未完成`);
          return step;
        });
        if (action === 'input' || action === 'input-regenerate') {
          const items = targets.map(step => ({ id: step.id, key: inputCacheKey(agent.id, step), subject: step, kind: 'input', promptVersion: INPUT_PROMPT_VERSION }));
          const results = await engine.batch(items, { regenerate: action === 'input-regenerate', signal });
          return { kind: 'success', text: JSON.stringify({ results }) };
        }
        if (action !== 'generate' && action !== 'regenerate') throw new Error('未知操作。');
        const items = targets.map(step => ({ id: step.id, key: stepCacheKey(agent.id, step), subject: step, kind: 'step', promptVersion: STEP_PROMPT_VERSION }));
        const results = await engine.batch(items, { regenerate: action === 'regenerate', signal });
        return { kind: 'success', text: JSON.stringify({ results }) };
      } catch (error) {
        return { kind: 'error', text: String(error.message ?? error) };
      }
    },
  });
}
