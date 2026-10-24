/* eslint-disable @typescript-eslint/no-require-imports -- Verify generated production documents. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
fs.mkdirSync('docs/adsense-recheck-2026-10-19/postdeploy-qa',{recursive:true});
const {LOCALES}=(()=>{require('./load-typescript.cjs');return require('../src/config/locales.ts');})();
const locales=Object.values(LOCALES).filter(l=>l.launch);
const manifest=JSON.parse(fs.readFileSync('.next/prerender-manifest.json'));
const rows=[];
for(const [route,entry]of Object.entries(manifest.routes)){
 const locale=locales.find(l=>route.startsWith('/'+l.path+'/'));
 if(!locale||!/^\/[a-z-]+\/(?:calculators\/[^/]+|countries\/[a-z]{2})\/[^/]+$/.test(route))continue;
 const htmlFile=path.join('.next/server/app',route+'.html');
 const html=fs.readFileSync(htmlFile,'utf8');
 const redirected=/<meta[^>]*http-equiv="refresh"/i.test(html)||html.includes('NEXT_REDIRECT');
 if(!redirected){
  assert(new RegExp('<html[^>]*lang="'+locale.code+'"','i').test(html),'Locale '+route);
  assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,'Heading '+route);
  assert(html.includes('<fieldset')&&html.includes('result-box'),'Calculator content '+route);
  const text=html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<[^>]+>/g,' ');
  assert(!/(?:^|\s)(?:field|result|option|calc)\.[a-zA-Z][\w.-]+(?:\s|$)/.test(text),'Untranslated key '+route);
  if(route.endsWith('/countries/tr/severance-pay')){
   const dictionary=JSON.parse(fs.readFileSync('src/lib/i18n/dictionaries/'+locale.language+'.json'));
   const expected=dictionary['result.severanceStampDuty'];
   assert(text.includes(expected),'Scoped severance label '+route);
  }
 }
 rows.push({route,locale:locale.code,kind:redirected?'redirect':'calculator-document',pass:true,srcRoute:entry.srcRoute});
}
assert(rows.length>=720,'All public calculator routes included');
const report={at:new Date().toISOString(),buildId:fs.readFileSync('.next/BUILD_ID','utf8').trim(),method:'Generated HTML checks; not browser interaction or independent arithmetic.',documents:rows.filter(r=>r.kind==='calculator-document').length,redirects:rows.filter(r=>r.kind==='redirect').length,rows};
fs.writeFileSync('docs/adsense-recheck-2026-10-19/postdeploy-qa/completion-2026-10-24-prerender.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({buildId:report.buildId,documents:report.documents,redirects:report.redirects,status:'PASS'},null,2));
