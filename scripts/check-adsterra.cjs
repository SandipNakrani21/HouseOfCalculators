/* eslint-disable @typescript-eslint/no-require-imports -- Uses the installed TypeScript loader, like registry checks. */
require('./load-typescript.cjs');
const assert = require('node:assert/strict');
// Test the enabled boundary without changing the production default.
process.env.NEXT_PUBLIC_ADSTERRA_ENABLED = 'true';
const { NextRequest } = require('next/server');
const { GET } = require('../src/app/api/adsterra-native/route.ts');
const { ADSTERRA_COOKIE, ADSTERRA_KEY, ADSTERRA_LIFETIME, parseAdsterraChoice } = require('../src/config/adsterra.ts');
const { isAdEligiblePath } = require('../src/config/ad-inventory.ts');
const record = (choice, at = Date.now()) => encodeURIComponent(JSON.stringify({ vendor: 'adsterra-v1', choice, at }));
const googleGrant = encodeURIComponent(JSON.stringify({ version: 2, choice: 'granted', at: Date.now(), scope: 'outside-tcf' }));
const { spawnSync } = require('node:child_process');
for (const [environment, override, expected] of [['production', undefined, true], ['production', 'false', false], ['development', undefined, false], ['development', 'true', true]]) {
  const env = { ...process.env, NODE_ENV: environment };
  if (override === undefined) delete env.NEXT_PUBLIC_ADSTERRA_ENABLED;
  else env.NEXT_PUBLIC_ADSTERRA_ENABLED = override;
  const result = spawnSync(process.execPath, ['-r', './scripts/load-typescript.cjs', '-e', "process.stdout.write(String(require('./src/config/adsterra.ts').ADSTERRA_ENABLED))"], { cwd: require('node:path').join(__dirname, '..'), env, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, String(expected), 'Production pilot and explicit off switch');
}
async function request(cookie, destination = 'iframe') {
  const response = GET(new NextRequest('https://thecalculatorshouse.com/api/adsterra-native', {
    headers: { cookie: cookie ?? '', 'sec-fetch-dest': destination },
  }));
  return { response, html: await response.text() };
}
(async () => {
  for (const raw of [undefined, '%', 'null', record('granted', Date.now() + 60000), record('granted', Date.now() - ADSTERRA_LIFETIME - 1), JSON.stringify({ choice: 'granted', at: Date.now() })]) {
    assert.equal(parseAdsterraChoice(raw), null);
  }
  for (const cookie of [undefined, `hoc_consent=${googleGrant}`, `${ADSTERRA_COOKIE}=${record('denied')}`, `${ADSTERRA_COOKIE}=%`]) {
    assert.equal((await request(cookie)).html.includes(ADSTERRA_KEY), false, 'No vendor code without an explicit current vendor grant');
  }
  const grant = `${ADSTERRA_COOKIE}=${record('granted')}`;
  assert.equal((await request(grant, 'document')).html.includes(ADSTERRA_KEY), false, 'Direct document visits cannot load ads');
  const { response, html } = await request(grant);
  assert.equal((html.match(/src="https:\/\/bauval.org\/21\//g) ?? []).length, 1);
  assert.equal((html.match(/<div id="container-/g) ?? []).length, 1);
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
  const policy = response.headers.get('content-security-policy');
  assert.ok(!policy.includes('*') && !policy.includes('unsafe-eval'));
  assert.match(policy, /frame-src 'none'/);
  assert.match(policy, /upgrade-insecure-requests/);
  assert.match(html, /http-equiv="Content-Security-Policy"/);
  const metaPolicy = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  assert.ok(!metaPolicy.includes('frame-ancestors'), 'Header-only directives must not appear in HTML policies');
  const { LOCALES } = require('../src/config/locales.ts');
  const legalCopy = require('../src/config/adsterra-legal-copy.json');
  const { adsterraLegalText } = require('../src/config/adsterra-legal.ts');
  for (const locale of Object.values(LOCALES).filter(locale => locale.launch)) {
    assert.ok(legalCopy[locale.language], 'Every launch language must have its own legal disclosure');
    assert.match(adsterraLegalText('legal.privacy.ads.1', locale.language), /Google AdSense.*Adsterra/);
    assert.match(adsterraLegalText('legal.cookies.own.2', locale.language), /hoc_adsterra_v1/);
    assert.match(adsterraLegalText('legal.cookies.noTracking.withAnalytics', locale.language), /Adsterra/);
  }
  assert.equal((await request(`${ADSTERRA_COOKIE}=${record('denied')}`)).html.includes(ADSTERRA_KEY), false);
  assert.equal(isAdEligiblePath('/en-us/converters/length'), true);
  for (const path of ['/en-us/privacy', '/en-us/cookies', '/en-us/design-system', '/en-us/does-not-exist', '/xx-xx/converters/length']) assert.equal(isAdEligiblePath(path), false);
  // React lifecycle acceptance with a DOM and controlled visibility, no live ad requests.
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://thecalculatorshouse.com/en-us/converters/length' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.location = dom.window.location;
  global.Event = dom.window.Event;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  global.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; }
    observe() { this.callback([{ isIntersecting: true }]); }
    disconnect() {}
  };
  const Module = require('node:module');
  const load = Module._load;
  let pathname = '/en-us/converters/length';
  Module._load = function(name, ...args) {
    if (name === 'next/navigation') return { usePathname: () => pathname };
    if (name === '@/lib/locale-context') return { useLocale: () => ({ language: { code: 'en' }, t: key => key }) };
    return load.call(this, name, ...args);
  };
  const React = require('react');
  const { act } = React;
  const { createRoot } = require('react-dom/client');
  const { AdsterraBanner, AdsterraChoices } = require('../src/components/consent/Adsterra.tsx');
  Module._load = load;
  const root = createRoot(document.getElementById('root'));
  const render = () => root.render(React.createElement(React.StrictMode, null, React.createElement(AdsterraBanner), React.createElement(AdsterraChoices)));
  await act(render);
  assert.equal(document.querySelectorAll('iframe').length, 0);
  document.cookie = `hoc_consent=${googleGrant}; path=/`;
  assert.equal(require('../src/lib/preferences.ts').readConsent(), 'granted', 'Use a valid current Google-only choice');
  await act(render);
  assert.equal(document.querySelectorAll('iframe').length, 0);
  const choose = async text => act(() => [...document.querySelectorAll('button')].find(b => b.textContent === text).click());
  const settleFrame = () => act(() => new Promise(resolve => setTimeout(resolve, 5)));
  await choose('Reject / revoke Adsterra');
  assert.equal(document.querySelectorAll('iframe').length, 0);
  await choose('Allow Adsterra ads');
  assert.equal(document.querySelectorAll('iframe').length, 1);
  await settleFrame();
  assert.equal(document.querySelector('iframe').getAttribute('src'), '/api/adsterra-native', 'A committed consented frame must start its document');
  const first = document.querySelector('iframe');
  let stopped = 0;
  first.contentWindow.hocStopNative = () => { stopped++; assert.ok(first.isConnected, 'Stop before frame detaches'); };
  await act(render);
  assert.equal(document.querySelector('iframe'), first, 'Rerender must not initialise a second placement');
  pathname = '/en-us/calculators/finance/loan';
  await act(render);
  assert.equal(document.querySelectorAll('iframe').length, 1);
  assert.equal(first.isConnected, false, 'Navigation must destroy the previous vendor realm');
  assert.ok(stopped > 0, 'Navigation must close the outgoing network policy');
  const beforePageHide = document.querySelector('iframe');
  const beforeHide = stopped;
  beforePageHide.contentWindow.hocStopNative = () => { stopped++; assert.ok(beforePageHide.isConnected); };
  await act(() => window.dispatchEvent(new dom.window.PageTransitionEvent('pagehide')));
  assert.ok(stopped > beforeHide, 'Full-page navigation must stop the frame');
  await act(() => window.dispatchEvent(new dom.window.PageTransitionEvent('pageshow', { persisted: true })));
  assert.equal(document.querySelectorAll('iframe').length, 1);
  assert.notEqual(document.querySelector('iframe'), beforePageHide, 'Back-cache restore must remount a stopped frame');
  const second = document.querySelector('iframe');
  second.contentWindow.hocStopNative = () => { stopped++; assert.ok(second.isConnected, 'Revoke before frame detaches'); };
  const beforeRevoke = stopped;
  await choose('Reject / revoke Adsterra');
  assert.equal(document.querySelectorAll('iframe').length, 0);
  assert.ok(stopped > beforeRevoke, 'Revocation must close the outgoing network policy');
  pathname = '/en-us/privacy';
  await act(render);
  await choose('Allow Adsterra ads');
  assert.equal(document.querySelectorAll('iframe').length, 0);
  await act(() => root.unmount());
  dom.window.close();
  console.log('Adsterra consent boundary, exact snippet, policy, no-cache and eligibility checks passed. Browser lifecycle/delivery still require acceptance.');
})().catch(error => { console.error(error); process.exitCode = 1; });
