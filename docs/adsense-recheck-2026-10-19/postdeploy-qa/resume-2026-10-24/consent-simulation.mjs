// Local source/DOM simulation. No live tags, regional egress or ad traffic.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';

const output = path.dirname(fileURLToPath(import.meta.url));
const root = process.cwd();
const results = [];
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

async function setup(applies, values, stored) {
  const dom = new JSDOM('<div id="test-root"></div>', { url:'https://qa.example.test/en-us', runScripts:'outside-only' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.Event = dom.window.Event;
  let tcfListener;
  let revoked = 0;
  const updates = [];
  window.gtag = (...args) => updates.push(args);
  window.adsbygoogle = [];
  window.adsbygoogle.pauseAdRequests = 1;
  if(applies !== undefined) window.__tcfapi = (command, version, callback) => {
    if(command === 'addEventListener') { tcfListener = callback; callback({gdprApplies:applies,listenerId:7,eventStatus:'tcloaded'},true); }
    else callback({},true);
  };
  const queue = [];
  window.googlefc = {
    callbackQueue:{ push(entry) { queue.push(entry); if(entry.CONSENT_API_READY) entry.CONSENT_API_READY(); if(values && entry.CONSENT_MODE_DATA_READY) entry.CONSENT_MODE_DATA_READY(); } },
    showRevocationMessage:() => revoked++,
    getGoogleConsentModeValues:() => values,
  };
  const cache = new Map();
  const mocks = {
    react:React,
    'react/jsx-runtime':await import('react/jsx-runtime'),
    'next/link':{__esModule:true,default:({href,children,...props})=>React.createElement('a',{href,...props},children)},
    'next/navigation':{usePathname:()=>'/en-us'},
    '@/config/adsense':{ADSENSE_PUBLISHER_ID:'ca-pub-test'},
    '@/config/analytics':{ANALYTICS_ON:true,GA_MEASUREMENT_ID:'G-TEST1234'},
    '@/lib/locale-context':{useLocale:()=>({t:key=>key,base:'/en-us'})},
  };
  function load(name) {
    if(mocks[name]) return mocks[name];
    if(cache.has(name)) return cache.get(name).exports;
    const filename = path.join(root,'src',name.replace(/^@\//,'')) + (name.includes('ConsentBanner')||name.includes('Analytics')?'.tsx':'.ts');
    const source = fs.readFileSync(filename,'utf8');
    const code = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText;
    const compiledModule = {exports:{}}; cache.set(name,compiledModule);
    vm.runInThisContext('(function(exports,require,module){'+code+'\n})',{filename})(compiledModule.exports,load,compiledModule);
    return compiledModule.exports;
  }
  const preferences=load('@/lib/preferences');
  if(stored) preferences.storeConsent(stored);
  const {ConsentBanner,PrivacyChoices}=load('@/components/consent/ConsentBanner');
  const {Analytics}=load('@/components/consent/Analytics');
  const app=createRoot(document.getElementById('test-root'));
  await act(async()=>app.render(React.createElement(React.Fragment,null,React.createElement(ConsentBanner),React.createElement(PrivacyChoices),React.createElement(Analytics))));
  const click=async key=>{
    const button=[...document.querySelectorAll('button')].find(e=>e.textContent===key);
    assert.ok(button,`Missing control: ${key}`);
    await act(async()=>button.click());
  };
  return {dom,app,click,updates,preferences,get revoked(){return revoked;},
    async emit(nextValues) { values=nextValues; await act(async()=>{tcfListener?.({gdprApplies:applies,listenerId:7,eventStatus:'useractioncomplete'},true);for(const entry of [...queue]) entry.CONSENT_MODE_DATA_READY?.();}); },
    async close(){await act(async()=>app.unmount());dom.window.close();}
  };
}

async function check(name, action) { try {await action();results.push({name,pass:true});} catch(error){results.push({name,pass:false,error:String(error)});} }
await check('Unknown CMP: no grant, reject/reopen available, analytics absent',async()=>{
  const s=await setup(undefined);try{
    assert.equal(document.querySelector('#ga-loader'),null);
    await s.click('consent.manage');
    assert.equal([...document.querySelectorAll('button')].some(e=>e.textContent==='consent.acceptWithStats'),false);
    await s.click('consent.rejectWithStats');assert.equal(window.adsbygoogle.pauseAdRequests,1);
    await s.click('consent.manage');assert.ok(document.querySelector('[role="dialog"]'));
  }finally{await s.close();}
});
await check('Outside TCF: accept then revoke/reject clears GA cookies and pauses requests',async()=>{
  const s=await setup(false);try{
    assert.equal(document.querySelector('#ga-loader'),null);
    await s.click('consent.acceptWithStats');
    assert.equal(window.adsbygoogle.pauseAdRequests,0);assert.ok(document.querySelector('#ga-loader'));
    assert.equal(s.preferences.readConsent(),'granted');
    document.cookie='_ga=simulated; path=/';document.cookie='_ga_TEST1234=simulated; path=/';
    await s.click('consent.manage');await s.click('consent.rejectWithStats');
    assert.equal(window.adsbygoogle.pauseAdRequests,1);assert.equal(window['ga-disable-G-TEST1234'],true);
    assert.ok(!document.cookie.includes('_ga='));assert.ok(!document.cookie.includes('_ga_TEST1234='));
    assert.equal(s.preferences.readConsent(),'denied');
  }finally{await s.close();}
});
await check('Stored grant is ignored while CMP context is unknown',async()=>{
  const s=await setup(undefined,undefined,'granted');try{assert.equal(document.querySelector('#ga-loader'),null);assert.equal(window.adsbygoogle.pauseAdRequests,1);}finally{await s.close();}
});
await check('Verified outside-TCF stored choice restores after mount',async()=>{
  const s=await setup(false,undefined,'granted');try{assert.ok(document.querySelector('#ga-loader'));assert.equal(window.adsbygoogle.pauseAdRequests,0);}finally{await s.close();}
});
await check('TCF granular choice: analytics grant does not grant ads; revoke stops analytics',async()=>{
  const s=await setup(true,{adStoragePurposeConsentStatus:2,adUserDataPurposeConsentStatus:2,adPersonalizationPurposeConsentStatus:2,analyticsStoragePurposeConsentStatus:1});try{
    assert.equal(window.adsbygoogle.pauseAdRequests,1);assert.ok(document.querySelector('#ga-loader'));
    await s.click('consent.manage');assert.equal(s.revoked,1);
    await s.emit({adStoragePurposeConsentStatus:2,adUserDataPurposeConsentStatus:2,adPersonalizationPurposeConsentStatus:2,analyticsStoragePurposeConsentStatus:2});
    assert.equal(window['ga-disable-G-TEST1234'],true);assert.equal(window.adsbygoogle.pauseAdRequests,1);
    assert.equal(s.preferences.readConsent(),null);
  }finally{await s.close();}
});
await check('TCF ad-only choice never enables analytics; unknown states fail closed',async()=>{
  const s=await setup(true,{adStoragePurposeConsentStatus:1,adUserDataPurposeConsentStatus:2,adPersonalizationPurposeConsentStatus:2,analyticsStoragePurposeConsentStatus:2});try{
    assert.equal(window.adsbygoogle.pauseAdRequests,0);assert.equal(window.adsbygoogle.requestNonPersonalizedAds,1);assert.equal(document.querySelector('#ga-loader'),null);
    await s.emit({adStoragePurposeConsentStatus:0,adUserDataPurposeConsentStatus:0,adPersonalizationPurposeConsentStatus:0,analyticsStoragePurposeConsentStatus:0});
    assert.equal(window.adsbygoogle.pauseAdRequests,1);assert.equal(document.querySelector('#ga-loader'),null);
  }finally{await s.close();}
});
fs.writeFileSync(path.join(output,'consent-simulation-results.json'),JSON.stringify({at:new Date().toISOString(),method:'Actual React consent/analytics source with jsdom and simulated CMP; no region/network/ad verification',results},null,2));
console.log(JSON.stringify(results,null,2));
if(results.some(r=>!r.pass))process.exitCode=1;
