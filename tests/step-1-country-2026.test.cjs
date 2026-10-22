require('./load-typescript.cjs');
const test=require('node:test'),assert=require('node:assert/strict');
const {CALCULATORS}=require('../src/config/calculators/index.ts');
const {COUNTRIES}=require('../src/config/countries.ts');
const {ruleReview}=require('../src/config/calculators/provenance.ts');
const {INCOME_TAX_RULES}=require('../src/lib/finance/tax/index.ts');
const {japanSalaryIncome,asiaWageAmounts}=require('../src/config/calculators/reviewed/asia.ts');
const {createFormatter}=require('../src/lib/format.ts');
const {translate}=require('../src/lib/i18n/core.ts');
const en=require('../src/lib/i18n/dictionaries/en.json');
const t=(k,p)=>translate(en,k,p),ctx=c=>({countryCode:c,country:COUNTRIES[c],t,fmt:createFormatter(c,'en',t)});
function run(slug,country,v={}){const c=CALCULATORS.find(c=>c.slug===slug),x=ctx(country);return c.compute({...Object.fromEntries(c.fields(x).map(f=>[f.id,f.default])),...v},x);}
const row=(r,k)=>r.rows.find(x=>x.labelKey===k)?.value;
const close=(a,b)=>assert(Math.abs(a-b)<.00001,`${a} != ${b}`);
test('2026 Japan annual salary table boundaries, December applicability and Tokyo monthly child share',()=>{
 for(const [gross,income]of [[740999,0],[741000,1000],[2190999,1450999],[2191000,1451000],[2193000,1453000],[2196000,1456000],[2200000,1460000],[6000000,4360000],[6600000,4840000],[8500000,6550000]])assert.equal(japanSalaryIncome(gross),income);
 const annual=asiaWageAmounts('jp',6000000);assert.equal(annual.taxable,3320000);close(annual.tax,241466);
 const month=run('social-security','jp',{salary:300000,healthBase:'300000',pensionBase:'300000',care:false});
 close(row(month,'levy.healthInsurance'),14775);close(row(month,'asia.result.childSupport'),345);close(row(month,'levy.pensionInsurance'),27450);close(row(month,'levy.unemploymentInsurance'),1500);close(month.primary.value,44070);
 close(run('social-security','jp',{salary:300000,care:true}).primary.value,46500);
 assert(ruleReview('income-tax','jp').scope.includes('1December2026'));
 const c=CALCULATORS.find(c=>c.slug==='social-security');assert.equal(c.validate({salary:300000,healthBase:'300001',pensionBase:'300000'},ctx('jp')),'asia.error.assessedBase');
});
test('2026 Beijing contribution clamp and component cent rounding',()=>{
 for(const [salary,pension,health,unemployment]of [[0,581.6,148.4,36.35],[7270,581.6,148.4,36.35],[20000,1600,403,100],[36348,2907.84,729.96,181.74],[100000,2907.84,729.96,181.74]]){
  const r=run('social-security','cn',{salary});close(row(r,'levy.pensionInsurance'),pension);close(row(r,'levy.healthInsurance'),health);close(row(r,'levy.unemploymentInsurance'),unemployment);
 }
});
test('2026 Spanish ceiling, MEI and three employee solidarity tiers',()=>{
 for(const salary of [30000,61214.4,67335.84,91821.6,120000]){
  const monthly=salary/12,cap=Math.min(monthly,5101.2),cent=x=>Math.round(x*100)/100;
  const solidarity=12*(cent(Math.max(0,Math.min(monthly,5611.32)-5101.2)*.0019)+cent(Math.max(0,Math.min(monthly,7651.8)-5611.32)*.0021)+cent(Math.max(0,monthly-7651.8)*.0024));
  const r=run('social-security','es',{salary});close(row(r,'result.romanceMei'),cent(cap*.0015)*12);close(row(r,'result.romanceSolidarity'),solidarity);
 }
 close(run('social-security','es',{salary:30000}).primary.value,1950);
 close(row(run('income-tax','es',{income:30000}),'result.taxableIncome'),26050);
});
test('2026 Italy pension limits and 33 percent middle IRPEF band',()=>{
 close(row(run('social-security','it',{salary:56224,otherSocial:0}),'result.romanceExtraIvs'),0);
 close(row(run('social-security','it',{salary:56225,otherSocial:0}),'result.romanceExtraIvs'),.01);
 close(row(run('social-security','it',{salary:200000,otherSocial:0}),'result.romancePension'),11238.91);
 close(row(run('social-security','it',{salary:200000,insuranceStart:'pre1996',otherSocial:0}),'result.romancePension'),18380);
 const r=run('income-tax','it',{income:60000,localTax:0,otherSocial:0});
 const taxable=row(r,'result.taxableIncome');assert(taxable>50000);close(row(r,'result.incomeTax'),Math.round((6440+7260+(taxable-50000)*.43)*100)/100);
 close(row(run('capital-gains','it',{purchase:10000,sale:20000}),'result.taxAmount'),2600);
});
test('2026 Australia resident lower band and gain discount use current law Medicare',()=>{
 assert.equal(INCOME_TAX_RULES.au.taxYear,'2026-27');
 close(INCOME_TAX_RULES.au.compute({grossIncome:45000}).incomeTax,4595);
 close(INCOME_TAX_RULES.au.compute({grossIncome:18200}).incomeTax,0);
 close(row(run('capital-gains','au',{purchase:10000,sale:20000,income:80000,holding:'long'}),'result.taxAmount'),1600);
 close(row(run('capital-gains','au',{purchase:10000,sale:20000,income:80000,holding:'short'}),'result.taxAmount'),3200);
});
test('2026 France separates current contributions from 2025 wages assessed in 2026; Belgium ordinary shares only',()=>{
 assert.equal(ruleReview('income-tax','fr').period,'2025 wages / 2026 assessment');
 const r=run('social-security','fr',{salary:48060,employeeHealth:0,employerHealth:0});close(row(r,'result.romancePension'),3508.44);
 const payroll=run('payroll','fr',{salary:90000,employerHealth:0,accidentRate:1,otherEmployerCosts:0,actualCostsConfirmed:true});close(row(payroll,'levy.pensionInsurance'),6008.16);
 for(const lang of ['en','de','es','fr','it','nl','pt','ru','tr','ja','zh'])assert(!require('../src/lib/i18n/dictionaries/'+lang+'.json')['field.romanceAccidentRate'].includes('2025'));
 close(run('social-security','be',{salary:60000,specialSocial:0}).primary.value,7842);
 close(run('payroll','be',{salary:60000,nonSubjectPay:0,otherEmployerCosts:0,actualCostsConfirmed:true}).primary.value,75000);
});
test('India tax year2026–27 statutory renumbering keeps scoped ordinary tax and gains',()=>{
 assert.equal(INCOME_TAX_RULES.in.taxYear,'2026-27');
 close(INCOME_TAX_RULES.in.compute({grossIncome:1275000,regime:'new'}).incomeTax,0);
 close(INCOME_TAX_RULES.in.compute({grossIncome:1275001,regime:'new'}).incomeTax,1.04);
 close(row(run('capital-gains','in',{purchase:100000,sale:500000,income:1500000,holding:'long'}),'result.taxAmount'),35750);
 close(row(run('capital-gains','in',{purchase:100000,sale:500000,income:1500000,holding:'short'}),'result.taxAmount'),83200);
 assert(ruleReview('capital-gains','in').scope.includes('sections196/198'));
});

test('Belgium AY2027 Gazette allowance and ordinary employee tariff replace historical wages',()=>{
 // Independent hand totals: 60000 - 7842 ONSS - 6070 costs = 46088.
 // 4180 + 5116 + 7460.10 - 2887.50 = 13868.60 federal;
 // municipal7% = 970.80; special social charge remains a separate cash cost.
 const r=run('income-tax','be',{income:60000,specialSocial:731.28,municipalRate:7});
 close(row(r,'result.taxableIncome'),46088);
 close(row(r,'result.romanceEmploymentDeduction'),6070);
 close(row(r,'result.romanceLocalTax'),970.80);
 close(row(r,'result.incomeTax'),14839.40);
 close(r.primary.value,36587.32);
 const national=run('income-tax','be',{income:60000,specialSocial:0,municipalRate:0});
 close(row(national,'result.incomeTax'),13868.60);
 close(national.primary.value,38289.40);
 // At100000 the12 monthly ONSS amounts round to13070.04 annually.
 const upper=run('income-tax','be',{income:100000,specialSocial:731.28,municipalRate:7});
 close(row(upper,'result.taxableIncome'),80859.96);
 close(row(upper,'result.incomeTax'),33175.86);
 close(upper.primary.value,53022.82);
 close(run('salary','be',{salary:5000,period:'month',specialSocial:731.28,municipalRate:7}).primary.value,r.primary.value);
 assert.equal(ruleReview('income-tax','be').period,'2026 income / 2027 assessment');
 assert(ruleReview('salary','be').sources.includes('https://www.ejustice.just.fgov.be/mopdf/2026/08/12_1.pdf'));
 for(const lang of ['en','de','es','fr','it','nl','pt','ru','tr','ja','zh']){
  const note=require('../src/lib/i18n/dictionaries/'+lang+'.json')['review.scope.beEmployment'];
  assert(note.includes('2026'));assert(!note.includes('2025'));assert(!note.includes('10910')&&!note.includes('10,910'));
  assert(!require('../src/lib/i18n/dictionaries/'+lang+'.json')['field.romanceMunicipalRate'].includes('2025'));
 }
});
