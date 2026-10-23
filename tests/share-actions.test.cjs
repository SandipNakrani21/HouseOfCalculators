require('./load-typescript.cjs');
const {JSDOM}=require('jsdom');
const dom=new JSDOM('<!doctype html><body></body>',{url:'https://audit.invalid/en-us/countries/us/salary'});
for(const k of ['window','document','HTMLElement','Element','Event','MouseEvent'])globalThis[k]=k==='window'?dom.window:dom.window[k];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const test=require('node:test'),assert=require('node:assert/strict');
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
const {LocaleProvider}=require('../src/lib/locale-context.tsx');
const {ToastProvider}=require('../src/components/ui/Toast.tsx');
const {ActionBar}=require('../src/components/ui/ActionBar.tsx');
const en=require('../src/lib/i18n/dictionaries/en.json');
const link='https://audit.invalid/en-us/countries/us/salary#calc=salary=12345&country=us&modelVersion=13';

test('Share platform branches retain usable links and treat native cancellation as intentional',async t=>{
 for(const branch of ['success','cancel','denied','unsupported','cannot-share','clipboard-denied','legacy-copy','clipboard-missing'])await t.test(branch,async()=>{
  const written=[],shared=[];let legacy=0;
  window.history.replaceState(null,'','/en-us/countries/us/salary');
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:branch==='clipboard-missing'?undefined:{writeText:async text=>{if(['clipboard-denied','legacy-copy'].includes(branch))throw Error('Denied');written.push(text);}}});
  Object.defineProperty(navigator,'share',{configurable:true,value:['unsupported','clipboard-denied','legacy-copy','clipboard-missing'].includes(branch)?undefined:async data=>{shared.push(data);if(branch==='cancel'){const e=new Error('Cancelled');e.name='AbortError';throw e;}if(branch==='denied')throw Error('NotAllowedError');}});
  Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>branch!=='cannot-share'});
  document.execCommand=()=>{legacy++;return branch==='legacy-copy';};
  const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
  await act(()=>root.render(React.createElement(LocaleProvider,{localeCode:'en-US',dictionary:en,forcedCountry:'us'},React.createElement(ToastProvider,{closeLabel:'Close'},React.createElement(ActionBar,{onReset(){},shareUrl:()=>link,shareTitle:'Salary'})))));
  try{
   const share=[...host.querySelectorAll('button')].find(b=>b.textContent.trim()===en['actions.share']);assert(share);
   await act(async()=>{share.click();await Promise.resolve();await Promise.resolve();});
   if(branch==='success'){assert.deepEqual(shared,[{title:'Salary',url:link}]);assert.equal(written.length,0);}
   else if(branch==='cancel'){assert.equal(written.length,0);assert.equal(legacy,0);assert.equal(window.location.hash,'');assert(!host.textContent.includes(en['toast.copyFailed']));}
   else if(branch==='clipboard-denied'||branch==='clipboard-missing'){assert.equal(legacy,1);assert.equal(window.location.href,link);assert(host.textContent.includes(en['toast.copyFailed']));assert(!host.textContent.includes(en['toast.linkCopied']));}
   else if(branch==='legacy-copy'){assert.equal(legacy,1);assert(host.textContent.includes(en['toast.linkCopied']));}
   else{assert.deepEqual(written,[link]);assert(host.textContent.includes(en['toast.linkCopied']));}
   assert.equal(host.querySelector('textarea'),null,'Temporary clipboard node must be removed');
  }finally{await act(()=>root.unmount());host.remove();}
 });
});
