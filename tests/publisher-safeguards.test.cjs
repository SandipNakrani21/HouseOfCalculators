require('./load-typescript.cjs');
const {JSDOM}=require('jsdom');
const dom=new JSDOM('<!doctype html><body></body>',{url:'https://audit.invalid/en-us/calculators/health/bmi?weight=private#calc=private',referrer:'https://audit.invalid/previous?income=private#secret'});
for(const key of ['window','document','HTMLElement','Event'])globalThis[key]=key==='window'?dom.window:dom.window[key];
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
process.env.NEXT_PUBLIC_GA_ID='G-TEST12345';
process.env.NEXT_PUBLIC_ADSENSE_CLIENT='ca-pub-6814796122648657';
const test=require('node:test'),assert=require('node:assert/strict');
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
const Module=require('node:module'),originalLoad=Module._load;
let route='/en-us/calculators/health/bmi';
Module._load=function(id,...args){
 if(id==='next/navigation')return{usePathname:()=>route};
 // Node resolves the sibling JSON before the TS module; Next resolves TS.
 if(id==='@/config/ad-inventory')return originalLoad.call(this,require('node:path').resolve(__dirname,'../src/config/ad-inventory.ts'),...args);
 return originalLoad.call(this,id,...args);
};
const {Analytics}=require('../src/components/consent/Analytics.tsx');
const {AdSlot}=require('../src/components/ui/AdSlot.tsx');
const {RevealObserver}=require('../src/components/motion/RevealObserver.tsx');
Module._load=originalLoad;
const {publishConsent}=require('../src/lib/consent-state.ts');
const {LocaleProvider}=require('../src/lib/locale-context.tsx');
const en=require('../src/lib/i18n/dictionaries/en.json');
const denied={ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'};
async function mount(Component,props={}){
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
 const render=()=>act(()=>root.render(React.createElement(LocaleProvider,{localeCode:'en-US',dictionary:en,forcedCountry:'us'},React.createElement(Component,props))));
 await render();return{host,render,async close(){await act(()=>root.unmount());host.remove();}};
}
test('Analytics sends nothing before explicit grant, strips sensitive locations/referrers and stops on withdrawal',async()=>{
 const calls=[];window.gtag=(...args)=>calls.push(args);publishConsent(denied,false);
 const app=await mount(Analytics);
 try{
  assert.equal(document.querySelector('#ga-loader'),null);assert.equal(calls.length,0);
  await act(()=>publishConsent({...denied,analytics_storage:'granted'}));
  assert(document.querySelector('#ga-loader'));assert.equal(calls.filter(c=>c[1]==='page_view').length,1);
  assert(!JSON.stringify(calls).includes('private'));assert(!JSON.stringify(calls).includes('secret'));
  const config=calls.find(c=>c[0]==='config')[2];assert.equal(config.allow_google_signals,false);assert.equal(config.allow_ad_personalization_signals,false);
  document.cookie='_ga=old; path=/';await act(()=>publishConsent(denied));
  assert.equal(window['ga-disable-G-TEST12345'],true);assert(!document.cookie.includes('_ga='));
  const sent=calls.filter(c=>c[1]==='page_view').length;route='/en-us/calculators/finance/mortgage';await app.render();
  assert.equal(calls.filter(c=>c[1]==='page_view').length,sent);
  await act(()=>publishConsent({...denied,analytics_storage:'granted'}));assert.equal(document.querySelectorAll('#ga-loader').length,1);assert.equal(window['ga-disable-G-TEST12345'],false);
 }finally{await app.close();document.querySelector('#ga-loader')?.remove();}
});
test('Manual ads wait for a visible usable position and are never initialized twice on resize',async()=>{
 let hidden=true,width=300,height=100,resize;route='/en-us/calculators/finance/mortgage';
 Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>hidden?'hidden':'visible'});
 Object.defineProperty(HTMLElement.prototype,'offsetWidth',{configurable:true,get:()=>width});
 Object.defineProperty(HTMLElement.prototype,'clientHeight',{configurable:true,get:()=>height});
 globalThis.ResizeObserver=class{constructor(callback){resize=callback;}observe(){}disconnect(){}};
 window.adsbygoogle=[];const app=await mount(AdSlot,{slot:'test',placement:'leaderboard'});
 try{
  assert.equal(window.adsbygoogle.length,0);assert.equal(app.host.querySelector('ins'),null);
  hidden=false;await act(()=>document.dispatchEvent(new Event('visibilitychange')));
  assert.equal(window.adsbygoogle.length,1);assert.equal(app.host.querySelector('ins').style.height,'100px');
  height=90;await act(()=>resize());assert.equal(window.adsbygoogle.length,1);assert.equal(app.host.querySelector('ins').style.height,'90px');
  route='/en-us/privacy';await app.render();assert.equal(app.host.querySelector('ins'),null);assert.equal(window.adsbygoogle.length,1);
 }finally{await app.close();}
});
test('Reveal animations keep keyboard targets visible and reveal sections taller than the viewport',async()=>{
 let intersect;
 globalThis.Element=dom.window.Element;
 globalThis.MutationObserver=dom.window.MutationObserver;
 window.IntersectionObserver=globalThis.IntersectionObserver=class{constructor(callback){intersect=callback;}observe(){}unobserve(){}disconnect(){}};
 const section=document.createElement('section');section.dataset.reveal='up';
 const button=document.createElement('button');button.textContent='Focus target';section.append(button);document.body.append(section);
 const app=await mount(RevealObserver);
 try{
  intersect([{target:section,isIntersecting:true,intersectionRatio:0.01,boundingClientRect:{height:window.innerHeight*20}}]);
  assert(section.classList.contains('is-visible'));
  section.classList.remove('is-visible');button.focus();assert(section.classList.contains('is-visible'));
  intersect([{target:section,isIntersecting:false,intersectionRatio:0,boundingClientRect:{height:100}}]);
  assert(section.classList.contains('is-visible'),'A focused control must remain visible');
 }finally{await app.close();section.remove();delete window.IntersectionObserver;delete globalThis.IntersectionObserver;}
});

test('Every launch language has explicit review scope and health applicability text',()=>{
 const {LOCALES}=require('../src/config/locales.ts');
 const {reviewScopeKey,healthReferences,ruleReview}=require('../src/config/calculators/provenance.ts');
 const {CALCULATORS}=require('../src/config/calculators/index.ts');
 for(const locale of Object.values(LOCALES).filter(l=>l.launch)){
  const dictionary=require('../src/lib/i18n/dictionaries/'+locale.language+'.json');
  for(const calc of CALCULATORS)for(const country of calc.countries){
   if(ruleReview(calc.slug,country))assert(dictionary[reviewScopeKey(calc.slug,country)],locale.code+':'+calc.slug);
   const health=healthReferences(calc.slug);if(health)assert(dictionary[health.scopeKey]);
  }
 }
});
