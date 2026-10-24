require('./load-typescript.cjs');
const test=require('node:test'), assert=require('node:assert/strict');
const {CALCULATORS}=require('../src/config/calculators/index.ts');
const {COUNTRIES}=require('../src/config/countries.ts');
const {INCOME_TAX_RULES}=require('../src/lib/finance/tax/index.ts');
const {ruleReview}=require('../src/config/calculators/provenance.ts');
const {createFormatter}=require('../src/lib/format.ts');
const {translate}=require('../src/lib/i18n/core.ts');
const {resolveFields,calculatorFieldError}=require('../src/lib/validation.ts');
const {readShareQuery}=require('../src/lib/share-link.ts');
const {CONVERTERS}=require('../src/config/converters/definitions.ts');
const {conversionFormula,convert}=require('../src/config/converters/units.ts');
const n=require('../src/lib/tools/numbers.ts'),d=require('../src/lib/tools/dates.ts');
const en=require('../src/lib/i18n/dictionaries/en.json');
const t=(k,p)=>translate(en,k,p);
const context=code=>({countryCode:code,country:COUNTRIES[code],t,fmt:createFormatter(code,'en',t)});
function run(slug,values={},country='us') { const c=CALCULATORS.find(c=>c.slug===slug),ctx=context(country);return c.compute({...Object.fromEntries(c.fields(ctx).map(f=>[f.id,f.default])),...values},ctx); }
const row=(result,key)=>result.rows.find(r=>r.labelKey===key)?.value;
test('Australian2026–27 super uses annual QE base and indexed cap, with scoped fund taxes',()=>{
 const c=CALCULATORS.find(c=>c.slug==='superannuation'),ctx=context('au');
 assert.equal(c.version,4);assert.equal(ruleReview('superannuation','au').period,'2026–27; accumulation illustration');
 for(const [salary,sg,tax293,net]of [[45000,5400,0,4590],[95000,11400,0,9690],[230000,27600,1140,22320],[250000,30000,4500,21000],[270830,32499.6,4874.94,22749.72],[300000,32499.6,4874.94,22749.72]]){
  const result=run('superannuation',{salary,balance:0,sacrifice:0,years:1,rate:0},'au');
  close(row(result,'review.root.sg'),sg);close(row(result,'review.root.div293'),tax293);close(row(result,'review.root.annualNetFund'),net);close(result.primary.value,net);
 }
 const exact={salary:95000,sacrifice:21100,balance:0,years:1,rate:0};
 assert.equal(c.validate(exact,ctx),null);close(row(run('superannuation',exact,'au'),'result.annualContribution'),32500);
 close(row(run('superannuation',exact,'au'),'result.contributionsTax'),4875);
 assert.equal(c.validate({...exact,sacrifice:21100.01},ctx),'review.root.superLimit');
 assert.equal(c.validate({...exact,salary:270830,sacrifice:.40},ctx),null);
 assert.equal(c.validate({...exact,salary:270830,sacrifice:.41},ctx),'review.root.superLimit');
 close(row(run('superannuation',{salary:95000,sacrifice:1000},'au'),'review.root.sg'),11400);
 const negative=run('superannuation',{salary:95000,sacrifice:0,balance:60000,years:1,rate:-10},'au');assert(negative.primary.value<69690);
 assert.equal(readShareQuery('?salary=95000&modelVersion=3',c.fields(ctx),4).obsolete,true);
 for(const l of ['en','de','es','fr','it','nl','pt','ru','tr','ja','zh']){const dictionary=require('../src/lib/i18n/dictionaries/'+l+'.json');assert(dictionary['review.root.auSuper'].includes('2026–27'));assert(dictionary['review.root.qe']);assert(!dictionary['review.root.superLimit'].includes('30,000'));}
});
function close(actual,expected,tolerance=1e-8){assert(Math.abs(actual-expected)<=tolerance,`${actual} ≠ ${expected}`);}
test('India rebate marginal relief prevents the one-rupee cliff; surcharge thresholds remain continuous',()=>{
 const r=INCOME_TAX_RULES.in;
 close(r.compute({grossIncome:1275000,regime:'new'}).incomeTax,0);
 close(r.compute({grossIncome:1275001,regime:'new'}).incomeTax,1.04,1e-6);
 for(const regime of ['new','old'])for(const threshold of [5000000,10000000,20000000,...(regime==='old'?[50000000]:[])]){
  const allowance=regime==='new'?75000:50000;
  const before=r.compute({grossIncome:threshold+allowance,regime});
  const after=r.compute({grossIncome:threshold+allowance+1,regime});
  assert(after.incomeTax-before.incomeTax<=1.040001);
 }
});
test('Canada 2026 federal slabs, BPA, CPP/CPP2 and EI follow CRA limits',()=>{
 const r=INCOME_TAX_RULES.ca.compute({grossIncome:80000});
 assert.equal(INCOME_TAX_RULES.ca.taxYear,'2026');
 assert.equal(r.taxableIncome,80000); close(r.baseTax,12596.005); close(r.credit,16452*.14);
 close(INCOME_TAX_RULES.ca.compute({grossIncome:258482}).credit,14829*.14);
 assert.equal(INCOME_TAX_RULES.ca.compute({grossIncome:1000}).incomeTax,0);
 close(row(run('cpp',{salary:100000},'ca'),'levy.cpp'),4646.45);
 close(row(run('ei',{salary:100000},'ca'),'levy.ei'),1123.07);
 close(row(run('capital-gains',{purchase:10000,sale:20000,income:60000},'ca'),'result.taxAmount'),1025);
 for(const slug of ['income-tax','salary','cpp','ei','capital-gains'])assert.equal(ruleReview(slug,'ca').period.startsWith('2026'),true);
});
test('US 2026 federal thresholds, FICA cap and securities gains follow official tables',()=>{
 const rules=INCOME_TAX_RULES.us;
 assert.equal(rules.taxYear,'2026');
 for(const [regime,deduction,firstBand]of [['single',16100,12400],['joint',32200,24800],['head',24150,17700]]){
  close(rules.compute({grossIncome:deduction+firstBand,regime}).incomeTax,firstBand*.1);
  close(rules.compute({grossIncome:deduction+firstBand+100,regime}).incomeTax,firstBand*.1+12);
 }
 close(row(run('social-security',{salary:184500}),'levy.socialSecurity'),11439);
 close(row(run('social-security',{salary:200001}),'levy.medicare'),200001*.0145+.009,.01);
 close(row(run('capital-gains',{purchase:10000,sale:20000,income:16100,holding:'long'}),'result.taxAmount'),0);
 close(row(run('capital-gains',{purchase:10000,sale:10100,income:65500,holding:'long'}),'result.taxAmount'),7.5);
 close(row(run('capital-gains',{purchase:10000,sale:11000,income:16100,holding:'short'}),'result.taxAmount'),100);
 for(const slug of ['income-tax','salary','social-security','capital-gains'])assert.equal(ruleReview(slug,'us').period.startsWith('2026'),true);
});
test('UK 2026/27 scoped income, Class 1 NI and ordinary gains match published bands',()=>{
 assert.equal(INCOME_TAX_RULES.gb.taxYear,'2026/27');
 close(INCOME_TAX_RULES.gb.compute({grossIncome:50270,regime:'employee'}).incomeTax,7540);
 close(row(run('national-insurance',{salary:50270},'gb'),'levy.nationalInsurance'),3016);
 close(row(run('capital-gains',{purchase:10000,sale:22600,income:20000},'gb'),'result.taxAmount'),1728);
 for(const slug of ['income-tax','salary','national-insurance','capital-gains'])assert.equal(ruleReview(slug,'gb').period,'2026/27');
});
test('UAE 2026 wage-only scope has zero personal income tax',()=>{
 assert.equal(INCOME_TAX_RULES.ae.taxYear,'2026');
 close(INCOME_TAX_RULES.ae.compute({grossIncome:120000}).incomeTax,0);
 for(const slug of ['income-tax','salary'])assert.equal(ruleReview(slug,'ae').period,'2026');
});

test('Russia 2026 wage bands retain progressive rates and round annual NDFL to whole rubles',()=>{
 const r=INCOME_TAX_RULES.ru;
 assert.equal(r.taxYear,'2026');
 for(const [gross,tax]of [[2400000,312000],[5000000,702000],[6000000,882000],[20000000,3402000],[50000000,9402000],[60000000,11602000],[100003,13000],[100004,13001]])
  assert.equal(r.compute({grossIncome:gross}).incomeTax,tax);
 assert.equal(r.compute({grossIncome:6000000}).marginalRate,18);
 // Exercise the public calculator adapter too: a one-ruble rounded tax delta
 // incorrectly reports0% at6m and100% at a collection step.
 for(const gross of [6000000,6000002,6000003])
  assert.equal(row(run('income-tax',{income:gross,deductions:0},'ru'),'result.marginalRate'),18);
 for(const slug of ['income-tax','salary'])assert.equal(ruleReview(slug,'ru').period,'2026');
});

test('China 2026 wage-only annual IIT uses the national table and actual eligible deductions',()=>{
 for(const [base,tax]of [[36000,1080],[144000,11880],[300000,43080],[420000,73080],[660000,145080],[960000,250080],[1000000,268080]]) {
  close(row(run('income-tax',{income:base+60000,actualSocial:0,otherEligible:0},'cn'),'result.incomeTax'),tax);
 }
 const r=run('salary',{salary:224000,actualSocial:24000,otherEligible:20000},'cn');
 close(row(r,'result.taxableIncome'),120000);close(row(r,'result.incomeTax'),9480);
 close(r.primary.value,190520); // Other eligible deductions reduce tax, not cash twice.
 for(const slug of ['income-tax','salary'])assert.equal(ruleReview(slug,'cn').period,'2026');
 assert.equal(ruleReview('social-security','cn').period,'2026-07 to 2026-12, Beijing');
});

test('Netherlands 2026 wage credits, expat salary norms/cap and employer premiums match official tables',()=>{
 const r=INCOME_TAX_RULES.nl;
 assert.equal(r.taxYear,'2026');
 //80000:38883*.3575+39543*.3756+1574*.495, less labour credit
 //5685-(80000-45592)*.0651; no general credit above78426.
 close(r.compute({grossIncome:80000}).incomeTax,26087.1141);
 // The PDF transposes132290; current web table and formula end at132920.
 close(r.compute({grossIncome:132500}).credit,27.2892);
 close(r.compute({grossIncome:132921}).credit,0);
 close(row(run('30-percent-ruling',{salary:300000},'nl'),'result.exemptAmount'),78600);
 close(run('30-percent-ruling',{salary:300000},'nl').primary.value,38907);
 for(const [qualification,norm]of [['standard',48013],['masters',36497]]){
  const rulingFields=CALCULATORS.find(c=>c.slug==='30-percent-ruling').fields(context('nl'));
  close(resolveFields(rulingFields,{qualification}).find(f=>f.id==='salary').min,norm+.01);
  close(row(run('30-percent-ruling',{salary:norm+.01,qualification},'nl'),'result.exemptAmount'),0);
  close(row(run('30-percent-ruling',{salary:norm+.02,qualification},'nl'),'result.exemptAmount'),.01);
 }
 const p=run('payroll',{salary:100000,holidayPay:0,awf:'low',aof:'low',whk:2,otherCosts:0,actualCostsConfirmed:true},'nl');
 // Annual components rounded separately:2175.81+4978.94+397.05+4843.95+1588.18.
 close(row(p,'result.employerContributions'),13983.93);
 for(const slug of ['income-tax','salary','30-percent-ruling','payroll'])assert.match(ruleReview(slug,'nl').period,/^2026/);
});

test('Germany 2026 basic tariff, solidarity threshold and monthly contribution caps match primary tables',()=>{
 const {germanIncomeTax2026:tax,germanSolidarity2026:soli,germanEmployee2026:employee}=require('../src/config/calculators/reviewed/germanic.ts');
 for(const [base,expected]of [[12348,0],[17799,1034],[69878,18213],[100000,30864],[277826,105551]])assert.equal(tax(base),expected);
 assert.equal(tax(100000.99),30864);close(soli(20350),0);close(soli(20351),.11);close(soli(50000),2750);
 const e=employee(120000,2.69);
 close(e.pension,9430.2);close(e.unemployment,1318.2);close(e.health,6029.88);close(e.care,1674);
 assert.equal(e.taxable,101841);assert.equal(e.tax,31637);close(e.solidarity,1343.15);close(e.net,68567.57);
 const p=run('payroll',{salary:120000,supplement:2.69,u1:0,u2:.44,otherEmployer:0},'de');
 // Employee monthly caps8450/5812.50 also cap employer shares; levy cents
 // round each month, including12.675 insolvency charge to12.68.
 close(row(p,'result.socialContributions'),18033.84);close(row(p,'result.deEmployerLevies'),598.32);
 close(p.primary.value,138632.16);
 for(const rate of ['8','9'])close(run('church-tax',{churchBase:10000,churchRegion:rate},'de').primary.value,Number(rate)*100);
 for(const slug of ['income-tax','salary','social-security','payroll','church-tax'])assert.match(ruleReview(slug,'de').period,/^2026/);
 assert.equal(ruleReview('capital-gains','de').period,'2026');
});

test('Germany 2026 securities separate cent-truncated solidarity from the flat tax illustration',()=>{
 for(const [gain,tax,solidarity]of [[0,0,0],[1,.26,.01],[2,.52,.02],[3,.79,.04],[4,1.05,.05],[100,26.37,1.37],[6000,1582.5,82.5]]){
  const r=run('capital-gains',{purchase:0,sale:gain,remainingAllowance:0},'de');
  close(row(r,'result.taxAmount'),tax);close(row(r,'levy.solidarity'),solidarity);close(r.primary.value,gain-tax);
  close(row(r,'result.incomeTax')+row(r,'levy.solidarity'),tax);
 }
 close(row(run('capital-gains',{purchase:10000,sale:11000,remainingAllowance:1000},'de'),'result.taxAmount'),0);
 close(row(run('capital-gains',{purchase:10000,sale:11002,remainingAllowance:1000},'de'),'result.taxAmount'),.52);
 close(row(run('capital-gains',{purchase:10000,sale:9999,remainingAllowance:0},'de'),'result.taxAmount'),0);
 // Fractional-cent income-tax treatment is an explicit illustration convention.
 close(row(run('capital-gains',{purchase:0,sale:.02,remainingAllowance:0},'de'),'result.taxAmount'),.01);
 close(row(run('capital-gains',{purchase:0,sale:2,income:100000,holding:'short',remainingAllowance:0},'de'),'result.taxAmount'),.52);
 assert.equal(ruleReview('capital-gains','de').period,'2026');
 assert(ruleReview('capital-gains','de').sources.some(s=>s.endsWith('/estg/__52.html')));
 const fields=CALCULATORS.find(c=>c.slug==='capital-gains').fields(context('de'));
 assert.equal(calculatorFieldError(fields.find(f=>f.id==='remainingAllowance'),'1000.01','de'),'max');
 assert.equal(readShareQuery('?country=de&purchase=0&sale=2',fields,5).obsolete,true);
 assert.equal(readShareQuery('?country=de&purchase=0&sale=2&modelVersion=5',fields,5).values.sale,2);
 for(const lang of ['en','de','fr','es','it','nl','pt','tr','ru','ja','zh']){
  const d=require(`../src/lib/i18n/dictionaries/${lang}.json`);
  assert(d['review.scope.deGains'].includes('2026'));assert(!d['review.scope.deGains'].includes('2025'));
 }
});

test('Brazil and Mexico 2026 contributions retain explicit historical INSS arithmetic',()=>{
 const {brazilMonthlyContribution}=require('../src/config/calculators/reviewed/asia.ts');
 close(brazilMonthlyContribution(1621,'2026'),121.58);
 close(brazilMonthlyContribution(5000,'2026'),501.51);
 close(brazilMonthlyContribution(100000,'2026'),988.09);
 close(brazilMonthlyContribution(100000),951.63); // Explicit historical helper default is still2025.
 close(run('social-security',{salary:5000},'br').primary.value,501.51);
 close(run('social-security',{salary:1000,umaPeriod:'jan',days:30},'mx').primary.value,791.77);
 close(run('social-security',{salary:1000,umaPeriod:'feb',days:30},'mx').primary.value,790.27);
 close(run('social-security',{salary:10000,umaPeriod:'feb',days:30},'mx').primary.value,2399.28);
 for(const country of ['br','mx']){
  assert.match(ruleReview('social-security',country).period,/^2026/);
 }
});
test('2026 default 401k limits and current UK residential SDLT bands follow authorities',()=>{
 const k=run('401k',{salary:400000,contribution:30,match:100,matchLimit:15},'us');
 close(row(k,'result.yourContribution'),24500);
 assert.equal(ruleReview('401k','us').period.startsWith('2026'),true);
 close(run('stamp-duty',{price:500000,buyer:'first'},'gb').primary.value,10000);
 close(run('stamp-duty',{price:500001,buyer:'first'},'gb').primary.value,15000.05);
 close(run('stamp-duty',{price:500000,buyer:'additional',nonResident:true},'gb').primary.value,50000);
 assert.equal(ruleReview('stamp-duty','gb').period.startsWith('2026'),true);
});
test('401k match follows actual deferrals and verified year-specific limits',()=>{
 for(const [year,limit]of [['2025',23500],['2026',24500]]){
  const r=run('401k',{taxYear:year,salary:1000000,contribution:30,match:100,matchLimit:15});
  assert.equal(row(r,'result.yourContribution'),limit);assert.equal(row(r,'result.employerMatch'),limit);
 }
 const r=run('401k',{salary:20000,contribution:30,match:100,matchLimit:15});
 assert.equal(row(r,'result.yourContribution'),6000);assert.equal(row(r,'result.employerMatch'),3000);
});
test('Social Security uses the tiered monthly early-claim reductions',()=>{
 for(const [age,adjustment]of [['62',-30],['65',-100*2/15],['67',0],['70',24]])close(row(run('social-security-benefit',{claimAge:age}),'result.claimingAdjustment'),adjustment);
});

test('2026 first-eligible SSA cohort uses indexed earnings, two bends and statutory downward rounding',()=>{
 // Independent hand calculations at each bend and one AIME dollar above it.
 for(const [aime,pia] of [[1286,1157.4],[1287,1157.7],[7749,3225.5],[7750,3225.7],[15000,4313.2]]) {
  const r=run('social-security-benefit',{earnings:aime*12,claimAge:'67'});
  close(row(r,'result.fullBenefit'),pia);
  assert.equal(r.primary.value,Math.floor(pia));
 }
 // Fractional AIME discarded, not rounded; annual indexed earnings have no
 // single-year taxable-wage cap (the former cap corrupted this case).
 close(row(run('social-security-benefit',{earnings:180011.99}),'result.fullBenefit'),4313.2);
 for(const [age,monthly]of [['62',1826],['65',2261],['67',2609],['70',3236]])
  assert.equal(run('social-security-benefit',{earnings:69900,claimAge:age}).primary.value,monthly);
 assert.match(ruleReview('social-security-benefit','us').period,/2026 first eligibility/);
});

test('2026 Swiss and Portuguese standalone employee contributions retain bounded annual arithmetic',()=>{
 for(const [salary,ahv,alv]of [[148199,7854.547,1630.189],[148200,7854.6,1630.2],[200000,10600,1630.2]]) {
  const r=run('social-security',{salary},'ch');
  close(row(r,'levy.ahv'),ahv);close(row(r,'levy.unemploymentInsurance'),alv);
 }
 close(run('social-security',{salary:42000},'pt').primary.value,4620);
 close(row(run('social-security',{salary:42000},'pt'),'result.averageMonthlyContribution'),385);
 for(const c of ['ch','pt'])assert.match(ruleReview('social-security',c).period,/^2026/);
});

test('2026 Vienna contribution and Spanish common-territory savings scale match primary authority',()=>{
 assert.equal(run('church-tax',{churchBase:40000,specialBase:10000},'at').primary.value,429);
 assert.equal(run('church-tax',{churchBase:0,specialBase:0},'at').primary.value,35);
 assert.equal(ruleReview('church-tax','at').reviewed,'2026-10-20');
 for(const [income,rate]of [[0,.19],[6000,.21],[50000,.23],[200000,.27],[300000,.30]]) {
  close(row(run('capital-gains',{purchase:10000,sale:10100,income},'es'),'result.taxAmount'),100*rate);
 }
 close(row(run('capital-gains',{purchase:0,sale:400000,income:0},'es'),'result.taxAmount'),101880);
 assert.equal(ruleReview('capital-gains','es').period,'2026');
});

test('Poland 2026 minimum wage, annual pension cap and unchanged PIT scale are consistent',()=>{
 const {polishEmployeeContributions}=require('../src/lib/finance/tax/poland.ts');
 // Twelve PLN10,000 months: 976 pension +150 disability +245 sickness;
 // monthly health=8629*.09=776.61; annual taxable base=100548.
 const r=INCOME_TAX_RULES.pl.compute({grossIncome:120000});
 assert.equal(INCOME_TAX_RULES.pl.taxYear,'2026');
 assert.equal(r.incomeTax,8466);assert.equal(r.taxableIncome,100548);
 assert.deepEqual(polishEmployeeContributions(120000),{social:16452,health:9319.32,pension:11712,disability:1800,sickness:2940});
 for(const salary of [282600,300000]) {
  const c=polishEmployeeContributions(salary);
  close(c.pension,27581.76);close(c.disability,4239);
 }
 // Individually rounded monthly contributions can differ by one grosz from
 // multiplying the annual ceiling: three PLN83,333.33/34 months then the
 // capped remainder month produce27581.75, not an annual rounding shortcut.
 close(polishEmployeeContributions(1000000).pension,27581.75);
 assert(polishEmployeeContributions(282588).pension<27581.76);
 for(const slug of ['income-tax','salary','social-security']) {
  assert.match(ruleReview(slug,'pl').period,/^2026/);
  const fields=CALCULATORS.find(c=>c.slug===slug).fields(context('pl'));
  assert.equal(fields.find(f=>f.id===(slug==='income-tax'?'income':'salary')).min,57672);
 }
 close(run('social-security',{salary:57672},'pl').primary.value,12385.8);
});
test('Austria 2026 ordinary outside-Vienna wages use indexed tariff and monthly contribution caps',()=>{
 const {austrianEmployee2026}=require('../src/config/calculators/reviewed/germanic.ts');
 // EUR5000 monthly:10.25+3.87+2.95+0.5+0.5%=903.50; annual10842.
 // Taxable49026:8453*.2+14466*.3+12568*.4-496=10561.60.
 assert.deepEqual(austrianEmployee2026(60000),{social:10842,taxable:49026,tax:10561.6,net:38596.4});
 // At6930 monthly, separate component half-cents710.325 and204.435 round up.
 close(austrianEmployee2026(83160).social,15027.12);
 close(austrianEmployee2026(100000).social,15027.12);
 assert(austrianEmployee2026(83159).social<15027.12);
 assert(austrianEmployee2026(40000).taxable>30259); // No transport-credit supplement within scope.
 for(const slug of ['income-tax','salary','social-security']) {
  assert.match(ruleReview(slug,'at').period,/^2026/);
  assert.match(ruleReview(slug,'at').scope,/Outside Vienna/);
 }
 for(const locale of ['en','de','fr','es','it','nl','pt','tr','ru','ja','zh']) {
  const d=require('../src/lib/i18n/dictionaries/'+locale+'.json');
  assert(!d['asia.field.umaPeriod'].includes('2025'));
 }
});

test('Swiss 2026 federal assessment follows current official table including upper tariff transitions',()=>{
 const {swissFederal2026}=require('../src/config/calculators/reviewed/germanic.ts');
 const table=[[18400,0],[18500,25.4],[76200,1152.5],[82100,1502.95],[100000,2684.35],[108900,3271.75],[141500,6140.55],[185100,10936.55],[793900,91298.15],[794000,91310],[800000,92000]];
 for(const [income,tax]of table)close(swissFederal2026(income),tax);
 close(swissFederal2026(100099.99),2684.35); // Taxable income floored toCHF100.
 close(run('salary',{salary:80000,federalTaxable:60000,otherEmployee:5000},'ch').primary.value,69208.6);
 close(run('church-tax',{churchBase:12345.67},'ch').primary.value,1234.57);
 for(const slug of ['income-tax','salary','church-tax'])assert.match(ruleReview(slug,'ch').period,/^2026/);
});

test('Turkiye 2026 regular wages use private-sector ninefold cap and monthly minimum-wage relief',()=>{
 const {asiaWageAmounts}=require('../src/config/calculators/reviewed/asia.ts');
 const minimum=asiaWageAmounts('tr',396360);
 close(minimum.social,59454);assert.equal(minimum.tax,0);assert.equal(minimum.stamp,0);close(minimum.net,336906);
 // Wage tariff on1020000 =237900. Minimum-wage exemption totals57881.23:
 // Jan-Jun4211.33 each, July4537.75, Aug-Dec5615.10 each.
 const wage=asiaWageAmounts('tr',1200000);
 close(wage.social,180000);close(wage.tax,180018.77);close(wage.stamp,6099.6);close(wage.net,833881.63);
 for(const gross of [3567240,4000000])close(asiaWageAmounts('tr',gross).social,535086);
 assert(asiaWageAmounts('tr',3567000).social<535086);
 close(run('social-security',{salary:4000000},'tr').primary.value,535086);
 for(const slug of ['income-tax','salary','social-security'])assert.match(ruleReview(slug,'tr').period,/^2026/);
});

test('Turkiye 2026 eligible severance keeps half-year ceilings and separate kurus amounts',()=>{
 for(const [period,gross,stamp,net]of [['2026-h1',324743.85,2464.81,322279.04],['2026-h2',368649.35,2798.05,365851.30]]){
  const r=run('severance-pay',{salary:80000,years:5,period},'tr');
  close(row(r,'result.grossSeverance'),gross);close(row(r,'result.severanceStampDuty'),stamp);close(r.primary.value,net);
 }
 const fraction=run('severance-pay',{salary:80000,years:1.23,period:'2026-h2'},'tr');
 close(row(fraction,'result.grossSeverance'),90687.74);close(row(fraction,'result.severanceStampDuty'),688.32);close(fraction.primary.value,89999.42);
 close(row(run('severance-pay',{salary:80000,years:1,period:'2025-h1'},'tr'),'result.grossSeverance'),46655.43);
});

test('Portugal 2026 uses current practical IRS offsets, IAS deduction and solidarity',()=>{
 // AT2026 practical table:53400*.446-8441.48=15374.92.
 const regular=run('income-tax',{income:60000,taxCredits:0},'pt');
 close(row(regular,'result.taxableIncome'),53400);close(row(regular,'result.incomeTax'),15374.92);close(regular.primary.value,38025.08);
 //8.54*2026 IAS537.13 ->4587.09, larger than3300 employee social.
 const lower=run('income-tax',{income:30000,taxCredits:0},'pt');
 close(row(lower,'result.taxableIncome'),25412.91);close(row(lower,'result.incomeTax'),4810.65);close(lower.primary.value,21889.35);
 const upper=run('income-tax',{income:100000,taxCredits:0},'pt');
 close(row(upper,'result.romanceSolidarity'),225);close(row(upper,'result.incomeTax'),31557.83);close(upper.primary.value,57442.17);
 close(run('salary',{salary:5000,period:'month',taxCredits:1000},'pt').primary.value,39025.08);
 for(const slug of ['income-tax','salary'])assert.match(ruleReview(slug,'pt').period,/^2026/);
});

test('Portugal solidarity cent rounding is stable across both thresholds and the practical tariff boundary',()=>{
 // AT 2026 practical table and CIRS68-A; independently calculated in integer
 // cents. At taxable80000.20 the solidarity component is exactly half a cent.
 const cases=[[46500,41385,0,31151.57],[89887.63,79999.99,0,52761.47],[89887.64,80000,0,52761.48],
  [89887.65,80000.01,0,52761.49],[89887.87,80000.20,.01,52761.58],
  [97341.57,86634,165.85,56270.87],[97341.58,86634.01,165.85,56271.01],
  [280898.87,249999.99,4250,137137.16],[280898.88,250000,4250,137137.17],
  [280898.89,250000.01,4250,137137.18],[280899.10,250000.20,4250.01,137137.26]];
 for(const slug of ['income-tax','salary'])for(const [gross,taxable,solidarity,net]of cases){
  const result=run(slug,{[slug==='salary'?'salary':'income']:gross,period:'year',taxCredits:0},'pt');
  close(row(result,'result.taxableIncome'),taxable);close(row(result,'result.romanceSolidarity'),solidarity);close(result.primary.value,net);
 }
});

test('Mexico 2026 annual wage ISR selects Annex8 C.II, actual IMSS and subsidy-free bounds',()=>{
 const {asiaWageAmounts}=require('../src/config/calculators/reviewed/asia.ts');
 // Annual table:22282.14+(300000-210403.70)*21.36%=41419.91.
 const ordinary=asiaWageAmounts('mx',300000,12000);
 close(ordinary.tax,41419.91);close(ordinary.social,12000);close(ordinary.taxable,300000);close(ordinary.net,246580.09);
 for(const [income,tax]of [[210403.70,22282.14],[424353.98,67981.92],[5107703.93,1601862.46]])close(asiaWageAmounts('mx',income).tax,tax);
 for(const slug of ['income-tax','salary']) {
  assert.match(ruleReview(slug,'mx').period,/^2026/);
  const c=CALCULATORS.find(c=>c.slug===slug),fields=c.fields(context('mx'));
  assert.equal(fields.find(f=>f.id===(slug==='income-tax'?'income':'salary')).min,180000);
 }
 assert(180000/12>11492.66);assert(180000/12>440.87*31);
});

test('Brazil calendar2026 wages use annual reduction and explicitly selected2026 monthly INSS',()=>{
 const {asiaWageAmounts}=require('../src/config/calculators/reviewed/asia.ts');
 const exempt=asiaWageAmounts('br',60000);close(exempt.social,6018.12);assert.equal(exempt.tax,0);close(exempt.net,53981.88);
 // Annual taxable57600:4935.34 ordinary tax minus1548.33 reduction.
 const partial=asiaWageAmounts('br',72000);close(partial.social,7698.12);close(partial.taxable,57600);close(partial.tax,3387.01);close(partial.net,60914.87);
 close(asiaWageAmounts('br',100000).taxable,82360);close(asiaWageAmounts('br',100000).tax,11744.34);
 // Literal published annual coefficient leaves0.015 ->0.02 at inclusive88200.
 close(asiaWageAmounts('br',88200).tax,8499.32);close(asiaWageAmounts('br',88200.01).tax,8499.34);
 for(const gross of [600000.01,1200000])assert(asiaWageAmounts('br',gross).tax>gross*.1); // No extra minimum tax in wage-only scope.
 for(const slug of ['income-tax','salary'])assert.match(ruleReview(slug,'br').period,/^2026/);
});

test('HELP includes whole-income final tier and zero-payment projection years',()=>{
 assert.equal(row(run('hecs',{income:250000,debt:100000,indexation:0,growth:0},'au'),'result.annualRepayment'),25000);
 const future=run('hecs',{income:60000,debt:30000,indexation:0,growth:10},'au');
 assert.equal(future.primary.labelKey,'result.yearsToClear');assert(future.primary.value>2);
 const horizon=run('hecs',{income:60000,debt:30000,indexation:5,growth:0},'au');
 close(horizon.primary.value,30000*1.05**40,1e-6);assert(horizon.notes.some(n=>n.key==='calc.hecs.horizon'));
});

test('HELP 2026–27 follows literal ATO table bases and preserves historical choice',()=>{
 const {helpRepayment}=require('../src/config/calculators/definitions/retirement.ts');
 for(const [income,expected] of [[0,0],[69528,0],[69529,.15],[85000,2320.8],[86380,2527.8],[129717,9028.35],[129718,9028.17],[137064,10276.99],[186050,18604.61],[186051,18605.1],[254780,25478]])close(helpRepayment(income,'2026–27'),expected);
 // ATO's published second-band base is9028, despite the35-cent band discontinuity.
 close(helpRepayment(85000,'2025–26'),2700);
 close(helpRepayment(125001,'2025–26'),8700.17);
 assert.equal(ruleReview('hecs','au').period,'2026–27 default; optional 2025–26');
 const current=run('hecs',{income:85000,indexation:0,growth:0},'au');
 close(row(current,'result.annualRepayment'),2320.8);
 close(row(run('hecs',{taxYear:'2025–26',income:85000,indexation:0,growth:0},'au'),'result.annualRepayment'),2700);
 close(row(run('hecs',{income:85000,debt:100,indexation:0,growth:0},'au'),'result.annualRepayment'),100);
 assert.equal(run('hecs',{debt:0},'au').primary.value,0);
 const c=CALCULATORS.find(c=>c.slug==='hecs'),ctx=context('au');
 const income=c.fields(ctx).find(f=>f.id==='income');
 assert.equal(calculatorFieldError(income,'85000.5','au'),'integer');
 assert.equal(readShareQuery('?country=au&income=85000',c.fields(ctx),3).obsolete,true);
 assert.equal(readShareQuery('?country=au&income=85000&taxYear=2025%E2%80%9326&modelVersion=3',c.fields(ctx),3).values.taxYear,'2025–26');
 for(const lang of ['en','de','fr','es','it','nl','pt','tr','ru','ja','zh']){
  const d=require(`../src/lib/i18n/dictionaries/${lang}.json`);
  assert(d['review.hecs.repaymentIncome']);assert(d['review.hecs.growth']);assert(d['calc.hecs.note'].includes('{year}'));
 }
});
test('Monthly salary bounds and shared links follow every country and currency precision',()=>{
 for(const country of Object.keys(COUNTRIES)){
  const c=CALCULATORS.find(c=>c.slug==='salary'),base=c.fields(context(country));
  const fields=resolveFields(base,{period:'month'}),salary=fields.find(f=>f.id==='salary');
  assert.equal(calculatorFieldError(salary,salary.min,country),null);
  assert.equal(calculatorFieldError(salary,salary.max,country),null);
  assert.equal(calculatorFieldError(salary,salary.max+1,country),'max');
 }
 const fields=CALCULATORS.find(c=>c.slug==='salary').fields(context('us'));
 assert.equal(readShareQuery('?period=month&salary=3000&country=us',fields).values.salary,3000);
});
test('Measurement fractions are allowed while explicit counts stay integers',()=>{
 const bmi=CALCULATORS.find(c=>c.slug==='bmi').fields(context('us')).find(f=>f.id==='heightCm');
 assert.equal(calculatorFieldError(bmi,170.5),null);
 for(const [slug,id]of [['tip','people'],['paint','coats'],['exponent','root'],['retirement','age']]){
  const field=CALCULATORS.find(c=>c.slug===slug).fields(context('us')).find(f=>f.id===id);
  assert.equal(calculatorFieldError(field,Number(field.default)+.5),'integer');
 }
});
test('Geometry does not invent general perimeters; valid rectangular/circular results remain correct',()=>{
 for(const values of [{shape:'triangle',a:3,b:4,c:2},{shape:'trapezoid',a:10,b:6,c:5}])assert.equal(row(run('area',values),'result.perimeter'),'—');
 close(run('area',{shape:'triangle',a:3,b:4}).primary.value,6);
 close(row(run('area',{shape:'rectangle',a:3,b:4}),'result.perimeter'),14);
 close(run('area',{shape:'circle',a:2}).primary.value,4*Math.PI);
});
test('Undefined aggregate/domain answers remain unavailable rather than zero',()=>{
 assert.equal(row(run('statistics',{values:'5'}),'result.sampleStdDev'),'—');
 assert.equal(row(run('ratio',{a:5,b:0}),'result.decimalRatio'),'—');
 assert.equal(row(run('ratio',{a:0,b:5,scaleTo:20}),'result.scaledPartner'),'—');
 assert.equal(run('gpa',Object.fromEntries([1,2,3,4,5,6].map(i=>['credits'+i,0]))).primary.value,'—');
 assert.equal(run('weighted-grade',Object.fromEntries([1,2,3,4,5].map(i=>['weight'+i,0]))).primary.value,'—');
 assert.equal(run('body-fat',{sex:'male',waist:50,neck:70},'in').primary.value,'—');
 assert.equal(run('retirement',{age:70,retireAge:45}).primary.value,'—');
 assert.equal(row(run('ohms-law',{known:'pv',a:0,b:12}),'result.resistance'),'—');
});
test('CAGR total loss and small quadratic roots remain meaningful',()=>{
 assert.equal(row(run('growth-rate',{from:100,to:0,periods:5}),'result.cagr'),-100);
 assert.equal(row(run('growth-rate',{from:0,to:100,periods:5}),'result.cagr'),'—');
 const roots=run('quadratic-equation',{a:1,b:50,c:.000001}).primary.value.split(',').map(Number);
 assert(roots.every(x=>x!==0));for(const x of roots)close(x*x+50*x+.000001,0,1e-7);
});
test('Converter formulas match affine/reciprocal behavior and tiny results retain magnitude',()=>{
 const temp=CONVERTERS.find(c=>c.category==='temperature');
 assert.equal(conversionFormula(temp,'celsius','fahrenheit'),'°F = °C × 1.8 + 32');
 const fuel=CONVERTERS.find(c=>c.category==='fuel-economy');assert(conversionFormula(fuel,'liters-per-100km','mpg-us').includes(' / '));
 const fmt=context('us').fmt;
 for(const c of CONVERTERS)for(const f of c.units)for(const target of c.units){
  const result=convert(c,.000001,f.id,target.id);
  if(result!==0&&Number.isFinite(result))assert.notEqual(Number(fmt.number(result,{decimals:8}).replaceAll(',','')),0);
 }
 close(convert(CONVERTERS.find(c=>c.category==='angle'),-90,'degree','radian'),-Math.PI/2);
});
test('Number words reject malformed grammar and round-trip signed decimals',()=>{
 for(const words of ['zero thousand','one hundred hundred','twenty ten','one thousand million'])assert.equal(n.wordsToNumber(words),null);
 for(const value of [0,.05,.5,1.5,-1.5,1001.25,999999.99])close(n.wordsToNumber(n.numberToWords(value)),value);
 assert.equal(n.wordsToNumber('one point five'),1.5);
});
test('Leap-day anniversaries agree; unsupported next year is explicitly detected',()=>{
 const birth=d.parseDate('2000-02-29'),on=d.parseDate('2025-02-28');
 assert.equal(d.ageOn(birth,on).years,25);assert.equal(d.toInputValue(d.nextBirthday(birth,on)),'2025-02-28');
 assert.equal(d.isSupportedDate(d.nextBirthday(d.parseDate('2000-01-01'),d.parseDate('9999-12-31'))),false);
});
test('Paint result labels and numerical units agree in US and metric modes',()=>{
 const us=run('paint');assert.equal(us.primary.hintKey,'units.gallons');close(us.primary.value,426*2/350);
 const metric=run('paint',{},'in');assert.equal(metric.primary.hintKey,'units.litres');close(metric.primary.value,(18*2.4-5)*2/12);
});
test('Discovery metadata and split engine groups cover the complete calculator registry',()=>{
 const metadata=require('../src/config/calculators/metadata.json');assert.equal(metadata.length,CALCULATORS.length);
 for(const item of metadata){
  const definition=CALCULATORS.find(c=>c.slug===item.slug);assert.equal(item.version,definition.version);
  const exports=Object.values(require('../src/config/calculators/definitions/'+item.engineGroup+'.ts')).flat();
  assert(exports.some(value=>value&&value.slug===item.slug&&typeof value.compute==='function'),item.slug+' engine missing');
 }
});
