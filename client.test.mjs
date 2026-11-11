import assert from 'node:assert/strict';
let plugin;
globalThis.window = { __ModuleLoader__: { load: definition => { plugin = definition.factory(name => { assert.equal(name, 'react'); return { createElement: () => {}, Fragment: 'fragment' }; }); } } };
await import('./client.js');

let registration, calls = [], refreshed = [];
const ctx = {
  effect: fn => fn(),
  locale: { register: () => {}, bind: () => (key, vars) => vars ? `${key} ${JSON.stringify(vars)}` : key },
  slots: { inject: (name, fn) => { assert.equal(name, 'conversation.view'); fn(); }, register: (spec, view) => { registration = spec; } },
  sessions: { refreshProjections: async id => { refreshed.push(id); } },
  remote: { commands: { execute: async (...args) => { calls.push(args); return { ok: true, value: { result: { kind: 'success', text: JSON.stringify({ steps: [] }) } } }; } } },
};
plugin.apply(ctx);
assert.equal(calls.length, 0);
assert.equal(refreshed.length, 0);
assert.equal(registration.id, 'step-summary');
assert.ok(plugin.inject.includes('remote.commands'));
assert.ok(plugin.inject.includes('sessions'));

const { run, refresh } = registration.inject('session-abc');
await refresh();
assert.deepEqual(refreshed, ['session-abc']);
assert.deepEqual(await run('list'), { steps: [] });
assert.deepEqual(calls[0], ['session-abc', '/step-summary list', []]);
assert.deepEqual(await run('input 1:2'), { steps: [] });
assert.equal(calls[1][1], '/step-summary input 1:2');

ctx.remote.commands.execute = async () => ({ ok: false, error: { code: 'NO_SESSION', message: 'missing session' } });
await assert.rejects(run('list'), /missing session/);
ctx.remote.commands.execute = async () => ({ ok: true, value: { result: { kind: 'error', text: 'no model' } } });
await assert.rejects(run('generate 1:1'), /no model/);

console.log('PASS: client slot registration, no mount-time model calls, projection refresh, correct remote argument shape and RemoteResult unwrap');
