import assert from 'node:assert/strict';
import { SummaryEngine, INPUT_PROMPT_VERSION, STEP_PROMPT_VERSION, buildView, deriveSession, inputCacheKey, promptPayload, resolveFlash, stepCacheKey } from './core.js';

const events = [
  { type: 'turn/start', seq: 1, data: { turn: 1 } },
  { type: 'step/start', seq: 2, data: { turn: 1, step: 1 } },
  { type: 'user/message', seq: 3, data: { role: 'user', content: [{ type: 'text', text: '请检查构建' }] } },
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

const derived = deriveSession(events);
assert.equal(derived.steps.length, 2, 'a step appears once it has input or output content');
const [first, second] = derived.steps;
assert.equal(first.id, '1:1');
assert.equal(first.complete, true);
assert.match(first.hash, /^[0-9a-f]{64}$/);
assert.equal(first.input.length, 1);
assert.equal(first.input[0].kind, 'user');
assert.ok(first.input[0].text.includes('请检查构建'));
assert.equal(first.thinking[0].text, '先看看配置');
assert.equal(first.calls[0].result.text, 'file body');

assert.equal(second.id, '1:2');
assert.equal(second.input[0].kind, 'assistant');
assert.ok(second.input.some(entry => entry.kind === 'tool-result' && entry.text.includes('file body')));
assert.ok(!second.input.some(entry => entry.kind === 'user'), 'unchanged earlier context is not repeated');
assert.match(second.inputHash, /^[0-9a-f]{64}$/);
assert.notEqual(second.inputHash, first.inputHash);

const view = buildView({ steps: derived.steps });
assert.equal(view.steps[0].detail, true);
assert.equal(view.steps[1].counts.input, second.input.length);
assert.equal(view.steps[0].counts.calls, 1);
assert.equal(JSON.parse(JSON.stringify(view)).steps.length, 2);

assert.notEqual(stepCacheKey('s', first), stepCacheKey('s', second));
assert.equal(inputCacheKey('s', first), inputCacheKey('s', first));
assert.notEqual(inputCacheKey('s', first), inputCacheKey('s', { ...first, inputHash: 'changed' }));

const inputPayload = promptPayload('input', second);
assert.ok(inputPayload.added.some(entry => entry.text.includes('file body')));
const outputPayload = promptPayload('step', first);
assert.ok(outputPayload.tools[0].result.includes('file body'));

// Cache reuse, explicit regeneration, incomplete rejection and partial failure across both summary kinds.
const values = new Map();
const table = { get: k => values.get(k), put: async (k, v) => values.set(k, v) };
let calls = 0;
const engine = new SummaryEngine({ table, generate: async (subject, kind) => { calls += 1; if (subject.id === 'bad') throw Error('failure'); return kind === 'input' ? '新增了读取结果' : '完成检查'; } });
const outputItem = { key: stepCacheKey('s', first), subject: first, kind: 'step', promptVersion: STEP_PROMPT_VERSION, id: first.id };
const inputItem = { key: inputCacheKey('s', first), subject: first, kind: 'input', promptVersion: INPUT_PROMPT_VERSION, id: first.id };
await engine.one(outputItem);
await engine.one(outputItem);
assert.equal(calls, 1);
await engine.one(inputItem);
assert.equal(calls, 2, 'input and output caches are independent');
await engine.one({ ...outputItem, regenerate: true });
assert.equal(calls, 3);
await assert.rejects(engine.one({ ...outputItem, subject: { ...first, complete: false } }));
assert.equal(calls, 3);
const batch = await engine.batch([{ ...outputItem, id: 'bad', key: 'bad-key', subject: { ...first, id: 'bad' } }, inputItem]);
assert.ok(batch[0].error);
assert.equal(batch[1].summary.cached, true);

// Resolver: built-in DeepSeek Flash uses its documented balanced tier; a real medium is honored; otherwise fail.
const flash = efforts => ({ listProviders: () => [{ id: 'deepseek-official' }], listModels: async () => [{ id: 'deepseek-flash', name: 'DeepSeek-V4.1-Flash' }], resolveModelInfo: async () => ({ reasoning: { efforts: efforts.map(id => ({ id })) } }) });
assert.deepEqual(await resolveFlash(flash(['off', 'low', 'high', 'max'])), { provider: 'deepseek-official', model: 'deepseek-flash', reasoningEffort: 'high' });
assert.deepEqual(await resolveFlash(flash(['low', 'medium'])), { provider: 'deepseek-official', model: 'deepseek-flash', reasoningEffort: 'medium' });
await assert.rejects(resolveFlash(flash(['low', 'high'])), /中等推理强度/);
await assert.rejects(resolveFlash({ listProviders: () => [] }), /未找到/);
await assert.rejects(resolveFlash({ listProviders: () => [{ id: 'a' }, { id: 'b' }], listModels: async () => [{ id: 'deepseek-flash' }] }), /多个/);

console.log('PASS: per-step input deltas, bounded projection view, independent input/output caches, strict Flash balanced-tier resolution');
