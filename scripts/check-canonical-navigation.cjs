/* eslint-disable @typescript-eslint/no-require-imports -- Check navigation identity against the actual generated page inventory. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
require('./load-typescript.cjs');
const {countryToolPath}=require('../src/lib/routes.ts');
const {canonicalCountryToolSlug}=require('../src/config/calculators/publication.ts');
const {LOCALES}=require('../src/config/locales.ts');
const {COUNTRY_CODES}=require('../src/config/countries.ts');
const generatedLocales=fs.readdirSync('.next/server/app/sitemaps').filter(file=>file.endsWith('.xml.body')).map(file=>Object.values(LOCALES).find(locale=>file===locale.path+'.xml.body'));
assert.equal(generatedLocales.length,12);
let aliases=0,pages=0,links=0;
const expectedAliases=new Set();
for(const {code:locale} of generatedLocales){
  const sitemap=fs.readFileSync(path.join('.next/server/app/sitemaps',LOCALES[locale].path+'.xml.body'),'utf8');
  const entries=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>new URL(match[1]).pathname);
  for(const country of ['tr','br','cn','mx']){
    const alias=`/${LOCALES[locale].path}/countries/${country}/salary`;
    const target=`/${LOCALES[locale].path}/countries/${country}/income-tax`;
    expectedAliases.add(alias);
    assert.equal(countryToolPath(locale,country,'salary'),target);
    assert.ok(entries.includes(target));assert.ok(!entries.includes(alias));
    const legacyFile=path.join('.next/server/app',alias+'.html');
    assert.ok(fs.existsSync(legacyFile),'Existing saved route must still render: '+alias);
    const legacy=fs.readFileSync(legacyFile,'utf8');
    assert.ok(legacy.includes(`rel="canonical" href="https://thecalculatorshouse.com${target}"`));
    aliases++;
  }
  for(const country of COUNTRY_CODES.filter(code=>!['tr','br','cn','mx'].includes(code)))assert.equal(countryToolPath(locale,country,'salary'),`/${LOCALES[locale].path}/countries/${country}/salary`);
}
assert.equal(canonicalCountryToolSlug('income-tax','tr'),'income-tax');
function scan(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory()){scan(file);continue;}if(!entry.name.endsWith('.html'))continue;const html=fs.readFileSync(file,'utf8');pages++;for(const match of html.matchAll(/\bhref="([^"?#]+)(?:[?#][^"]*)?"/g)){links++;let target;try{const url=new URL(match[1],'https://thecalculatorshouse.com');if(url.origin==='https://thecalculatorshouse.com')target=url.pathname;}catch{continue;}assert.ok(!expectedAliases.has(target),'Internal link points to canonical alias in '+file+': '+match[1]);}}}
scan('.next/server/app');
console.log(JSON.stringify({canonicalAliases:aliases,legacyRoutesPreserved:aliases,htmlPages:pages,linksChecked:links,passed:true}));
