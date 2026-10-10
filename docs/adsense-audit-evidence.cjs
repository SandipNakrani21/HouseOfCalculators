/* eslint-disable @typescript-eslint/no-require-imports -- Node CJS audit utility. */
// Read-only source and local generated-artifact review. No ad requests or browser navigation.
require('../tests/load-typescript.cjs');
const fs=require('node:fs'),vm=require('node:vm');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
process.env.NEXT_PUBLIC_ADSENSE_CLIENT='ca-pub-6814796122648657';
const {CONVERTERS}=require('../src/config/converters/definitions.ts');
const {CALCULATORS}=require('../src/config/calculators/index.ts');
const {GUIDES}=require('../src/config/guides/definitions.ts');
const {LOCALES}=require('../src/config/locales.ts');
const {buildShareUrl}=require('../src/lib/share-link.ts');
const {ConsentScript}=require('../src/components/consent/ConsentScript.tsx');
const html=renderToStaticMarkup(React.createElement(ConsentScript));
const source=html.match(/<script>([\s\S]*)<\/script>/)[1];
const window={};vm.runInNewContext(source,{window,document:{cookie:'hoc_consent=granted'}});
const consentCalls=window.dataLayer.map(call=>Array.from(call));
const pairs=CONVERTERS.reduce((sum,c)=>sum+c.featuredPairs.length,0),locales=Object.values(LOCALES).filter(l=>l.launch).length;
const en=require('../src/lib/i18n/dictionaries/en.json');
const evidence={date:'2026-10-10',method:'Read-only code review, local VM simulation, official Google policy pages and limited public web retrieval',inventory:{calculators:CALCULATORS.length,converterCategories:CONVERTERS.length,featuredPairsPerLocale:pairs,availableLocales:locales,localizedPairRoutes:pairs*locales,guides:GUIDES.length},pairEditorialContent:CONVERTERS.map(c=>({category:c.category,pairs:c.featuredPairs.length,sharedExplanationWords:en[c.explainerKey].split(/\s+/).length})),dummyShareUrl:buildShareUrl('https://thecalculatorshouse.com/en-us/calculators/finance/salary',{income:80000,period:'annual'},'us'),storedConsentSimulation:{cookie:'hoc_consent=granted',regionAndTcfApi:'Not supplied; the generated script does not check them',calls:consentCalls},publicRetrieval:{readable:['/en-us','/en-us/privacy','/en-us/calculators/finance/mortgage'],unverified:['/','/ads.txt','/robots.txt','/en-us/about','/en-us/contact','/en-us/converters/length/meters-to-feet'],note:'Web-tool retrieval failures do not prove 404s, crawler blocking or site outages.'},limits:['No AdSense account access or exact rejection notice','No CMP network or regional browser verification','No deployed HTTP-header, ads.txt seller authorization or crawler-log verification','No fresh live ad-placement screenshots']};
fs.writeFileSync('docs/ADSENSE_AUDIT_EVIDENCE.json',JSON.stringify(evidence,null,2));
console.log(JSON.stringify(evidence,null,2));
