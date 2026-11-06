/* eslint-disable @typescript-eslint/no-require-imports -- Component regression checks run in Node.js. */
const assert = require('node:assert/strict');
const Module = require('node:module');
const { JSDOM } = require('jsdom');
const React = require('react');
const { createRoot } = require('react-dom/client');
require('./load-typescript.cjs');

process.env.NEXT_PUBLIC_GA_ID = 'G-LB0LPMFZXJ';
process.env.NEXT_PUBLIC_ADSTERRA_ENABLED = 'true';
global.IS_REACT_ACT_ENVIRONMENT = true;
const originalLoad = Module._load;
Module._load = function (name, ...args) {
  if (name === 'next/link') return { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) };
  if (name === 'next/navigation') return { usePathname: () => '/en-us' };
  if (name === '@/lib/locale-context') return { useLocale: () => ({ t: key => key, language: { code: 'en' } }) };
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
  global.HTMLElement = dom.window.HTMLElement;
  global.Event = dom.window.Event;
  const { AnalyticsConsent, PrivacyChoices } = require('../src/components/consent/ConsentBanner.tsx');
  const { Analytics } = require('../src/components/consent/Analytics.tsx');
  const root = createRoot(document.getElementById('root'));
  const events = () => window.dataLayer.filter(row => row[0] === 'event');
  const click = async key => {
    const button = [...document.querySelectorAll('button')].find(item => item.textContent === key);
    assert.ok(button, `Missing ${key}`);
    await React.act(async () => button.click());
  };
  try {
    await React.act(async () => root.render(React.createElement(React.Fragment, null, React.createElement(AnalyticsConsent), React.createElement(PrivacyChoices), React.createElement(Analytics))));
    await run({ click, events });
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
  }
}
(async () => {
  await scenario(async ({ click, events }) => {
    assert.equal(document.getElementById('ga-loader'), null);
    assert.equal(document.querySelector('[role="dialog"]'), null);
    await click('consent.manage');
    assert.ok(document.querySelector('[role="dialog"] details'));
    assert.equal(events().length, 0);
    await click('consent.acceptWithStats');
    assert.ok(document.getElementById('ga-loader'));
    assert.equal(events().length, 1);
    assert.equal(events()[0][2].page_location, 'https://example.test/en-us');
    assert.equal(window.adsbygoogle, undefined);
    document.cookie = '_ga=test; path=/';
    await click('consent.rejectWithStats');
    assert.equal(window['ga-disable-G-LB0LPMFZXJ'], true);
    assert.ok(!document.cookie.includes('_ga='));
    assert.equal(events().length, 1);
  });
  console.log('Analytics consent checks passed: opt-in and revocation, no AdSense queue, sanitized page URL.');
})().catch(error => { console.error(error); process.exitCode = 1; });
