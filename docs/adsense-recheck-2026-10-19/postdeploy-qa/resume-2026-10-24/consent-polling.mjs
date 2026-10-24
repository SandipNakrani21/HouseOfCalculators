// Actual hook with controlled DOM/API timing. This is not regional/network QA.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const results = [];
const source = fs.readFileSync('src/components/consent/ConsentBanner.tsx', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
  esModuleInterop: true, target: ts.ScriptTarget.ES2020,
} }).outputText;

for (const timing of ['immediate', 'poll', 'queue', 'unavailable']) {
  const dom = new JSDOM('<div id="root"></div>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  const intervals = new Map(), queue = [], calls = [];
  let nextId = 0, listener, registrations = 0, removals = 0;
  window.setInterval = (fn, ms) => { assert.equal(ms, 250); intervals.set(++nextId, fn); return nextId; };
  window.clearInterval = id => intervals.delete(id);
  const api = (command, version, callback, id) => {
    assert.equal(version, 2);
    if (command === 'addEventListener') {
      registrations++;
      listener = callback;
      callback({ gdprApplies: false, listenerId: 7, eventStatus: 'tcloaded' }, true);
    } else { assert.equal(command, 'removeEventListener'); assert.equal(id, 7); removals++; }
  };
  window.googlefc = { callbackQueue: queue };
  if (timing === 'immediate') window.__tcfapi = api;
  const mocks = {
    react: React, 'react/jsx-runtime': await import('react/jsx-runtime'),
    'next/link': { __esModule: true, default: () => null },
    '@/config/adsense': { ADSENSE_PUBLISHER_ID: 'test-only' },
    '@/config/analytics': { ANALYTICS_ON: false },
    '@/lib/locale-context': {}, '@/lib/preferences': { clearConsent() {} },
    '@/lib/consent-state': { publishConsent: value => calls.push(value), clearAnalyticsCookies() {} },
  };
  const mod = { exports: {} };
  vm.runInThisContext('(function(exports,require,module){' + compiled + '\n})')(
    mod.exports, name => { assert.ok(name in mocks, name); return mocks[name]; }, mod);
  let applies;
  function Probe() { applies = mod.exports.useGoogleConsentApplies(true); return null; }
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(Probe)));
  assert.equal(intervals.size, timing === 'immediate' ? 0 : 1);
  if (timing === 'poll' || timing === 'queue') {
    window.__tcfapi = api;
    await act(async () => {
      if (timing === 'poll') [...intervals.values()][0]();
      else queue.find(entry => entry.CONSENT_API_READY).CONSENT_API_READY();
    });
  }
  if (timing !== 'unavailable') {
    assert.equal(intervals.size, 0, 'No polling after API registration');
    assert.equal(registrations, 1);
    assert.equal(applies, false);
    await act(async () => listener({ gdprApplies: true, listenerId: 7, eventStatus: 'useractioncomplete' }, true));
    assert.equal(applies, true, 'Listener still processes later changes');
    assert.ok(calls.length && calls.every(value => Object.values(value).every(v => v === 'denied')));
  } else assert.equal(applies, 'pending');
  await act(async () => root.unmount());
  assert.equal(intervals.size, 0, 'Unmount clears waiting timer');
  assert.equal(removals, timing === 'unavailable' ? 0 : 1);
  dom.window.close();
  results.push({ timing, pass: true });
}
const evidence = { at: new Date().toISOString(), method: 'Actual React hook; simulated timer and CMP. No live traffic.', results };
fs.writeFileSync(new URL('consent-polling-results.json', import.meta.url), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence));
