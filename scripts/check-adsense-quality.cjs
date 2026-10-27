/* eslint-disable @typescript-eslint/no-require-imports -- Focused source regression checks run in Node.js. */
const assert=require('node:assert/strict');
const Module=require('node:module');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const React=require('react');
const {createRoot}=require('react-dom/client');
require('./load-typescript.cjs');
const {formatGuideExample}=require('../src/lib/guide-example-format.ts');
assert.equal(formatGuideExample('200,000','de-DE'),'200.000');
assert.equal(formatGuideExample('1,288.60','de-DE'),'1.288,60');
assert.equal(formatGuideExample('6% ÷ 12 = 0.005','de-DE'),'6% ÷ 12 = 0,005');
assert.equal(formatGuideExample('1.005³⁰⁰ ≈ 4.4650','de-DE'),'1,005³⁰⁰ ≈ 4,4650');
assert.equal(formatGuideExample('1,288.60','en-US'),'1,288.60');
assert.equal(formatGuideExample('120 ÷ 1.20 = 100.00','it-IT'),'120 ÷ 1,20 = 100,00');
const {GUIDES}=require('../src/config/guides/definitions.ts');
const {LOCALES}=require('../src/config/locales.ts');
const samples=[];
for(const locale of Object.values(LOCALES).filter(x=>x.launch)){
 for(const guide of GUIDES.filter(x=>x.workedExample)){
  const example=guide.workedExample;
  samples.push({locale:locale.path,guide:guide.slug,values:[...example.rows.map(row=>formatGuideExample(row.value,locale.code)),formatGuideExample(example.resultValue,locale.code)]});
 }
}
fs.writeFileSync('docs/seo-full-audit-2026-10-24/adsense-guide-format-results.json',JSON.stringify(samples,null,2)+'\n');
const dom=new JSDOM('<div id="root"></div>',{url:'https://example.test/en-us/calculators/finance/loan'});
global.window=dom.window;global.document=dom.window.document;global.IS_REACT_ACT_ENVIRONMENT=true;
let observe;let width=728,height=90;
global.ResizeObserver=class{constructor(callback){observe=callback;}observe(){}disconnect(){}};
Object.defineProperty(dom.window.HTMLElement.prototype,'offsetWidth',{get(){return width;}});
Object.defineProperty(dom.window.HTMLElement.prototype,'clientWidth',{get(){return Math.round(width);}});
Object.defineProperty(dom.window.HTMLElement.prototype,'clientHeight',{get(){return height;}});
dom.window.HTMLElement.prototype.getBoundingClientRect=function(){return {x:0,y:0,left:0,top:0,right:width,bottom:height,width,height};};
Object.defineProperty(document,'visibilityState',{value:'visible'});
let requests=0;
window.adsbygoogle={push(){requests++;const ad=document.querySelector('ins');ad.style.width=width+'px';}};
const load=Module._load;
Module._load=function(name,...args){
 if(name==='next/navigation')return {usePathname:()=>'/en-us/calculators/finance/loan'};
 if(name==='@/lib/locale-context')return {useLocale:()=>({t:key=>key})};
 if(name==='@/lib/ads')return {ADSENSE_CLIENT:'ca-pub-fixture',ADS_LIVE:true,AD_PLACEHOLDERS:false,AD_UNITS:{leaderboard:'123',rectangle:'456',rail:'789'}};
 return load.call(this,name,...args);
};
(async()=>{
 const {AdSlot}=require('../src/components/ui/AdSlot.tsx');const root=createRoot(document.getElementById('root'));
 try{
 await React.act(async()=>root.render(React.createElement(AdSlot,{slot:'fixture',placement:'leaderboard'})));
 const ad=document.querySelector('ins');assert.ok(ad);assert.equal(requests,1);
 assert.equal(ad.style.maxWidth,'100%');
 assert.equal(ad.closest('.ad-slot').style.containerType,'inline-size');
 assert.equal(ad.closest('.ad-slot').style.containerName,'ad-space');
 assert.equal(ad.parentElement.className,'ad-creative');
 assert.ok(document.querySelector('style').textContent.includes('(width < 728px)'));
 width=320;height=100;await React.act(async()=>observe());
 assert.equal(document.querySelector('ins'),ad);assert.equal(requests,1);assert.equal(ad.style.height,'');
 assert.ok(document.querySelector('style').textContent.includes('(width < 728px)'));
 assert.equal(ad.getAttribute('data-ad-format'),'horizontal');
 width=728;height=90;await React.act(async()=>observe());assert.equal(requests,1);
 width=704.6666870117188;
 await React.act(async()=>root.render(React.createElement(AdSlot,{key:'fractional',slot:'fractional-fixture',placement:'leaderboard'})));
 const fractionalAd=document.querySelector('ins');
 assert.ok(fractionalAd);assert.notEqual(fractionalAd,ad);assert.equal(requests,2);
 assert.ok(document.querySelector('style').textContent.includes('(width < 704px)'));
 width=320;await React.act(async()=>observe());
 assert.equal(document.querySelector('ins'),fractionalAd);assert.equal(requests,2);
 width=704.6666870117188;await React.act(async()=>observe());
 assert.equal(document.querySelector('ins'),fractionalAd);assert.equal(requests,2);
 console.log(`${samples.length} guide/locale example sets recorded; localized numeric assertions and ad-node resize/no-repeat-request regression passed.`);
 }finally{await React.act(async()=>root.unmount());dom.window.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
