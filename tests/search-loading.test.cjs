require('./load-typescript.cjs');
const test=require('node:test'),assert=require('node:assert/strict'),Module=require('node:module');
const {JSDOM}=require('jsdom');
const dom=new JSDOM('<!doctype html><body></body>',{url:'https://audit.invalid/'});
for(const name of ['window','document','HTMLElement','Element','Event','KeyboardEvent'])globalThis[name]=name==='window'?dom.window:dom.window[name];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
globalThis.requestAnimationFrame=callback=>setTimeout(callback,0);
globalThis.cancelAnimationFrame=clearTimeout;
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
const navigations=[];
const load=Module._load;
let failCatalogue=false;
Module._load=function(name,...args){
  if(name==='next/navigation')return {useRouter:()=>({push:href=>navigations.push(href)})};
  if(name==='next/link')return {__esModule:true,default:({children,...props})=>React.createElement('a',props,children)};
  if(name==='@/lib/content'&&failCatalogue)throw new Error('Synthetic catalogue failure');
  return load.call(this,name,...args);
};
const {SearchBox}=require('../src/components/search/SearchBox.tsx');
const {LocaleProvider}=require('../src/lib/locale-context.tsx');
const en=require('../src/lib/i18n/dictionaries/en.json');
async function mount(locale='en-US',language='en',country='us'){
  const dictionary={...en,...require('../src/lib/i18n/dictionaries/'+language+'.json')};
  const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
  await act(()=>root.render(React.createElement(LocaleProvider,{localeCode:locale,dictionary,forcedCountry:country},React.createElement(SearchBox))));
  return {host,dictionary,async close(){await act(()=>root.unmount());host.remove();}};
}
async function query(host,text){
  await act(async()=>{
    const input=host.querySelector('input');
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(input,text);
    input.dispatchEvent(new Event('input',{bubbles:true}));
    await new Promise(resolve=>setTimeout(resolve,0));
  });
}
test('Deferred search catalogue loads, supports keyboard navigation and clears after selection',async()=>{
  const app=await mount();
  try{
    assert.equal(app.host.querySelector('[role=listbox]'),null);
    await query(app.host,'mortgage');
    assert(app.host.querySelector('[role=option]'));
    const input=app.host.querySelector('input');
    await act(()=>input.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true})));
    assert(input.getAttribute('aria-activedescendant'));
    await act(()=>input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true})));
    // JSDOM does not implement a search input's native Enter form submission.
    await act(()=>app.host.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
    assert(navigations.at(-1).includes('/en-us/calculators/finance/mortgage'));
    assert.equal(input.value,'');
  }finally{await app.close();}
});
test('Deferred search retains translated country-specific results',async()=>{
  const app=await mount('de-DE','de','de');
  try{await query(app.host,'Einkommensteuer');assert([...app.host.querySelectorAll('[role=option]')].some(e=>e.href.includes('/de-de/countries/de/income-tax')));}
  finally{await app.close();}
});
test('Catalogue loading failure is visible and retry recovers',async()=>{
  const app=await mount();
  try{
    failCatalogue=true;await query(app.host,'mortgage');
    assert(app.host.textContent.includes(en['error.title']));
    const retry=[...app.host.querySelectorAll('button')].find(e=>e.textContent===en['error.retry']);assert(retry);
    failCatalogue=false;await act(async()=>{retry.click();await new Promise(resolve=>setTimeout(resolve,0));});
    assert(app.host.querySelector('[role=option]'));assert(!app.host.textContent.includes(en['error.title']));
  }finally{failCatalogue=false;await app.close();}
});
