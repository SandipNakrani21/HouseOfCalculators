require('./load-typescript.cjs');
const {JSDOM}=require('jsdom');
const dom=new JSDOM('<!doctype html><body></body>',{url:'https://audit.invalid/'});
for(const key of ['window','document','HTMLElement','Event'])globalThis[key]=key==='window'?dom.window:dom.window[key];
globalThis.self=dom.window;
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
process.env.NEXT_PUBLIC_ADSENSE_CLIENT='ca-pub-6814796122648657';
const test=require('node:test'),assert=require('node:assert/strict');
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
const {LocaleProvider}=require('../src/lib/locale-context.tsx');
const {ConsentBanner,PrivacyChoices}=require('../src/components/consent/ConsentBanner.tsx');
const {storeConsent,readConsent,clearConsent}=require('../src/lib/preferences.ts');
const en=require('../src/lib/i18n/dictionaries/en.json');
let calls;
async function mount(){
 calls=[];window.gtag=(...args)=>calls.push(args);
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
 await act(()=>root.render(React.createElement(LocaleProvider,{localeCode:'en-US',dictionary:en,forcedCountry:'us'},React.createElement(React.Fragment,null,React.createElement(ConsentBanner),React.createElement(PrivacyChoices)))));
 return {host,async close(){await act(()=>root.unmount());host.remove();clearConsent();delete window.__tcfapi;delete window.googlefc;}};
}
async function click(host,label){const button=[...host.querySelectorAll('button')].find(b=>b.textContent===label);assert(button,label);await act(()=>button.click());}
test('Missing and delayed CMP never expose an Accept button after the old four-second timeout',async()=>{
 delete window.__tcfapi;document.cookie='hoc_consent=granted; path=/';
 const app=await mount();
 try{
  await act(async()=>{await new Promise(resolve=>setTimeout(resolve,4300));});
  assert.equal(app.host.querySelector('[role="dialog"]'),null);assert.equal(calls.length,0);
  await click(app.host,en['consent.manage']);assert(app.host.textContent.includes(en['consent.unavailable']));
  assert(![...app.host.querySelectorAll('button')].some(b=>b.textContent===en['consent.accept']));
  let callback;window.__tcfapi=(command,version,listener)=>{if(command==='addEventListener')callback=listener;};
  await act(async()=>{await new Promise(resolve=>setTimeout(resolve,300));});
  await act(()=>callback({gdprApplies:true,listenerId:1},true));
  assert.equal(calls.filter(c=>c[2]?.ad_storage==='granted').length,0);
 }finally{await app.close();}
});
test('A stored outside-region grant is not restored in a TCF region, and management uses Google revocation',async()=>{
 storeConsent('granted');let revoked=0;
 window.__tcfapi=(command,version,callback)=>{if(command==='addEventListener')callback({gdprApplies:true,listenerId:2},true);};
 window.googlefc={callbackQueue:{push(entry){entry.CONSENT_API_READY?.();}},showRevocationMessage(){revoked++;}};
 const app=await mount();
 try{assert.equal(calls.length,0);await click(app.host,en['consent.manage']);assert.equal(revoked,1);assert.equal(calls.at(-1)[2].analytics_storage,'denied');assert.equal(app.host.querySelector('[role="dialog"]'),null);}finally{await app.close();}
});

test('Google callback queue connects explicit purpose choices and never grants unknown or unconfigured purposes',async()=>{
 const {useConsentState}=require('../src/lib/consent-state.ts');
 let modeCallback,tcCallback;
 let values={adStoragePurposeConsentStatus:4,adUserDataPurposeConsentStatus:0,adPersonalizationPurposeConsentStatus:3,analyticsStoragePurposeConsentStatus:4};
 window.googlefc={callbackQueue:{push(entry){if(entry.CONSENT_API_READY)entry.CONSENT_API_READY();if(entry.CONSENT_MODE_DATA_READY)modeCallback=entry.CONSENT_MODE_DATA_READY;}},getGoogleConsentModeValues(){return values;}};
 window.__tcfapi=(command,version,callback)=>{if(command==='addEventListener')tcCallback=callback;};
 const app=await mount();
 try{
  await act(()=>tcCallback({gdprApplies:true,listenerId:5},true));
  await act(()=>modeCallback());assert.equal(calls.at(-1)[2].analytics_storage,'denied');
  document.cookie='_ga=old-id; path=/';
  values={adStoragePurposeConsentStatus:1,adUserDataPurposeConsentStatus:2,adPersonalizationPurposeConsentStatus:0,analyticsStoragePurposeConsentStatus:2};
  await act(()=>modeCallback());
  assert.deepEqual(calls.at(-1)[2],{ad_storage:'granted',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
  assert(!document.cookie.includes('_ga='));assert.equal(typeof useConsentState,'function');
  values={...values,analyticsStoragePurposeConsentStatus:1};
  await act(()=>modeCallback());assert.equal(calls.at(-1)[2].analytics_storage,'granted');
 }finally{await app.close();}
});
test('Verified outside-region choices restore, reopen, revoke and persist the replacement choice',async()=>{
 storeConsent('granted');window.__tcfapi=(command,version,callback)=>{if(command==='addEventListener')callback({gdprApplies:false,listenerId:3},true);};
 const app=await mount();
 try{
  assert.equal(calls.at(-1)[2].ad_storage,'granted');assert.equal(app.host.querySelector('[role="dialog"]'),null);
  await click(app.host,en['consent.manage']);assert(app.host.querySelector('[role="dialog"]'));
  await click(app.host,en['consent.reject']);assert.equal(calls.at(-1)[2].ad_storage,'denied');assert.equal(readConsent(),'denied');
  await click(app.host,en['consent.manage']);await click(app.host,en['consent.accept']);assert.equal(readConsent(),'granted');
 }finally{await app.close();}
});

test('An open tab revokes an expired local grant on return and asks for a new choice',async()=>{
 const {CONSENT_LIFETIME_MS}=require('../src/lib/preferences.ts');
 storeConsent('granted');
 window.__tcfapi=(command,version,callback)=>{if(command==='addEventListener')callback({gdprApplies:false,listenerId:9},true);};
 const app=await mount(),originalNow=Date.now;
 try{
  assert.equal(calls.at(-1)[2].analytics_storage,'granted');
  Date.now=()=>originalNow()+CONSENT_LIFETIME_MS+1000;
  await act(()=>window.dispatchEvent(new Event('focus')));
  assert.equal(calls.at(-1)[2].analytics_storage,'denied');
  assert(app.host.querySelector('[role="dialog"]'));
 }finally{Date.now=originalNow;await app.close();}
});

test('A failing CMP purpose API withdraws an earlier analytics grant without breaking the page',async()=>{
 let callback,fail=false;
 window.googlefc={callbackQueue:{push(entry){if(entry.CONSENT_MODE_DATA_READY)callback=entry.CONSENT_MODE_DATA_READY;}},getGoogleConsentModeValues(){if(fail)throw new Error('CMP unavailable');return{analyticsStoragePurposeConsentStatus:1};}};
 const app=await mount();
 try{
  await act(()=>callback());assert.equal(calls.at(-1)[2].analytics_storage,'granted');
  fail=true;await act(()=>callback());assert.equal(calls.at(-1)[2].analytics_storage,'denied');
 }finally{await app.close();}
});
