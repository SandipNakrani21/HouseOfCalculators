/* eslint-disable @typescript-eslint/no-require-imports -- Execute pure project models, not a browser. */
require('../tests/load-typescript.cjs');
const fs=require('node:fs'),assert=require('node:assert/strict');
fs.mkdirSync('docs/adsense-recheck-2026-10-19/postdeploy-qa',{recursive:true});
const {CALCULATORS}=require('../src/config/calculators/index.ts');
const {isCalculatorPublished}=require('../src/config/calculators/publication.ts');
const {COUNTRIES}=require('../src/config/countries.ts');
const {LOCALES}=require('../src/config/locales.ts');
const {translate}=require('../src/lib/i18n/core.ts');
const {createFormatter}=require('../src/lib/format.ts');
const {resolveFields,calculatorRules,calculatorFieldError}=require('../src/lib/validation.ts');
const {buildShareUrl,readShareQuery}=require('../src/lib/share-link.ts');
const en=require('../src/lib/i18n/dictionaries/en.json');
const locales=Object.values(LOCALES).filter(l=>l.launch);
const report={at:new Date().toISOString(),scope:'Every configured supported and published calculator/country pair. All select/toggle combinations up to 128 scenarios; larger repeated-grade matrices use every option of every control and joint uniform vectors. Numeric boundaries and invalid inputs are checked per visible field (once for unchanged repeated-grade fields); defaults and translated labels are checked in every public locale. Pure-model/translation checks, not browser coverage, exhaustive numeric permutations or independent statutory certification.',locales:locales.map(l=>l.code),pairs:[],localeDefaults:[],translationFindings:[],failures:[],excluded:[]};
const dictionaryCache=new Map(),checkedKeys=new Set();
function dictionary(locale){
 if(!dictionaryCache.has(locale.code)){
  const native=require('../src/lib/i18n/dictionaries/'+locale.language+'.json');
  const regionalFile='src/lib/i18n/dictionaries/regional/'+locale.code+'.json';
  const regional=fs.existsSync(regionalFile)?JSON.parse(fs.readFileSync(regionalFile)):{};
  const own={...native,...regional};dictionaryCache.set(locale.code,{own,merged:{...en,...own}});
 }
 return dictionaryCache.get(locale.code);
}
function context(country,locale){
 const {own,merged}=dictionary(locale);
 const t=(key,params)=>{
  const identity=locale.code+':'+key;
  if(!checkedKeys.has(identity)){
   checkedKeys.add(identity);
   if(!(key in own))report.translationFindings.push({locale:locale.code,key,issue:'Missing translation key'});
   else if(key in en){
    const slots=s=>[...s.matchAll(/\{([\w]+)\}/g)].map(m=>m[1]).sort().join(',');
    if(slots(own[key])!==slots(en[key]))report.translationFindings.push({locale:locale.code,key,issue:'Placeholder mismatch'});
    if(!String(own[key]).trim())report.translationFindings.push({locale:locale.code,key,issue:'Empty translation'});
   }
  }
  return translate(merged,key,params);
 };
 return {countryCode:country,country:COUNTRIES[country],t,fmt:createFormatter(country,locale.language,t)};
}
function numeric(result){
 const out=[];
 function visit(value,at){if(typeof value==='number'){assert(Number.isFinite(value),'Non-finite output '+at);out.push([at,value]);}else if(value&&typeof value==='object')for(const [key,child]of Object.entries(value))visit(child,at+'.'+key);}
 visit(result,'result');return out;
}
function copy(calc,ctx,fields,result){
 const params=calc.params?.(ctx);ctx.t(calc.titleKey,params);ctx.t(calc.descKey,params);
 for(const f of fields){ctx.t(f.labelKey,params);if(f.hintKey)ctx.t(f.hintKey,params);for(const o of f.options||[])if(o.labelKey)ctx.t(o.labelKey,params);}
 for(const r of [result.primary,...result.rows,...result.chart||[]]){ctx.t(r.labelKey,params);if(r.hintKey)ctx.t(r.hintKey,params);}
 for(const n of result.notes||[])ctx.t(n.key,{...params,...n.params});
 for(const key of calc.explainerKeys||[])ctx.t(key,params);
 for(const key of calc.faqKeys||[]){ctx.t(key+'.q',params);ctx.t(key+'.a',params);}
}
const english=locales.find(l=>l.code==='en-US');
for(const calc of CALCULATORS)for(const country of calc.countries){
 if(!isCalculatorPublished(calc,country)){report.excluded.push({slug:calc.slug,country});continue;}
 const ctx=context(country,english),base=calc.fields(ctx),defaults=Object.fromEntries(base.map(f=>[f.id,f.default]));
 const rec={slug:calc.slug,country,currency:COUNTRIES[country].currency.code,computed:0,fieldRejected:0,domainRejected:0,invalidRejected:0,selectionCombinations:0};
 try{
  const baseline=calc.compute(defaults,ctx),baselineNumbers=numeric(baseline);copy(calc,ctx,resolveFields(base,defaults),baseline);
  const choices=base.filter(f=>f.kind==='select'||f.kind==='toggle');
  const cartesianCount=choices.reduce((n,f)=>n*(f.kind==='toggle'?2:f.options.length),1);
  rec.cartesianSize=cartesianCount;
  let selections=[{}];for(const f of choices){
   const options=f.kind==='toggle'?[false,true]:f.options.map(o=>o.value);
   selections=cartesianCount<=128?selections.flatMap(s=>options.map(value=>({...s,[f.id]:value}))):[...selections,...options.map(value=>({[f.id]:value}))];
  }
  if(cartesianCount>128){
   const maxOptions=Math.max(...choices.map(f=>f.kind==='toggle'?2:f.options.length));
   for(let i=0;i<maxOptions;i++)selections.push(Object.fromEntries(choices.map(f=>[f.id,f.kind==='toggle'?Boolean(i%2):f.options[i%f.options.length].value])));
   selections=[...new Map(selections.map(s=>[JSON.stringify(s),s])).values()];
  }
  rec.selectionProfile=cartesianCount<=128?'all combinations':'each control option and uniform vectors';
  rec.selectionCombinations=selections.length;
  const run=(values,requiredRejection)=>{
   const visible=resolveFields(base,values).filter(f=>!f.visibleWhen||f.visibleWhen(values));
   const errors=visible.filter(f=>calculatorFieldError(f,values[f.id],country));
   if(requiredRejection){assert(errors.some(f=>f.id===requiredRejection),'Invalid input accepted for '+requiredRejection);rec.invalidRejected++;return;}
   if(errors.length){rec.fieldRejected++;return;}
   if(calc.validate?.(values,ctx)){rec.domainRejected++;return;}
   const result=calc.compute(values,ctx);numeric(result);assert.deepEqual(result,calc.compute(values,ctx),'Non-deterministic output');copy(calc,ctx,visible,result);
   const url=buildShareUrl('https://thecalculatorshouse.com/example',values,country,calc.version);
   const restored=readShareQuery(new URL(url).hash,base,calc.version);assert.deepEqual(restored.values,values,'Share round trip changed values');assert.equal(restored.country,country);
   rec.computed++;
  };
  run(defaults);
  for(const [selectionIndex,choice] of selections.entries()){
   const values={...defaults,...choice};run(values);
   if(cartesianCount>128&&selectionIndex>0)continue;
   for(const f of resolveFields(base,values).filter(f=>(!f.visibleWhen||f.visibleWhen(values))&&!['select','toggle','text'].includes(f.kind))){
    const rules=calculatorRules(f,country);
    for(const value of [rules.min,rules.max])run({...values,[f.id]:value});
    for(const value of ['', 'abc', rules.min-1, rules.max+1, Infinity])run({...values,[f.id]:value},f.id);
   }
  }
  for(const locale of locales){
   const local=context(country,locale),fields=calc.fields(local),values=Object.fromEntries(fields.map(f=>[f.id,f.default]));
   const result=calc.compute(values,local);assert.deepEqual(numeric(result),baselineNumbers,'Locale changed numeric results');copy(calc,local,resolveFields(fields,values),result);
   report.localeDefaults.push({locale:locale.code,slug:calc.slug,country,currency:COUNTRIES[country].currency.code,pass:true});
  }
 }catch(error){report.failures.push({slug:calc.slug,country,error:String(error)});}
 report.pairs.push(rec);
}
// Full public dictionaries: completeness and interpolation structure, distinct from semantic certification.
for(const locale of locales){const ctx=context(locale.defaultCountry,locale);for(const key of Object.keys(en))ctx.t(key);}
report.summary={calculators:CALCULATORS.length,countries:Object.keys(COUNTRIES).length,supportedPublishedPairs:report.pairs.length,localeCountryDefaults:report.localeDefaults.length,computed:report.pairs.reduce((n,r)=>n+r.computed,0),invalidRejected:report.pairs.reduce((n,r)=>n+r.invalidRejected,0),fieldRejected:report.pairs.reduce((n,r)=>n+r.fieldRejected,0),domainRejected:report.pairs.reduce((n,r)=>n+r.domainRejected,0),translationKeys:checkedKeys.size,translationFindings:report.translationFindings.length,failures:report.failures.length};
fs.writeFileSync('docs/adsense-recheck-2026-10-19/postdeploy-qa/completion-2026-10-24-supported-matrix.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({...report.summary,failures:report.failures,translationFindings:report.translationFindings.slice(0,30)},null,2));
if(report.failures.length||report.translationFindings.length)process.exitCode=1;
