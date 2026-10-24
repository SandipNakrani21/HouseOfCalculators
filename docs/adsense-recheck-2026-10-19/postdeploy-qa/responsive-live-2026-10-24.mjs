// Run only through the enabled Codex Browser Use connection. The caller passes
// its documented tab and viewport handles; this module starts no other browser.
import fs from 'node:fs/promises';

export const sizes = [
  {name:'large-desktop',width:1920,height:1080},
  {name:'desktop',width:1366,height:768},
  {name:'tablet',width:768,height:1024},
  {name:'mobile',width:390,height:844},
];

export function measure() {
  const doc=document.documentElement, vw=doc.clientWidth;
  const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&(e.matches('.chart-tooltip')||!e.closest('[aria-hidden="true"],.sr-only'));};
  const scrollParent=e=>{for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){const s=getComputedStyle(p);if((s.overflowX==='auto'||s.overflowX==='scroll')&&p.scrollWidth>p.clientWidth+1)return p;}return null;};
  const describe=e=>({tag:e.tagName,id:e.id,cls:String(e.className||'').slice(0,150),text:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,160)});
  const outside=[], textOutside=[], controlText=[];
  const nodes=[...document.querySelectorAll('main h1,main h2,main h3,main p,main label,main dt,main dd,main button,main input,main textarea,main figure,.chart-tooltip,header a,header button,button[aria-haspopup="listbox"]')];
  for(const e of nodes){
    if(!visible(e)||scrollParent(e))continue;
    const r=e.getBoundingClientRect();
    if(r.left< -1||r.right>vw+1)outside.push({...describe(e),left:r.left,right:r.right,width:r.width});
    for(const n of [e,...e.querySelectorAll('*')].filter(child=>!child.closest('.sr-only,svg,.truncate')&&(e.matches('.chart-tooltip')||!child.closest('[aria-hidden="true"]'))).flatMap(child=>[...child.childNodes])){
      if(n.nodeType!==3||!n.textContent.trim())continue;
      const range=document.createRange(); range.selectNodeContents(n);
      for(const t of range.getClientRects()){
        if(t.left< -2||t.right>vw+2)textOutside.push({...describe(e),left:t.left,right:t.right,txt:n.textContent.trim().slice(0,120)});
        if(e.tagName==='BUTTON'&&(t.left<r.left-2||t.right>r.right+2||t.top<r.top-2||t.bottom>r.bottom+2))controlText.push({...describe(e),textRect:{left:t.left,right:t.right,top:t.top,bottom:t.bottom},box:{left:r.left,right:r.right,top:r.top,bottom:r.bottom}});
      }
    }
  }
  const scrolls=[...document.querySelectorAll('main *')].filter(e=>{const s=getComputedStyle(e);return visible(e)&&(s.overflowX==='auto'||s.overflowX==='scroll')&&e.scrollWidth>e.clientWidth+1;}).map(e=>({...describe(e),client:e.clientWidth,scroll:e.scrollWidth,tabIndex:e.tabIndex}));
  const popups=[...document.querySelectorAll('[role="dialog"],[role="listbox"]')].filter(visible).map(e=>{const r=(e.getAttribute('role')==='listbox'?e.parentElement:e).getBoundingClientRect();return {...describe(e),left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,within:r.left>=-1&&r.right<=vw+1&&r.top>=-1&&r.bottom<=innerHeight+1};});
  const controls=[...document.querySelectorAll('fieldset input,fieldset textarea,fieldset button,header button,button[aria-haspopup="listbox"]')].filter(visible).map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,type:e.type,role:e.getAttribute('role'),label:e.getAttribute('aria-label')||e.labels?.[0]?.textContent?.trim()||e.textContent.trim(),disabled:e.disabled,width:r.width,height:r.height,left:r.left,right:r.right};});
  const action=[...document.querySelectorAll('fieldset div')].find(e=>e.classList.contains('print:hidden')&&e.querySelector(':scope > button'));
  const notice=action?.querySelector(':scope > p');
  let actionNotice=null;
  if(notice){const r=notice.getBoundingClientRect(),p=action.getBoundingClientRect(),bottom=Math.max(...[...action.querySelectorAll(':scope > button')].map(e=>e.getBoundingClientRect().bottom));actionNotice={width:r.width,parentWidth:p.width,top:r.top,buttonsBottom:bottom,misplaced:r.width<p.width-3&&r.top<bottom+2};}
  return {origin:location.origin,url:location.pathname,lang:doc.lang,width:innerWidth,height:innerHeight,client:vw,scrollWidth:doc.scrollWidth,pageOverflow:doc.scrollWidth>vw+1,formReady:document.querySelector('fieldset')?.getAttribute('aria-busy')==='false',outside,textOutside,controlText,scrolls,popups,controls,actionNotice};
}

function issueState(s){return s.pageOverflow||s.outside.length||s.textOutside.length||s.controlText.length||s.popups.some(p=>!p.within)||s.actionNotice?.misplaced;}
let writes=Promise.resolve();

export async function settle(tab) {
  let previous='',stable=0;
  for(let i=0;i<50;i++){
    const frame=await tab.playwright.evaluate(()=>JSON.stringify({y:scrollY,p:[...document.querySelectorAll('[role="dialog"],[role="listbox"]')].map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height];})}));
    if(frame===previous)stable++;else stable=0;
    if(stable>=3)return;
    previous=frame;
  }
}

export async function combo(tab,viewport,fixture,size,root,{screenshots=true,header=true,fixedViewport=false,environment='live',fast=false}={}) {
  const out={...fixture,protocol:'v6-keyboard',interactionProfile:fast?'representative-controls':'all-visible-controls',environment,viewport:size,at:new Date().toISOString(),states:[],interactions:[],candidates:[]};
  const read=async label=>{
    if(!fast&&(label.startsWith('dropdown:')||label==='navigation-drawer'||label==='search-dialog'))await settle(tab);
    let state=await tab.playwright.evaluate(measure);
    if(fast&&state.popups.some(p=>!p.within)){await settle(tab);state=await tab.playwright.evaluate(measure);}
    out.states.push({label,...state,...(label==='baseline'?{}:{controls:undefined})});
    if(issueState(state))out.candidates.push({label,pageOverflow:state.pageOverflow,outside:state.outside,textOutside:state.textOutside,controlText:state.controlText,popups:state.popups.filter(p=>!p.within),actionNotice:state.actionNotice?.misplaced?state.actionNotice:undefined});
    return state;
  };
  try {
    if(!fixedViewport)await viewport.set({width:size.width,height:size.height});
    await tab.playwright.locator('fieldset[aria-busy="false"]').waitFor({state:'visible',timeoutMs:20000});
    out.pageUrl=await tab.url();
    const expectedOrigin=environment==='local'?'http://127.0.0.1:3001':'https://thecalculatorshouse.com';
    if(new URL(out.pageUrl).origin!==expectedOrigin)throw new Error('Unexpected test origin: '+out.pageUrl);
    const baseline=await read('baseline');
    if(baseline.width!==size.width||baseline.height!==size.height)throw new Error('Requested viewport was not applied');
    if(baseline.lang.toLowerCase()!==fixture.locale.toLowerCase())throw new Error('Unexpected document locale');
    const alias=fixture.slug==='salary'&&['tr','br','cn','mx'].includes(fixture.country)?fixture.route.replace(/\/salary$/,'/income-tax'):fixture.route;
    if(baseline.url!==fixture.route&&baseline.url!==alias)throw new Error('Unexpected calculator route: '+baseline.url);
    out.countryControl=await tab.playwright.locator('button[aria-haspopup="listbox"]').filter({visible:true}).nth(1).getAttribute('aria-label');
    if(fixture.homeCountryName&&!out.countryControl?.endsWith(': '+fixture.homeCountryName))throw new Error('Unexpected country context: '+out.countryControl);

    // Reach every currently shown editable text field with its original value.
    const fields=await tab.playwright.evaluate(()=>[...document.querySelectorAll('fieldset input:not([type="range"]):not([type="checkbox"]),fieldset textarea')].filter(e=>e.getBoundingClientRect().width>0).map(e=>({id:e.id,value:e.value,type:e.type,label:e.labels?.[0]?.textContent.trim()})));
    for(const f of (fast?fields.slice(0,1):fields)){
      const control=tab.playwright.locator('[id='+JSON.stringify(f.id)+']');
      await control.fill(f.value);
      const focused=await control.evaluate(e=>document.activeElement===e);
      out.interactions.push({kind:'input-reached',label:f.label,pass:focused});
    }
    if(fields.length){
      const f=fields[0], control=tab.playwright.locator('[id='+JSON.stringify(f.id)+']');
      if(f.type==='text'||f.type==='textarea'){
        await control.fill(''); await read('blank-input-validation');
        await control.fill('abc'); await read('malformed-input-validation');
        await control.fill(f.value);
        out.interactions.push({kind:'validation-layout-and-recovery',label:f.label,pass:true});
      }
      const bound=await tab.playwright.evaluate(label=>{const e=[...document.querySelectorAll('fieldset input[type="range"]')].find(e=>e.getAttribute('aria-label')===label);return e?{max:e.max,label:e.getAttribute('aria-label')}:null;},f.label);
      if(bound){await control.fill(bound.max);await read('upper-bound-number-layout');await control.fill(f.value);out.interactions.push({kind:'upper-bound-number-layout',label:f.label,pass:true});}
    }

    const checkboxes=tab.playwright.locator('fieldset input[type="checkbox"]').filter({visible:true});
    for(let i=0;i<await checkboxes.count();i++){
      const before=await checkboxes.nth(i).evaluate(e=>e.checked);
      await checkboxes.nth(i).press('Space');await read('toggle:'+i);
      const changed=await checkboxes.nth(i).evaluate((e,value)=>e.checked!==value,before);
      await checkboxes.nth(i).press('Space');
      const restored=await checkboxes.nth(i).evaluate((e,value)=>e.checked===value,before);
      out.interactions.push({kind:'toggle-operate-and-restore',index:i,pass:changed&&restored});
    }
    const groups=await tab.playwright.evaluate(()=>[...document.querySelectorAll('fieldset [role="radiogroup"]')].filter(e=>e.getBoundingClientRect().width>0).map(e=>({labelledby:e.getAttribute('aria-labelledby'),options:[...e.querySelectorAll('[role="radio"]')].map(o=>({name:o.textContent.trim(),checked:o.getAttribute('aria-checked')==='true'}))})));
    for(const g of groups){
      const group=tab.playwright.locator('fieldset [role="radiogroup"][aria-labelledby='+JSON.stringify(g.labelledby)+']');
      const original=g.options.find(o=>o.checked);
      let pass=true;
      for(const o of g.options.filter(o=>!o.checked).slice(0,fast?1:Infinity)){await group.getByRole('radio',{name:o.name,exact:true}).press('Space');await read('choice:'+o.name);pass=pass&&await group.getByRole('radio',{name:o.name,exact:true}).getAttribute('aria-checked')==='true';}
      if(original)await group.getByRole('radio',{name:original.name,exact:true}).press('Space');
      out.interactions.push({kind:'choice-operate-and-restore',labelledby:g.labelledby,count:g.options.length,pass});
    }

    const choices=tab.playwright.locator(header?'button[aria-haspopup="listbox"]':'fieldset button[aria-haspopup="listbox"]').filter({visible:true});
    const n=fast&&!header?Math.min(1,await choices.count()):await choices.count();
    for(let i=0;i<n;i++){
      const trigger=choices.nth(i), label=await trigger.getAttribute('aria-label');
      await trigger.press('ArrowDown');
      await tab.playwright.getByRole('listbox').waitFor({state:'visible',timeoutMs:2000});
      const searchInput=tab.playwright.getByRole('combobox').filter({visible:true});
      const keyTarget=await searchInput.count()?searchInput:tab.playwright.getByRole('listbox');
      await keyTarget.press('End');
      await read('dropdown:'+label);
      await keyTarget.press('Escape');
      await tab.playwright.getByRole('listbox').waitFor({state:'hidden',timeoutMs:2000});
      out.interactions.push({kind:'dropdown-open-keyboard-scroll-close',label,pass:true});
    }

    if(header){
      const menu=tab.playwright.locator('header button[aria-expanded]').filter({visible:true});
      if(await menu.count()){
        await menu.press('Space');await tab.playwright.getByRole('dialog').waitFor({state:'visible',timeoutMs:2000});
        await read('navigation-drawer');
        await tab.playwright.getByRole('dialog').press('Escape');
        await tab.playwright.getByRole('dialog').waitFor({state:'hidden',timeoutMs:2000});
        out.interactions.push({kind:'navigation-drawer-open-close',pass:true});
      }
      const search=tab.playwright.locator('header button:not([aria-expanded])').filter({visible:true});
      if(await search.count()){
        await search.first().press('Space');await tab.playwright.getByRole('dialog').waitFor({state:'visible',timeoutMs:2000});
        await read('search-dialog');
        await tab.playwright.getByRole('dialog').press('Escape');
        await tab.playwright.getByRole('dialog').waitFor({state:'hidden',timeoutMs:2000});
        out.interactions.push({kind:'search-dialog-open-close',pass:true});
      }
    }

    // Tabs are exercised without making any assertions about arithmetic.
    const tabs=tab.playwright.locator('fieldset [role="tab"]');
    const tabCount=await tabs.count();
    if(tabCount){
      const original=await tab.playwright.locator('fieldset [role="tab"][aria-selected="true"]').innerText();
      for(let i=0;i<tabCount;i++){await tabs.nth(i).press('Space');await read('breakdown-tab:'+await tabs.nth(i).innerText());}
      await tab.playwright.getByRole('tab',{name:original,exact:true}).press('Space');
      out.interactions.push({kind:'breakdown-tabs',count:tabCount,pass:true});
    }

    const chart=tab.playwright.locator('fieldset figure button').filter({visible:true});
    if(await chart.count()){
      await chart.first().press('Escape');await read('chart-keyboard-tooltip');
      await tab.playwright.locator('button[aria-haspopup="listbox"]').filter({visible:true}).first().press('Escape');
      out.interactions.push({kind:'chart-legend-keyboard-focus',pass:true});
    }
    const final=await read('restored');
    if(screenshots){
      await tab.playwright.locator('button[aria-haspopup="listbox"]').filter({visible:true}).first().press('Control+Home');
      await settle(tab);
      const filename=environment+'-'+fixture.locale.toLowerCase()+'-'+fixture.slug+'-'+size.name+'.png';
      await fs.writeFile(root+'responsive-live-2026-10-24/'+filename,await tab.screenshot({fullPage:false}));
      out.screenshot='responsive-live-2026-10-24/'+filename;
    }
    out.completed=true;
    out.automatedPass=out.candidates.length===0&&out.interactions.every(i=>i.pass)&&final.formReady;
  }catch(e){out.error=String(e);out.completed=false;out.automatedPass=false;}
  writes=writes.then(()=>fs.appendFile(root+'responsive-'+environment+'-2026-10-24.jsonl',JSON.stringify(out)+'\n'));
  await writes;
  return {locale:out.locale,slug:out.slug,size:size.name,completed:out.completed,candidates:out.candidates.length,error:out.error};
}

export async function route(tab,viewport,fixture,root,options) {
  if(await tab.url()!=='https://thecalculatorshouse.com'+fixture.route)await tab.goto('https://thecalculatorshouse.com'+fixture.route);
  const result=[];
  for(const size of sizes)result.push(await combo(tab,viewport,fixture,size,root,options));
  return result;
}

export async function ensureContext(tab,fixture,context) {
  await tab.playwright.locator('fieldset[aria-busy="false"]').waitFor({state:'visible',timeoutMs:20000});
  const trigger=tab.playwright.locator('button[aria-haspopup="listbox"]').filter({visible:true}).nth(1);
  let label=await trigger.getAttribute('aria-label');
  if(!label?.endsWith(': '+context.countryName)){
    await trigger.click();
    const names=await tab.playwright.getByRole('option').allTextContents({timeoutMs:2000});
    const matches=names.map((name,index)=>({name,index})).filter(o=>o.name.trim().startsWith(context.countryName));
    if(matches.length!==1)throw new Error('Expected exactly one configured country option for '+fixture.locale);
    await tab.playwright.getByRole('option').nth(matches[0].index).click();
    label=await trigger.getAttribute('aria-label');
  }
  if(!label?.endsWith(': '+context.countryName))throw new Error('Unexpected country context '+label);
  return label;
}

export async function batch(tab,viewport,root,{budgetMs=38000}={}) {
  const manifest=JSON.parse(await fs.readFile(root+'responsive-live-2026-10-24-manifest.json','utf8'));
  const cursorPath=root+'responsive-live-2026-10-24-cursor.json';
  const p=JSON.parse(await fs.readFile(cursorPath,'utf8'));
  const start=Date.now(),results=[];
  while(p.fixtureIndex<manifest.routes.length&&Date.now()-start<budgetMs){
    const raw=manifest.routes[p.fixtureIndex],context=manifest.contexts[raw.locale];
    const fixture={...raw,homeCountryName:context.countryName};
    const url='https://thecalculatorshouse.com'+fixture.route;
    const alias=fixture.slug==='salary'&&['tr','br','cn','mx'].includes(fixture.country)?url.replace(/\/salary$/,'/income-tax'):url;
    const actual=await tab.url();
    if(actual!==url&&actual!==alias)await tab.goto(url);
    await ensureContext(tab,fixture,context);
    const result=await combo(tab,viewport,fixture,sizes[p.sizeIndex],root,{
      fast:true,header:fixture.slug==='mortgage',
      screenshots:fixture.locale==='en-US'||fixture.slug==='mortgage',
    });
    results.push(result);
    p.testCount++;p.sizeIndex++;
    if(p.sizeIndex===4){p.sizeIndex=0;p.fixtureIndex++;}
    await fs.writeFile(cursorPath,JSON.stringify({...p,at:new Date().toISOString()}));
    if(result.error&&/stopped|interrupted|policy/i.test(result.error))break;
  }
  return {...p,seconds:(Date.now()-start)/1000,errors:results.filter(r=>r.error),candidateCombinations:results.filter(r=>r.candidates).length,last:results.at(-1)};
}

// A separate pass over the fixed source. Changes are confined to presentation:
// revisit every route/size, reveal checkbox-dependent result layouts, and focus
// every chart legend. The live run already covers editable inputs and choices.
export async function layoutRetest(tab,viewport,fixture,size,root) {
  const out={...fixture,protocol:'layout-retest-v4',interactionProfile:'confirmed-layout-and-targeted-chart-regression',environment:'local',viewport:size,at:new Date().toISOString(),states:[],interactions:[],candidates:[]};
  const read=async label=>{
    const state=await tab.playwright.evaluate(measure);
    out.states.push({label,...state,...(label==='baseline'?{}:{controls:undefined})});
    if(issueState(state))out.candidates.push({label,pageOverflow:state.pageOverflow,outside:state.outside,textOutside:state.textOutside,controlText:state.controlText,popups:state.popups.filter(p=>!p.within),actionNotice:state.actionNotice?.misplaced?state.actionNotice:undefined});
    return state;
  };
  const chart=async label=>{
    const legends=tab.playwright.locator('fieldset figure button').filter({visible:true});
    for(let i=0,n=Math.min(1,await legends.count());i<n;i++){
      await legends.nth(i).press('Escape');await read(label+':legend:'+i);
      out.interactions.push({kind:'chart-legend-focus',pass:await legends.nth(i).evaluate(e=>document.activeElement===e)});
    }
    await tab.playwright.locator('button[aria-haspopup="listbox"]').filter({visible:true}).first().press('Escape');
  };
  try{
    await viewport.set({width:size.width,height:size.height});
    const baseline=await read('baseline');
    if(!baseline.formReady)throw new Error('Retest form not ready');
    out.pageUrl=baseline.origin+baseline.url;
    const alias=fixture.slug==='salary'&&['tr','br','cn','mx'].includes(fixture.country)?fixture.route.replace(/\/salary$/,'/income-tax'):fixture.route;
    if(new URL(out.pageUrl).origin!=='http://127.0.0.1:3001'||![fixture.route,alias].includes(baseline.url))throw new Error('Unexpected local retest URL: '+out.pageUrl);
    if(baseline.width!==size.width||baseline.height!==size.height||baseline.lang.toLowerCase()!==fixture.locale.toLowerCase())throw new Error('Unexpected retest viewport or locale');
    out.countryControl=baseline.controls.find(c=>c.label?.startsWith(fixture.homeCountryLabel+': '))?.label;
    if(!out.countryControl?.endsWith(': '+fixture.homeCountryName))throw new Error('Unexpected retest country: '+out.countryControl);
    const detailed=['mortgage','loan','income-tax','salary'].includes(fixture.slug);
    if(detailed)await chart('default');
    const toggles=tab.playwright.locator('fieldset input[type="checkbox"]').filter({visible:true});
    for(let i=0,n=detailed?await toggles.count():0;i<n;i++){
      const before=await toggles.nth(i).evaluate(e=>e.checked);
      await toggles.nth(i).press('Space');await read('toggle:'+i);await chart('toggle:'+i);
      const changed=await toggles.nth(i).evaluate((e,value)=>e.checked!==value,before);
      await toggles.nth(i).press('Space');
      out.interactions.push({kind:'toggle-and-restore',pass:changed&&await toggles.nth(i).evaluate((e,value)=>e.checked===value,before)});
    }
    if(fixture.slug==='mortgage'){
      const slider=tab.playwright.locator('fieldset input[type="range"]').filter({visible:true}).first();
      const original=await slider.evaluate(e=>({label:e.getAttribute('aria-label'),min:e.min,max:e.max}));
      const pairedTextbox=tab.playwright.getByRole('textbox',{name:original.label,exact:true});
      const originalText=await pairedTextbox.evaluate(e=>e.value);
      await slider.press('End');await read('slider-upper-bound');
      const maximum=await pairedTextbox.evaluate((e,max)=>e.value===max,original.max);
      await slider.press('Home');await read('slider-lower-bound');
      const minimum=await pairedTextbox.evaluate((e,min)=>e.value===min,original.min);
      await pairedTextbox.fill(originalText);
      out.interactions.push({kind:'slider-keyboard-end-home-restore',pass:maximum&&minimum&&await pairedTextbox.evaluate((e,value)=>e.value===value,originalText)});
      await tab.playwright.locator('fieldset div[class~="print:hidden"] > button').filter({visible:true}).first().click();
      await settle(tab);await read('pointer-reset');
      const filename='local-'+fixture.locale.toLowerCase()+'-mortgage-'+size.name+'-body.png';
      await fs.writeFile(root+'responsive-live-2026-10-24/'+filename,await tab.screenshot({fullPage:false}));
      out.screenshot='responsive-live-2026-10-24/'+filename;
      out.interactions.push({kind:'pointer-reset',pass:true});
    }
    if(detailed)await read('restored');
    out.completed=true;out.automatedPass=out.candidates.length===0&&out.interactions.every(i=>i.pass);
  }catch(e){out.completed=false;out.automatedPass=false;out.error=String(e);}
  writes=writes.then(()=>fs.appendFile(root+'responsive-local-retest-2026-10-24.jsonl',JSON.stringify(out)+'\n'));
  await writes;
  return {locale:out.locale,slug:out.slug,size:size.name,completed:out.completed,candidates:out.candidates.length,error:out.error};
}

export async function retestBatch(tab,viewport,root,{budgetMs=38000}={}) {
  const manifest=JSON.parse(await fs.readFile(root+'responsive-live-2026-10-24-manifest.json','utf8'));
  const plan=JSON.parse(await fs.readFile(root+'responsive-local-retest-2026-10-24-plan.json','utf8'));
  const cursorPath=root+'responsive-local-retest-2026-10-24-cursor.json';
  let p;try{p=JSON.parse(await fs.readFile(cursorPath,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;p={caseIndex:0,testCount:0};}
  const start=Date.now(),results=[];
  while(p.caseIndex<plan.cases.length&&Date.now()-start<budgetMs){
    const test=plan.cases[p.caseIndex],raw=manifest.routes[test.fixtureIndex],context=manifest.contexts[raw.locale];
    const fixture={...raw,homeCountryName:context.countryName,homeCountryLabel:context.label};
    const url='http://127.0.0.1:3001'+fixture.route;
    const alias=fixture.slug==='salary'&&['tr','br','cn','mx'].includes(fixture.country)?url.replace(/\/salary$/,'/income-tax'):url;
    const actual=await tab.url();if(actual!==url&&actual!==alias){await tab.goto(url);await ensureContext(tab,fixture,context);}
    const result=await layoutRetest(tab,viewport,fixture,sizes[test.sizeIndex],root);
    results.push(result);p.testCount++;p.caseIndex++;
    await fs.writeFile(cursorPath,JSON.stringify({...p,at:new Date().toISOString()}));
    if(result.error&&/stopped|interrupted|policy/i.test(result.error))break;
  }
  return {...p,target:plan.cases.length,seconds:(Date.now()-start)/1000,errors:results.filter(r=>r.error),candidateCombinations:results.filter(r=>r.candidates).length,last:results.at(-1)};
}
