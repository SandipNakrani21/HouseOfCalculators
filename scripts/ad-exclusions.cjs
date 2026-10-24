/* eslint-disable @typescript-eslint/no-require-imports -- Generates an operator worksheet, not account changes. */
require('./load-typescript.cjs');
const fs=require('node:fs'),path=require('node:path');
const {CALCULATORS}=require('../src/config/calculators/index.ts');
const {ruleReview}=require('../src/config/calculators/provenance.ts');
const {LOCALES}=require('../src/config/locales.ts');
const origin='https://thecalculatorshouse.com';
const rows=['URL,Match,Reason'];
for(const locale of Object.values(LOCALES).filter(l=>l.launch)){
 const base=`${origin}/${locale.path}`;
 for(const slug of ['', '/privacy','/cookies','/terms','/about','/contact','/design-system','/calculators','/converters','/tools','/charts','/guides','/countries'])
  rows.push(`${base}${slug},This page only,Outside manually reviewed advertising inventory`);
 for(const calc of CALCULATORS.filter(c=>c.isCountrySpecific))for(const country of calc.countries)
  if(!ruleReview(calc.slug,country))rows.push(`${base}/countries/${country}/${calc.slug},This page only,Country model awaits source review`);
}
const output=path.resolve(__dirname,'../docs/policy-audit-2026-10-18/auto-ads-exclusions.csv');
fs.writeFileSync(output,rows.join('\n')+'\n');
console.log(`${rows.length-1} suggested exact exclusions written. Not an AdSense import format or complete account configuration; manual ads with Auto ads disabled is the initial setup recommendation.`);
