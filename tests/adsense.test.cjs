require('./load-typescript.cjs');
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
process.env.NEXT_PUBLIC_ADSENSE_CLIENT='ca-pub-6814796122648657';
const {ConsentScript}=require('../src/components/consent/ConsentScript.tsx');
const {readConsentRecord,storeConsent,CONSENT_LIFETIME_MS}=require('../src/lib/preferences.ts');
const {buildShareUrl,readShareQuery}=require('../src/lib/share-link.ts');
const {isAdEligiblePath}=require('../src/config/ad-inventory.ts');
const {CONVERTERS}=require('../src/config/converters/definitions.ts');
const {conversionExamples}=require('../src/config/converters/examples.ts');
const {convert}=require('../src/config/converters/units.ts');

test('Stored grant cookies cannot make the startup script grant any purpose',()=>{
 const html=renderToStaticMarkup(React.createElement(ConsentScript)),source=html.match(/<script>([\s\S]*)<\/script>/)[1];
 for(const cookie of ['hoc_consent=granted','hoc_consent='+encodeURIComponent(JSON.stringify({version:2,choice:'granted',at:Date.now(),scope:'outside-tcf'}))]){
  const window={};vm.runInNewContext(source,{window,document:{cookie}});
  assert.equal(window.dataLayer.length,1);assert.equal(window.dataLayer[0][1],'default');
  for(const key of ['ad_storage','ad_user_data','ad_personalization','analytics_storage'])assert.equal(window.dataLayer[0][2][key],'denied');
 }
});
test('Consent records reject legacy, expired, future, wrong-version and wrong-scope grants',()=>{
 global.document={cookie:''};
 global.window={location:{protocol:'https:'}};
 const record={version:2,choice:'granted',at:Date.now(),scope:'outside-tcf'};
 for(const value of ['granted',{...record,at:Date.now()-CONSENT_LIFETIME_MS-1},{...record,at:Date.now()+10000},{...record,version:1},{...record,scope:'tcf'}]){
  document.cookie='hoc_consent='+encodeURIComponent(typeof value==='string'?value:JSON.stringify(value));assert.equal(readConsentRecord(),null);
 }
 storeConsent('denied');assert.equal(readConsentRecord().choice,'denied');assert(readConsentRecord().at>0);delete global.document;delete global.window;
});
test('Shared inputs stay out of HTTP query parameters, round-trip and retain legacy compatibility',()=>{
 const fields=[{id:'income',kind:'number',default:1,min:1,max:1000000},{id:'period',kind:'select',default:'annual',options:[{value:'annual'},{value:'monthly'}]}];
 const url=new URL(buildShareUrl('https://example.com/salary?utm_source=old#section',{income:80000,period:'annual'},'us'));
 assert.equal(url.search,'');assert(url.hash.startsWith('#calc='));assert.equal(url.pathname,'/salary');
 assert.equal(readShareQuery(url.hash,fields).values.income,80000);assert.equal(readShareQuery('?income=80000&country=us',fields).values.income,80000);
 assert.equal(readShareQuery('#calc=income=1e300',fields),null);
});
test('Non-content routes do not qualify for manually requested ads',()=>{
 for(const route of ['/en-us','/en-us/privacy','/fr-fr/contact','/en-us/design-system','/en-us/calculators','/en-us/tools/date-time','/en-us/countries/us','/en-us/countries/gb/income-tax','/en-us/tools/utility/nonexistent','/_not-found',null])assert.equal(isAdEligiblePath(route),false,route);
 for(const route of ['/en-us/calculators/finance/mortgage','/en-us/converters/temperature','/en-us/converters/temperature/celsius-to-fahrenheit','/en-us/countries/in/income-tax'])assert.equal(isAdEligiblePath(route),true,route);
});
test('Every featured pair has three finite meaningful examples, including offset and reciprocal known answers',()=>{
 let pairs=0;
 for(const converter of CONVERTERS)for(const [from,to]of converter.featuredPairs){
  const values=conversionExamples(converter,from,to);assert.equal(values.length,3);assert.equal(new Set(values).size,3);
  for(const value of values){const output=convert(converter,value,from,to);assert(Number.isFinite(output));assert(Math.abs(convert(converter,output,to,from)-value)<Math.max(1,Math.abs(value))*1e-8);}
  pairs++;
 }
 assert.equal(pairs,61);
 const temp=CONVERTERS.find(c=>c.id==='temperature');assert.equal(convert(temp,0,'celsius','fahrenheit'),32);assert(Math.abs(convert(temp,37,'celsius','fahrenheit')-98.6)<1e-10);
});
