require('./load-typescript.cjs');
const test=require('node:test'), assert=require('node:assert/strict');
const {CALCULATORS}=require('../src/config/calculators/index.ts');
const {COUNTRIES}=require('../src/config/countries.ts');
const {INCOME_TAX_RULES}=require('../src/lib/finance/tax/index.ts');
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
test('Canada 2025 federal slabs and non-refundable BPA are independently correct',()=>{
 const r=INCOME_TAX_RULES.ca.compute({grossIncome:80000});
 assert.equal(r.taxableIncome,80000); close(r.baseTax,12957.5); close(r.credit,2338.705);
 close(INCOME_TAX_RULES.ca.compute({grossIncome:253414}).credit,14538*.145);
 assert.equal(INCOME_TAX_RULES.ca.compute({grossIncome:1000}).incomeTax,0);
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
test('HELP includes whole-income final tier and zero-payment projection years',()=>{
 assert.equal(row(run('hecs',{income:250000,debt:100000,indexation:0,growth:0},'au'),'result.annualRepayment'),25000);
 const future=run('hecs',{income:60000,debt:30000,indexation:0,growth:10},'au');
 assert.equal(future.primary.labelKey,'result.yearsToClear');assert(future.primary.value>2);
 const horizon=run('hecs',{income:60000,debt:30000,indexation:5,growth:0},'au');
 close(horizon.primary.value,30000*1.05**40,1e-6);assert(horizon.notes.some(n=>n.key==='calc.hecs.horizon'));
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
