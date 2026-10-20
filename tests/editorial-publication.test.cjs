require('./load-typescript.cjs');
const test=require('node:test'),assert=require('node:assert/strict');
const {CALCULATORS,calculatorsFor}=require('../src/config/calculators/index.ts');
const {isCalculatorPublished}=require('../src/config/calculators/publication.ts');
const {loanComparisons}=require('../src/lib/loan-comparisons.ts');
const {allContent}=require('../src/lib/content.ts');
const {COUNTRIES}=require('../src/config/countries.ts');
const {LOCALES}=require('../src/config/locales.ts');
const {createFormatter}=require('../src/lib/format.ts');
const {translate}=require('../src/lib/i18n/core.ts');
const en=require('../src/lib/i18n/dictionaries/en.json');
const t=(key,params)=>translate(en,key,params);
const context=country=>({countryCode:country,country:COUNTRIES[country],t,fmt:createFormatter(country,'en',t)});
test('Unreviewed statutory engines are retained internally but never appear in discovery',()=>{
 let withdrawn=0,published=0;
 for(const calc of CALCULATORS.filter(calc=>calc.isCountrySpecific))for(const country of calc.countries){
  const available=calculatorsFor(country).some(item=>item.slug===calc.slug);
  assert.equal(available,isCalculatorPublished(calc,country));
  if(available)published++;else withdrawn++;
 }
 // 44 old VAT/pension/property variants share three input-driven tools.
 // Restored statutory models have explicit period and scope sources.
 assert.equal(withdrawn,0);assert.equal(published,85);
 for(const locale of Object.values(LOCALES).filter(l=>l.launch)){
  const items=allContent({locale:locale.code,country:locale.defaultCountry,t,calcContext:context(locale.defaultCountry)});
  for(const item of items){
   const match=item.href.match(/\/countries\/([a-z]{2})\/([^/]+)$/);
   if(match)assert(isCalculatorPublished(CALCULATORS.find(calc=>calc.slug===match[2]),match[1]),item.href);
  }
 }
});
test('Loan comparisons vary exactly one input and preserve meaningful cost tradeoffs',()=>{
 for(const calc of CALCULATORS.filter(calc=>['mortgage','loan','auto-loan','student-loan'].includes(calc.slug)))for(const country of calc.countries){
  const ctx=context(country),scenarios=loanComparisons(calc,ctx),base=scenarios[0];
  assert(scenarios.length>=3);
  const interest=result=>result.rows.find(row=>row.labelKey==='result.totalInterest').value;
  for(const scenario of scenarios.slice(1)){
   assert.deepEqual(Object.keys(base.values).filter(key=>base.values[key]!==scenario.values[key]),[scenario.fieldId]);
   assert(Number.isFinite(scenario.result.primary.value));
   if(scenario.fieldId==='rate')assert(scenario.result.primary.value>base.result.primary.value);
   if(scenario.fieldId==='years'){assert(scenario.result.primary.value>base.result.primary.value);assert(interest(scenario.result)<=interest(base.result));}
   if(scenario.fieldId==='downPayment')assert(scenario.result.primary.value<base.result.primary.value);
  }
 }
 const mortgage=CALCULATORS.find(calc=>calc.slug==='mortgage');
 const result=loanComparisons(mortgage,context('us'))[0].result;
 assert(Math.abs(result.primary.value-2268.696077)<0.01,'Independent fixed-payment benchmark');
});
