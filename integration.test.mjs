import assert from 'node:assert/strict';
import { apply } from './index.js';

const events = [
  { type: 'turn/start', seq: 1, data: { turn: 1 } },
  { type: 'step/start', seq: 2, data: { turn: 1, step: 1 } },
  { type: 'user/message', seq: 3, data: { role: 'user', content: [{ type: 'text', text: '检查构建' }] } },
  { type: 'assistant/message', seq: 4, data: { turn: 1, step: 1, message: { role: 'assistant', content: [
    { type: 'reasoning', text: '先看看配置' },
    { type: 'text', text: '我来检查。' },
    { type: 'tool-call', id: 'c1', name: 'read', arguments: '{"path":"a"}' },
  ] } } },
  { type: 'tool/call', seq: 5, data: { turn: 1, step: 1, callId: 'c1', name: 'read', arguments: '{"path":"a"}' } },
  { type: 'tool/result', seq: 6, data: { turn: 1, step: 1, message: { role: 'tool', toolCallId: 'c1', content: [{ type: 'text', text: 'file body' }] } } },
  { type: 'step/end', seq: 7, data: { turn: 1, step: 1 } },
  { type: 'step/start', seq: 8, data: { turn: 1, step: 2 } },
  { type: 'assistant/message', seq: 9, data: { turn: 1, step: 2, message: { role: 'assistant', content: [{ type: 'text', text: '检查完成。' }] } } },
  { type: 'step/end', seq: 10, data: { turn: 1, step: 2 } },
];

const values = new Map();
const table = { get: k => values.get(k), put: async (k, v) => values.set(k, v) };
let registered, projection, domainName, streams = [];
const ctx = {
  effect: () => {},
  get: () => undefined,
  sessionProjections: { register: async definition => { projection = definition; return { dispose: async () => {} }; } },
  storageDomain: { open: async spec => { domainName = spec.name; return { table: () => table, close: async () => {} }; } },
  commands: { register: command => { registered = command; } },
  sessionQuery: { readSession: async () => ({ events }) },
  llm: {
    listProviders: () => [{ id: 'deepseek-official' }],
    listModels: async () => [{ id: 'deepseek-flash', name: 'DeepSeek-V4.1-Flash' }],
    resolveModelInfo: async () => ({ reasoning: { efforts: [{ id: 'off' }, { id: 'low' }, { id: 'high' }, { id: 'max' }] } }),
    stream: async function* (options) {
      streams.push(options);
      const prompt = options.messages[0].content[0].text;
      yield { type: 'text-delta', text: prompt.includes('上下文差异') ? '新增了读取结果。' : '读取文件完成。' };
      yield { type: 'finish', reason: { kind: 'stop' } };
    },
  },
};

await apply(ctx);
assert.equal(domainName, 'stepsummary');
assert.equal(projection.key, 'stepsummary');
assert.equal(projection.wire.summary, false);
assert.equal(streams.length, 0);

let state = projection.init({ id: 's' }, 0);
for (const event of events) state = projection.apply(state, event);
projection.stateSchema.parse(state);
const view = projection.wire.view(state);
projection.wire.viewSchema.parse(view);
assert.equal(view.steps.length, 2);
assert.equal(view.steps[0].detail, true);
assert.equal(view.steps[0].input[0].text, '检查构建');
assert.equal(view.steps[0].thinking[0].text, '先看看配置');
assert.equal(view.steps[0].calls[0].result.text, 'file body');
assert.equal(view.steps[1].input.some(entry => entry.text.includes('file body')), true);
assert.equal(projection.wire.view(state), view, 'unchanged state reuses the cached view reference');

const invoke = rawInput => registered.handler({ agent: { id: 's' }, rawInput, signal: new AbortController().signal });
let result = await invoke('list');
const list = JSON.parse(result.text);
assert.equal(result.kind, 'success');
assert.equal(list.steps.length, 2);
assert.equal(list.steps[0].inputHash.length, 64);
assert.ok(!('input' in list.steps[0]));
assert.ok(!result.text.includes('file body'), 'listing never echoes the raw transcript');

result = await invoke('generate 1:1');
assert.equal(result.kind, 'success');
assert.equal(streams.length, 1);
assert.equal(streams[0].provider, 'deepseek-official');
assert.equal(streams[0].model, 'deepseek-flash');
assert.equal(streams[0].reasoningEffort, 'high');
assert.equal(streams[0].maxTokens, 8192);
assert.match(streams[0].messages[0].content[0].text, /不可信/);
assert.match(streams[0].messages[0].content[0].text, /untrusted_step_records/);

await invoke('generate 1:1');
assert.equal(streams.length, 1, 'cached output summary does not call the model again');
await invoke('regenerate 1:1');
assert.equal(streams.length, 2);

result = await invoke('input 1:2');
assert.equal(result.kind, 'success');
assert.equal(streams.length, 3);
assert.match(streams[2].messages[0].content[0].text, /untrusted_context_delta/);
assert.match(streams[2].messages[0].content[0].text, /file body/);

await invoke('input 1:2');
assert.equal(streams.length, 3, 'cached input summary does not call the model again');
await invoke('input-regenerate 1:2');
assert.equal(streams.length, 4);

result = await invoke('list');
const listed = JSON.parse(result.text);
assert.ok(listed.steps[1].inputSummary.text.includes('新增'));
assert.ok(listed.steps[0].summary.text.includes('读取'));
assert.ok(listed.steps[0].inputSummary === null || typeof listed.steps[0].inputSummary === 'object');

result = await invoke('generate 1:3');
assert.equal(result.kind, 'error', 'unknown steps are refused');

ctx.llm.listProviders = () => [];
result = await invoke('input-regenerate 1:2');
assert.match(JSON.parse(result.text).results[0].error, /未找到/);
assert.equal(streams.length, 4, 'missing Flash never falls back to another model');

console.log('PASS: Host projection contract, per-step raw input/output, model-hidden listing, strict Flash high effort, independent caches, no fallback');
