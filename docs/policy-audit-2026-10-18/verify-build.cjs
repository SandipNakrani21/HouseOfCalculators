/* eslint-disable @typescript-eslint/no-require-imports -- Offline generated-page audit. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
require('../../tests/load-typescript.cjs');
const {ruleReview}=require('../../src/config/calculators/provenance.ts');
const root=path.resolve(__dirname,'../../.next/server/app');
const results={pages:0,countryPages:0,noindexCountryPages:0,reviewPanels:0,issues:[]};
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);if(entry.isDirectory()){walk(file);continue;}if(!file.endsWith('.html'))continue;
 const relative=path.relative(root,file).replaceAll('\\','/');
 if(!/^[a-z]{2}-[a-z]{2}(?:\/|\.html)/.test(relative))continue;
 const html=fs.readFileSync(file,'utf8');
 const markup=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
 const route='/'+relative.replace(/\.html$/,'').replace(/\/index$/,'');results.pages++;
 const adTag=html.indexOf('pagead/js/adsbygoogle.js'),consentDefault=html.indexOf("gtag('consent', 'default'");
 if(adTag>=0 && (consentDefault<0 || adTag<consentDefault))results.issues.push({route,issue:'AdSense loader precedes consent defaults'});
 if(!markup.includes('<main'))results.issues.push({route,issue:'missing main'});
 if((markup.match(/<h1\b/g)||[]).length!==1)results.issues.push({route,issue:'expected one H1'});
 const canonical=markup.match(/<link rel="canonical" href="([^"]+)"/);
 // The deliberately unindexed developer showcase inherits home metadata.
 // Canonical self-reference is checked for public content, not that preview.
 if(route.endsWith('/design-system')) {
  if(!/<meta name="robots" content="[^"]*noindex/.test(markup))results.issues.push({route,issue:'developer preview indexable'});
 } else if(!canonical || canonical[1] !== 'https://thecalculatorshouse.com'+route)results.issues.push({route,issue:'missing or mismatched canonical'});
 if(/<meta[^>]+content="https?:\/\/(?:localhost|127\.0\.0\.1)/.test(markup))results.issues.push({route,issue:'local address in published metadata'});
 if(/>(?:review\.(?:scope|health)\.[^<]+)</.test(markup))results.issues.push({route,issue:'unresolved review translation'});
 const match=route.match(/^\/[a-z]{2}-[a-z]{2}\/countries\/([a-z]{2})\/([^/]+)$/);
 if(match){results.countryPages++;const review=ruleReview(match[2],match[1]);
  if(!review){results.issues.push({route,issue:'withdrawn country model still published'});}
  else {results.reviewPanels++;if(!html.includes(review.sources[0].replaceAll('&','&amp;')))results.issues.push({route,issue:'review reference missing'});}
 }
}}
walk(root);
assert(results.pages>2500,'Expected the complete curated production build');
assert.equal(results.reviewPanels,84,'All reviewed country models should remain published in 12 locales');
fs.writeFileSync(path.join(__dirname,'generated-page-check.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));if(results.issues.length)process.exitCode=1;
