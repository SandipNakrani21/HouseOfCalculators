// Caller supplies only supported in-app-browser handles. Starts no browser.
import fs from 'node:fs/promises';
import { measure, ensureContext, sizes, combo } from '../responsive-live-2026-10-24.mjs';

export async function geometryBatch(tab, viewport, manifest, output, cursor, budgetMs=45000) {
  const start=Date.now();let count=0;const candidates=[];
  while(cursor.route<manifest.routes.length && Date.now()-start<budgetMs) {
    const fixture=manifest.routes[cursor.route];
    const context=manifest.contexts[fixture.locale];
    const expected='http://127.0.0.1:3001'+fixture.route;
    await tab.goto(expected);
    await ensureContext(tab,fixture,context);
    for(const size of sizes) {
      await viewport.set({width:size.width,height:size.height});
      const state=await tab.playwright.evaluate(measure);
      const alias=fixture.slug==='salary'&&['tr','br','cn','mx'].includes(fixture.country)?fixture.route.replace(/\/salary$/,'/income-tax'):fixture.route;
      const contextValid=state.width===size.width&&state.height===size.height&&state.lang.toLowerCase()===fixture.locale.toLowerCase()&&(state.url===fixture.route||state.url===alias)&&state.formReady;
      const candidate=state.pageOverflow||state.outside.length>0||state.textOutside.length>0||state.controlText.length>0||state.actionNotice?.misplaced;
      const record={at:new Date().toISOString(),scope:'rendered-default-state-geometry-only',...fixture,viewport:size,contextValid,candidate,state};
      await fs.appendFile(output+'geometry.jsonl',JSON.stringify(record)+'\n');
      count++;
      if(!contextValid||candidate)candidates.push({locale:fixture.locale,slug:fixture.slug,size:size.name,contextValid,candidate});
      if(!contextValid)throw new Error('Invalid route/context/viewport; see retained row');
    }
    cursor.route++;
    await fs.writeFile(output+'geometry-cursor.json',JSON.stringify(cursor));
  }
  return {newChecks:count,routesComplete:cursor.route,totalRoutes:manifest.routes.length,candidates};
}

export async function interactionBatch(tab, viewport, manifest, output, cursor, budgetMs=40000, options={}) {
  const fixtures=manifest.routes;
  const start=Date.now();const results=[];
  while(cursor.route<fixtures.length&&Date.now()-start<budgetMs) {
    const fixture=fixtures[cursor.route],context=manifest.contexts[fixture.locale];
    const url='http://127.0.0.1:3001'+fixture.route;
    const alias=fixture.slug==='salary'&&['tr','br','cn','mx'].includes(fixture.country)?url.replace(/\/salary$/,'/income-tax'):url;
    if(await tab.url()!==url&&await tab.url()!==alias) {
      const before=await tab.url();
      let mode='document-entry';
      const from=new URL(before),to=new URL(url);
      if(from.origin===to.origin&&from.pathname.split('/')[1]===to.pathname.split('/')[1]) {
        const link=href=>tab.playwright.getByRole('link').and(tab.playwright.locator('a[href='+JSON.stringify(href)+']')).first();
        const click=async href=>{await link(href).press('Enter');await tab.playwright.waitForURL(from.origin+href,{timeoutMs:10000});};
        const target=alias===url?to.pathname:new URL(alias).pathname;
        if(await link(target).count()){await click(target);mode='client-link';}
        else {
          const parts=to.pathname.split('/');
          const section=parts.slice(0,3).join('/');
          const hub=parts.slice(0,4).join('/');
          if(await link(section).count()) {
            await click(section);
            if(hub!==section&&await link(hub).count())await click(hub);
            if(await link(target).count()){await click(target);mode='client-listing';}
          }
        }
      }
      if(mode==='document-entry')await tab.goto(url);
      await fs.appendFile(output+'navigation.jsonl',JSON.stringify({at:new Date().toISOString(),from:before,to:url,mode})+'\n');
    }
    await ensureContext(tab,fixture,context);
    // Form controls on every selected route; shared header/menu/search in
    // every locale/size on loan, rather than repeating identical US headers.
    const result=await combo(tab,viewport,{...fixture,homeCountryName:context.countryName},sizes[cursor.size],output,{screenshots:fixture.slug==='loan',environment:'local',fast:false,header:fixture.slug==='loan',fixedViewport:options.fixedViewport??false});
    results.push(result);
    // An interrupted profile must be retried at this same viewport. The
    // retained ledger, not an advanced cursor, determines completed coverage.
    if(!result.completed) {
      if(options.saveCursor!==false)await fs.writeFile(output+'interaction-cursor.json',JSON.stringify(cursor));
      break;
    }
    cursor.size++;
    if(cursor.size===sizes.length){cursor.size=0;cursor.route++;}
    if(options.saveCursor!==false)await fs.writeFile(output+'interaction-cursor.json',JSON.stringify(cursor));
    if(options.fixedViewport)break;
  }
  return {newChecks:results.length,fixturesComplete:cursor.route,totalFixtures:fixtures.length,nextViewport:cursor.size,issues:results.filter(r=>!r.completed||r.candidates)};
}

export async function parallelInteractionBatch(views, manifest, output, cursor, budgetMs=40000) {
  const start=Date.now();let checks=0;const issues=[];
  while(cursor.route<manifest.routes.length&&Date.now()-start<budgetMs) {
    const fixture=manifest.routes[cursor.route];
    const results=await Promise.allSettled(views.map((view,index)=>interactionBatch(view.tab,null,{routes:[fixture],contexts:manifest.contexts},output,{route:0,size:index},40000,{fixedViewport:true,saveCursor:false})));
    for(let i=0;i<results.length;i++) {
      const r=results[i];
      if(r.status==='rejected')issues.push({fixture,viewport:views[i].size,error:String(r.reason)});
      else {checks+=r.value.newChecks;issues.push(...r.value.issues);}
    }
    if(issues.length){await fs.appendFile(output+'parallel-interruptions.jsonl',JSON.stringify({at:new Date().toISOString(),route:cursor.route,issues})+'\n');break;}
    cursor.route++;
    await fs.writeFile(output+'parallel-interaction-cursor.json',JSON.stringify(cursor));
  }
  return {newChecks:checks,fixturesComplete:cursor.route,totalFixtures:manifest.routes.length,issues};
}
