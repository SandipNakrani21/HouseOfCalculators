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
 window.googlefc={showRevocationMessage(){revoked++;}};
 const app=await mount();
 try{assert.equal(calls.length,0);await click(app.host,en['consent.manage']);assert.equal(revoked,1);assert.equal(app.host.querySelector('[role="dialog"]'),null);}finally{await app.close();}
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
