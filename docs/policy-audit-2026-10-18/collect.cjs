/* eslint-disable @typescript-eslint/no-require-imports -- Audit runs with the project's CommonJS test loader. */
/* Read-only audit of current registries and representative HTTP responses. */
require('../../tests/load-typescript.cjs');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { CALCULATORS } = require('../../src/config/calculators/index.ts');
const { TOOLS } = require('../../src/config/tools/definitions.ts');
const { CONVERTERS } = require('../../src/config/converters/definitions.ts');
const { GUIDES } = require('../../src/config/guides/definitions.ts');
const { CHARTS } = require('../../src/config/charts/definitions.ts');
const { LOCALES } = require('../../src/config/locales.ts');
const { ruleReview } = require('../../src/config/calculators/provenance.ts');
const inventory = require('../../src/config/ad-inventory.json');
const en = require('../../src/lib/i18n/dictionaries/en.json');
const languages = [...new Set(Object.values(LOCALES).filter(l => l.launch).map(l => l.language))];
const important = Object.keys(en).filter(k => /^(legal\.|consent\.|quality\.|calc.ruleReview)/.test(k));
const translations = languages.map(language => {
  const dict = require('../../src/lib/i18n/dictionaries/' + language + '.json');
  return { language, totalKeys: Object.keys(dict).length, missingImportant: important.filter(k => !Object.hasOwn(dict,k)), identicalImportant: language === 'en' ? [] : important.filter(k => dict[k] === en[k]) };
});
const countryModels = CALCULATORS.filter(c => c.isCountrySpecific).flatMap(c => c.countries.map(country => ({slug:c.slug,country,review:ruleReview(c.slug,country) ?? null})));
const result = {
  date:'2026-10-18',
  counts:{calculators:CALCULATORS.length,tools:TOOLS.length,converters:CONVERTERS.length,pairs:CONVERTERS.reduce((n,c)=>n+c.featuredPairs.length,0),guides:GUIDES.length,charts:CHARTS.length,calculatorCountryCombinations:CALCULATORS.reduce((n,c)=>n+c.countries.length,0),countryModels:countryModels.length,reviewedCountryModels:countryModels.filter(c=>c.review).length,adPaths:inventory.paths.length,adLocales:inventory.locales.length},
  translations,countryModels,
  health:CALCULATORS.filter(c=>c.category==='health').map(c=>({slug:c.slug,explainers:c.explainerKeys,faqs:c.faqKeys})),
  http:[]
};
const samples = new Set(['/en-us','/en-us/privacy','/en-us/cookies','/en-us/about','/en-us/terms','/en-us/contact','/en-us/calculators','/en-us/countries/us','/en-us/design-system','/en-us/does-not-exist','/robots.txt','/ads.txt','/sitemap.xml']);
for(const category of new Set(CALCULATORS.filter(c=>!c.isCountrySpecific).map(c=>c.category))) {
  const c = CALCULATORS.find(c=>!c.isCountrySpecific && c.category===category); samples.add(`/en-us/calculators/${c.category}/${c.slug}`);
}
for(const slug of ['bmi','water-intake']) if(CALCULATORS.some(c=>c.slug===slug)) samples.add(`/en-us/calculators/health/${slug}`);
for(const slug of ['income-tax','salary','payroll']) for(const country of ['us','in','ca']) if(countryModels.some(c=>c.slug===slug&&c.country===country)) samples.add(`/en-us/countries/${country}/${slug}`);
for(const category of new Set(TOOLS.map(t=>t.category))) {const t=TOOLS.find(t=>t.category===category); samples.add(`/en-us/tools/${t.category}/${t.slug}`);}
samples.add('/en-us/converters/temperature'); samples.add('/en-us/converters/temperature/celsius-to-fahrenheit');
for(const category of new Set(GUIDES.map(g=>g.category))) {const g=GUIDES.find(g=>g.category===category);samples.add(`/en-us/guides/${g.category}/${g.slug}`);}
const chart=CHARTS[0];samples.add(`/en-us/charts/${chart.category}/${chart.slug}`);
for(const l of Object.values(LOCALES).filter(l=>l.launch && l.language!=='en')) samples.add(`/${l.path}/privacy`);
const tasks=[...samples].map(p=>({origin:'http://localhost:3001',path:p}));
for(const p of ['/ads.txt','/robots.txt','/en-us/privacy','/en-us/cookies','/en-us/calculators/finance/mortgage','/en-us/countries/us/income-tax'])tasks.push({origin:'https://thecalculatorshouse.com',path:p});
let index=0;
async function worker(){ while(index<tasks.length){const task=tasks[index++];try{
  const response=await fetch(task.origin+task.path,{signal:AbortSignal.timeout(90000)}); const html=await response.text();
  const dom=new JSDOM(html);const doc=dom.window.document;
  const main=doc.querySelector('main');
  const text=(main?.textContent??doc.body?.textContent??'').replace(/\s+/g,' ').trim();
  const record={...task,status:response.status,finalUrl:response.url,title:doc.title,h1:[...doc.querySelectorAll('h1')].map(e=>e.textContent),words:text.split(/\s+/).length,canonical:doc.querySelector('link[rel=canonical]')?.href,robots:doc.querySelector('meta[name=robots]')?.content,ads:doc.querySelectorAll('ins.adsbygoogle').length,adLoader:html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'),gaLoader:html.includes('googletagmanager.com/gtag/js'),headers:{csp:response.headers.get('content-security-policy'),contentType:response.headers.get('content-type')},text};
  result.http.push(record); dom.window.close();
  console.log(response.status,task.origin,task.path);
}catch(e){result.http.push({...task,error:e.message});console.log('ERROR',task.path,e.message);}}}
worker().then(()=>{fs.writeFileSync(path.join(__dirname,'evidence.json'),JSON.stringify(result,null,2));console.log('COUNTS',JSON.stringify(result.counts));console.log('HTTP',result.http.length,'FAILURES',result.http.filter(r=>r.error||r.status>=500).length);});
