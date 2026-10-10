/* eslint-disable @typescript-eslint/no-require-imports -- This Node build script installs a CommonJS TypeScript loader. */
/* Generate function-free discovery metadata and route engine groups from the source registry. */
require('../tests/load-typescript.cjs');
const fs = require('node:fs');
const { CALCULATORS } = require('../src/config/calculators/index.ts');
const groups = fs.readdirSync('src/config/calculators/definitions').filter(f=>f.endsWith('.ts')).map(f=>f.slice(0,-3));
const slugGroup = {};
for (const group of groups) {
  for (const value of Object.values(require('../src/config/calculators/definitions/'+group+'.ts')).flat()) {
    if (value && typeof value === 'object' && value.slug) slugGroup[value.slug]=group;
  }
}
const keys=['slug','icon','version','category','titleKey','descKey','countries','isCountrySpecific','countryRelevance','relatedCalculators','keywordsKey'];
const metadata=CALCULATORS.map(c=>({...Object.fromEntries(keys.filter(k=>c[k]!==undefined).map(k=>[k,c[k]])),engineGroup:slugGroup[c.slug],taxName:!!c.params}));
if(metadata.some(c=>!c.engineGroup))throw new Error('Calculator engine group missing');
const output=JSON.stringify(metadata,null,2)+'\n';
const target='src/config/calculators/metadata.json';
if(process.argv.includes('--check')) {
  if(fs.readFileSync(target,'utf8')!==output)throw new Error('Calculator metadata is stale. Run npm run metadata.');
}else fs.writeFileSync(target,output);
console.log('Calculator metadata: '+metadata.length+' entries');
const { INCOME_TAX_RULES } = require('../src/lib/finance/tax/index.ts');
const taxOutput=JSON.stringify(Object.fromEntries(Object.entries(INCOME_TAX_RULES).map(([country,rule])=>[country,{taxYear:rule.taxYear,verifiedFor:rule.verifiedFor}])),null,2)+'\n';
const taxTarget='src/config/calculators/tax-metadata.json';
if(process.argv.includes('--check')){if(fs.readFileSync(taxTarget,'utf8')!==taxOutput)throw new Error('Tax metadata is stale.');}else fs.writeFileSync(taxTarget,taxOutput);
