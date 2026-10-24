import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const digest = text => crypto.createHash('sha256').update(text).digest('hex');
const routes = ['/en-us', '/en-us/calculators/finance/loan', '/en-us/charts/math/metric-prefixes',
  '/en-us/converters/length/meters-to-feet', '/en-us/countries/us/income-tax', '/en-us/guides/what-is/what-is-compound-interest'];
const results = [];
for (const route of routes) {
  const response = await fetch('http://127.0.0.1:3001' + route, { signal: AbortSignal.timeout(20000) });
  const html = await response.text();
  const defaults = html.indexOf("gtag('consent', 'default'");
  const pause = html.indexOf('pauseAdRequests = 1');
  const loader = html.indexOf('<script async="" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=');
  const policy = response.headers.get('content-security-policy');
  const trial = response.headers.get('content-security-policy-report-only');
  assert.equal(response.status, 200, route);
  assert.ok(defaults >= 0 && pause >= 0 && loader > defaults && loader > pause, 'Denied defaults before Google loader: ' + route);
  assert.equal(trial, "script-src-attr 'none'");
  assert.ok(!policy.includes('unsafe-eval'));
  results.push({ route, status: response.status, cacheControl: response.headers.get('cache-control'),
    defaultsBeforeAdLoader: true, reportOnly: trial, policy });
}
const localHTML = fs.readFileSync('.next/server/app/en-us.html', 'utf8');
const layoutPath = html => [...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m => m[1])
  .find(src => /\/app\/.*\/layout-/.test(src));
const localPath = layoutPath(localHTML);
const localBundle = fs.readFileSync('.next/static/' + localPath.split('/_next/static/')[1].replaceAll('%5B', '[').replaceAll('%5D', ']'), 'utf8');
let live;
try {
  const response = await fetch('https://thecalculatorshouse.com/en-us', { signal: AbortSignal.timeout(20000) });
  const html = await response.text(), livePath = layoutPath(html);
  const bundleResponse = await fetch(new URL(livePath, response.url), { signal: AbortSignal.timeout(20000) });
  const bundle = await bundleResponse.text();
  live = { at: new Date().toISOString(), status: response.status, bundleStatus: bundleResponse.status,
    layoutPath: livePath, localLayoutPath: localPath, matchesLocalConsentBundle: digest(bundle) === digest(localBundle),
    liveBundleSHA256: digest(bundle), localBundleSHA256: digest(localBundle),
    reportOnly: response.headers.get('content-security-policy-report-only'),
    policy: response.headers.get('content-security-policy'), cacheControl: response.headers.get('cache-control') };
} catch (error) { live = { error: String(error) }; }
const evidence = { at: new Date().toISOString(), buildId: fs.readFileSync('.next/BUILD_ID', 'utf8').trim(),
  scope: 'HTTP/document source only. No browser timing, regional CMP or filled-ad certification.', local: results, live };
fs.writeFileSync(new URL('http-results.json', import.meta.url), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify({ localPasses: results.length, live }));
