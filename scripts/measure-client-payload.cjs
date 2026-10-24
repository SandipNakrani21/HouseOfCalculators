/* eslint-disable @typescript-eslint/no-require-imports -- Inspect built artifacts without launching a browser. */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '..');
const qa = path.join(root, 'docs/adsense-recheck-2026-10-19/postdeploy-qa');
fs.mkdirSync(qa, {recursive:true});
require('../tests/load-typescript.cjs');
const {CALCULATOR_METADATA}=require('../src/config/calculators/metadata.ts');
const {LOCALES}=require('../src/config/locales.ts');
const locales=Object.values(LOCALES).filter(locale=>locale.launch);
const cache = new Map();
function size(file) {
  if (!cache.has(file)) {
    const data = fs.readFileSync(file);
    cache.set(file, { bytes: data.length, gzip: zlib.gzipSync(data).length });
  }
  return cache.get(file);
}
const routes = [...locales.map(locale => ({ locale:locale.code, route:'/'+locale.path })), ...locales.flatMap(locale=>CALCULATOR_METADATA.map(calc=>{
  const country=calc.countries.includes(locale.defaultCountry)?locale.defaultCountry:calc.countries[0];
  return {locale:locale.code,slug:calc.slug,country,route:`/${locale.path}/${calc.isCountrySpecific?'countries/'+country:'calculators/'+calc.category}/${calc.slug}`};
}))];
const pages = routes.map(item => {
  let actual = item.route;
  let file = path.join(root, '.next/server/app', actual + '.html');
  if (!fs.existsSync(file) && item.slug === 'salary' && ['tr', 'br', 'cn', 'mx'].includes(item.country)) {
    actual = actual.replace(/\/salary$/, '/income-tax');
    file = path.join(root, '.next/server/app', actual + '.html');
  }
  if (!fs.existsSync(file)) return { ...item, missing: true };
  const html = fs.readFileSync(file, 'utf8');
  const scripts = new Set([...html.matchAll(/<script\b[^>]*\bsrc="([^"?]+)(?:\?[^"<>]*)?"/g)].map(m => m[1]).filter(p => p.startsWith('/_next/static/')));
  for (const m of html.matchAll(/<link\b[^>]*>/g)) {
    if (/as="script"/.test(m[0])) {
      const href = m[0].match(/href="([^"?]+)(?:\?[^"<>]*)?"/);
      if (href?.[1].startsWith('/_next/static/')) scripts.add(href[1]);
    }
  }
  const assets = [...scripts].map(url => ({ url, ...size(path.join(root, '.next', decodeURIComponent(url.slice('/_next/'.length)))) }));
  return { locale: item.locale, route: item.route, actual, html: size(file), scripts: assets,
    jsBytes: assets.reduce((n, a) => n + a.bytes, 0), jsGzip: assets.reduce((n, a) => n + a.gzip, 0) };
});
const report = { at: new Date().toISOString(), buildId: fs.readFileSync(path.join(root, '.next/BUILD_ID'), 'utf8').trim(),
  method: 'Built HTML script/preload URLs, deduplicated per requested route. Gzip is locally computed per asset, not an observed network transfer, Core Web Vital or Lighthouse score.',
  requested: pages.length, missing: pages.filter(p => p.missing), pages };
const label = process.argv[2] || 'current';
if (!/^[a-z0-9-]+$/.test(label)) throw new Error('Invalid measurement label');
fs.writeFileSync(path.join(qa, 'completion-2026-10-24-payload-' + label + '.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ buildId: report.buildId, requested: pages.length, missing: report.missing.length,
  examples: pages.filter(p => p.locale === 'en-US').slice(0, 5).map(({ route, html, jsBytes, jsGzip }) => ({ route, html, jsBytes, jsGzip })) }, null, 2));
