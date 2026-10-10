require('./load-typescript.cjs');
const {JSDOM}=require('jsdom');
// Local component DOM only: no website navigation, HTTP requests or browser automation.
const dom=new JSDOM('<!doctype html><body></body>',{url:'https://audit.invalid/'});
for(const key of ['window','document','HTMLElement','Element','Event','MouseEvent','KeyboardEvent','MutationObserver'])globalThis[key]=key==='window'?dom.window:dom.window[key];
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
globalThis.requestAnimationFrame=cb=>setTimeout(cb,0);
globalThis.cancelAnimationFrame=clearTimeout;
window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
Object.defineProperty(HTMLElement.prototype,'offsetParent',{get(){return this.parentElement;}});
const test=require('node:test'),assert=require('node:assert/strict');
const React=require('react'),{act}=React,{createRoot}=require('react-dom/client');
const {LocaleProvider}=require('../src/lib/locale-context.tsx');
const {ToolValidationProvider,NumberInput,ToolButton}=require('../src/components/tools/ValidatedInput.tsx');
const {PasswordGeneratorTool}=require('../src/components/tools/UtilityTools.tsx');
const {RandomPickerTool,DiceRollerTool}=require('../src/components/tools/RandomTools.tsx');
const {Modal}=require('../src/components/ui/Modal.tsx');
const en=require('../src/lib/i18n/dictionaries/en.json');
async function mount(Component,locale='en-US',dictionary=en){
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
 const render=element=>act(()=>root.render(React.createElement(LocaleProvider,{localeCode:locale,dictionary,forcedCountry:'us'},React.createElement(ToolValidationProvider,null,element))));
 await render(React.createElement(Component));
 return {host,render,async close(){await act(()=>root.unmount());host.remove();}};
}
function button(host,text){const found=[...host.querySelectorAll('button')].find(b=>b.textContent.trim()===text);assert(found,`Button missing: ${text}`);return found;}
async function input(element,value){assert(element);await act(()=>{const proto=element.tagName==='TEXTAREA'?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(element,value);element.dispatchEvent(new Event('input',{bubbles:true}));});}
async function click(element){await act(async()=>{element.click();await Promise.resolve();});}
test('Password configuration edits invalidate old password, entropy and copy availability',async()=>{
 const app=await mount(PasswordGeneratorTool);
 try{
  await click(button(app.host,en['tool.action.generate']));assert.equal(button(app.host,en['tool.action.copyPassword']).disabled,false);
  await input(app.host.querySelector('input[type="text"]'),'64');
  assert.equal(button(app.host,en['tool.action.copyPassword']).disabled,true);
  assert(!app.host.textContent.includes('bits'));
  await click(button(app.host,en['tool.action.generate']));assert.equal(button(app.host,en['tool.action.copyPassword']).disabled,false);
  await click(app.host.querySelector('input[type="checkbox"]'));assert.equal(button(app.host,en['tool.action.copyPassword']).disabled,true);
 }finally{await app.close();}
});
test('Picker team settings do not disable pick/shuffle after list shrinks; old result clears',async()=>{
 const app=await mount(RandomPickerTool);
 try{
  await input(app.host.querySelector('input[type="text"]'),'8');
  await click(button(app.host,en['tool.action.pickOne']));assert(app.host.querySelector('.result-box'));
  await input(app.host.querySelector('textarea'),'A\nB');
  assert.equal(button(app.host,en['tool.action.pickOne']).disabled,false);
  assert.equal(button(app.host,en['tool.action.shuffle']).disabled,false);
  assert.equal(button(app.host,en['tool.action.makeTeams']).disabled,true);
  assert.equal(app.host.querySelector('.result-box'),null);
 }finally{await app.close();}
});
test('Cosmetic zero edits cannot clear a persistent domain validation error',async()=>{
 function Harness(){const [value,set]=React.useState(0);return React.createElement(React.Fragment,null,React.createElement(NumberInput,{value,onValueChange:set,errorKey:value===0?'validation.zeroDenominator':undefined}),React.createElement(ToolButton,null,'Act'));}
 const app=await mount(Harness);
 try{assert.equal(button(app.host,'Act').disabled,true);await input(app.host.querySelector('input'),'0.0');assert.equal(button(app.host,'Act').disabled,true);await input(app.host.querySelector('input'),'1');assert.equal(button(app.host,'Act').disabled,false);}finally{await app.close();}
});
test('Changing dice count clears the previous draw',async()=>{
 const app=await mount(DiceRollerTool);
 try{await click(button(app.host,en['tool.action.roll']));assert(app.host.querySelector('.result-box'));await input(app.host.querySelector('input[type="text"]'),'100');assert.equal(app.host.querySelector('.result-box'),null);}finally{await app.close();}
});
test('Dialog traps focus from initial and panel positions and restores background state',async()=>{
 function Dialog({open=true}){return React.createElement(React.Fragment,null,React.createElement('button',{id:'background'},'Background'),React.createElement(Modal,{open,onClose(){},label:'Dialog',closeLabel:'Close'},React.createElement('button',{id:'inside'},'Inside')));}
 const app=await mount(Dialog);
 try{
  const panel=app.host.querySelector('[role="dialog"]'),background=app.host.querySelector('#background');
  assert.equal(background.inert,true);assert(panel.contains(document.activeElement));
  await act(()=>{panel.focus();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));});
  assert.equal(document.activeElement.id,'inside');
  await app.render(React.createElement(Dialog,{open:false}));assert(!background.inert);
 }finally{await app.close();}
});
test('Clipboard denial shows password-specific feedback rather than a false success',async()=>{
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('Denied');}}});
 const app=await mount(PasswordGeneratorTool);
 try{await click(button(app.host,en['tool.action.generate']));await click(button(app.host,en['tool.action.copyPassword']));assert(app.host.textContent.includes(en['common.copyFailed']));assert(!app.host.textContent.includes(en['common.copied']));}finally{await app.close();}
});
test('French numeric edits use the locale separator and recover from invalid input',async()=>{
 function Harness(){const [value,set]=React.useState(1);return React.createElement(React.Fragment,null,React.createElement(NumberInput,{value,onValueChange:set}),React.createElement('output',null,String(value)),React.createElement(ToolButton,null,'Act'));}
 const app=await mount(Harness,'fr-FR',{...en,...require('../src/lib/i18n/dictionaries/fr.json')});
 try{await input(app.host.querySelector('input'),'1,5');assert.equal(app.host.querySelector('output').textContent,'1.5');assert.equal(button(app.host,'Act').disabled,false);await input(app.host.querySelector('input'),'1,5.2');assert.equal(button(app.host,'Act').disabled,true);await input(app.host.querySelector('input'),'2,5');assert.equal(button(app.host,'Act').disabled,false);}finally{await app.close();}
});
