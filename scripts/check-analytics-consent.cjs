/* eslint-disable @typescript-eslint/no-require-imports -- Component regression checks run in Node.js. */
const assert = require('node:assert/strict');
const Module = require('node:module');
const { JSDOM } = require('jsdom');
const React = require('react');
const { createRoot } = require('react-dom/client');
require('./load-typescript.cjs');

process.env.NEXT_PUBLIC_GA_ID = 'G-LB0LPMFZXJ';
process.env.NEXT_PUBLIC_ADSENSE_CLIENT = '';
global.IS_REACT_ACT_ENVIRONMENT = true;
const originalLoad = Module._load;
Module._load = function (name, ...args) {
  if (name === 'next/link') return { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) };
  if (name === 'next/navigation') return { usePathname: () => '/en-us' };
  if (name === '@/lib/locale-context') return { useLocale: () => ({ t: key => key, base: '/en-us' }) };
  return originalLoad.call(this, name, ...args);
};

async function scenario(run) {
  for (const name of Object.keys(require.cache)) {
    if (/[/\\]src[/\\](components[/\\]consent|lib[/\\](consent-state|preferences))/.test(name)) delete require.cache[name];
  }
  // No external scripts or network requests execute in these component checks.
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test/en-us?private=input#secret' });
  global.window = dom.window;
  global.document = dom.window.document;
  window.dataLayer = [];
  window.gtag = function () { window.dataLayer.push(Array.from(arguments)); };
  let listener;
  window.__tcfapi = (command, version, callback) => { if (command === 'addEventListener') listener = callback; };
  const ready = new Set(['CONSENT_API_READY']);
  const callbacks = [];
  window.googlefc = { callbackQueue: { push(entry) { callbacks.push(entry); for (const [key, fn] of Object.entries(entry)) if (ready.has(key)) fn(); } } };
  const { ConsentBanner } = require('../src/components/consent/ConsentBanner.tsx');
  const { Analytics } = require('../src/components/consent/Analytics.tsx');
  const root = createRoot(document.getElementById('root'));
  const events = () => window.dataLayer.filter(row => row[0] === 'event');
  const mode = async values => {
    window.googlefc.getGoogleConsentModeValues = () => values;
    ready.add('CONSENT_MODE_DATA_READY');
    await React.act(async () => { for (const entry of [...callbacks]) entry.CONSENT_MODE_DATA_READY?.(); });
  };
  const tcf = async applies => { await React.act(async () => listener({ gdprApplies: applies, eventStatus: 'useractioncomplete', listenerId: 1 }, true)); };
  const click = async key => {
    const button = [...document.querySelectorAll('button')].find(item => item.textContent === key);
    assert.ok(button, `Missing ${key}`);
    await React.act(async () => button.click());
  };
  try {
    await React.act(async () => root.render(React.createElement(React.Fragment, null, React.createElement(ConsentBanner), React.createElement(Analytics))));
    await run({ mode, tcf, click, events });
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
  }
}
const values = number => ({ adStoragePurposeConsentStatus: number, adUserDataPurposeConsentStatus: number, adPersonalizationPurposeConsentStatus: number, analyticsStoragePurposeConsentStatus: number });
(async () => {
  await scenario(async ({ mode, click, events, tcf }) => {
    assert.equal(document.getElementById('ga-loader'), null);
    await mode(values(3));
    assert.equal(events().length, 0);
    await click('consent.acceptWithStats');
    assert.ok(document.getElementById('ga-loader'));
    assert.equal(events().length, 1);
    assert.equal(events()[0][2].page_location, 'https://example.test/en-us');
    await mode(values(3));
    assert.equal(window['ga-disable-G-LB0LPMFZXJ'], false);
    assert.equal(events().length, 1);
    await tcf(true);
    assert.equal(window['ga-disable-G-LB0LPMFZXJ'], true);
    assert.ok(!document.cookie.includes('hoc_consent='));
    await mode(values(1));
    assert.equal(events().length, 2);
    document.cookie = '_ga=test; path=/';
    await mode(values(2));
    assert.equal(window['ga-disable-G-LB0LPMFZXJ'], true);
    assert.ok(!document.cookie.includes('_ga='));
  });
  await scenario(async ({ mode, events }) => {
    for (const status of [0, 4]) {
      await mode(values(status));
      assert.equal(document.getElementById('ga-loader'), null);
      assert.equal(document.querySelector('[role="dialog"]'), null);
      assert.equal(events().length, 0);
    }
  });
  await scenario(async ({ tcf, click, events, mode }) => {
    await tcf(false);
    await click('consent.rejectWithStats');
    await mode(values(1));
    assert.equal(events().length, 0);
    assert.equal(document.getElementById('ga-loader'), null);
    assert.ok(decodeURIComponent(document.cookie).includes('denied'));
  });
  console.log('Analytics consent component checks passed: outside-TCF opt-in, delayed callbacks, rejection, TCF transition/grant/revocation, unknown/unconfigured states, sanitized page URL.');
})().catch(error => { console.error(error); process.exitCode = 1; });
