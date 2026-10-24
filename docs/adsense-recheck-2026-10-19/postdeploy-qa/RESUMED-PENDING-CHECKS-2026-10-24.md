# QA ફરી શરૂ — 24 October 2026

આ નોંધ `FINAL-PENDING-CHECKS-2026-10-24.md` પછીનું કાર્ય દર્શાવે છે. પુરાવા `resume-2026-10-24/`માં છે. હાલનો checkpoint: **1,318/2,880 detailed interactions પાસ; 1,562 બાકી. લાગુ પડતા geometry checks 2,880/2,880; candidates શૂન્ય.** Browser બંધ હોવાથી matrix અધૂરું છે.

## સુધારો અને speedની મર્યાદા

`a29a34ff4f4c6f601faf5466545bea0b32070081`માં Google consent API listener નોંધાયા પછી દર 250 msની બિનજરૂરી polling બંધ થાય છે. API મોડું મળે ત્યારે polling અને Google callback queue બંને listener નોંધાવી શકે છે. ત્યાર પછી એ જ listener આગળના consent ફેરફારો સંભાળે છે. API ઉપલબ્ધ ન હોય તો defaults denied રહે છે અને unmount પર timer બંધ થાય છે.

ચાર actual-source hook tests પાસ છે: તરત API ઉપલબ્ધ, pollingથી મોડું API મળવું, Google queueથી API મળવું અને API ન મળવું. આગળના TCF callback તથા listener cleanup પણ assert કર્યાં છે. છ actual-source React/jsdom consent simulations ફરી પાસ થયાં છે. આ controlled simulations છે; વાસ્તવિક Google regional/network tests નથી.

આ નાનો idle-work સુધારો mobile LCPનું નિરાકરણ હોવાનું સાબિત કરતો નથી. અગાઉના 36 PageSpeed reports જ માન્ય before baseline છે. Sourceમાં local consent dialog માત્ર `gdprApplies === false` મળ્યા પછી દેખાય છે; server render અને pending CMP contextમાં તે render થતો નથી. આથી તેની visible paragraph timing hydration, Google API readiness અને TCF callback પછી આવે છે. એક જૂના reportમાં late paragraph LCP હતો; તે દરેક routeના સંપૂર્ણ 6–8 s વિલંબનું કારણ હોવાનો પુરાવો નથી. Registration pollingના સુધારાથી તે async dependency દૂર થતી નથી. Required consent copy, controls, denied defaults અને Google loader order બદલ્યાં નથી. કોઈ measured LCP બચત અથવા field Core Web Vitals passનો દાવો નથી. TBT એ INP નથી.

GitHub push પછી live document અને consent/layout bundleનું HTTP comparison કર્યું. `http-results.json`માં response time, hashes અને paths છે. 17:01 UTCના sampleમાં live bundle સ્થાનિક સુધારાવાળા bundle સાથે મળતો નહોતો. તેથી deployed after measurements ઉપલબ્ધ ગણ્યાં નથી. Hosting settings અથવા manual deployment બદલ્યાં નથી.

## Production checks

Next.js 16.4.2ની installed server/client, Script અને lazy-loading guides વાંચી. Full project check exit 0: metadata, dictionaries, ad inventory, ESLint, TypeScript અને translations. અગાઉની ત્રણ lint warnings છે; errors શૂન્ય. Targeted lint પણ પાસ. Production build exit 0; 4,067 static pages. Sandbox EPERM પછી મંજૂર access સાથે build ચલાવ્યો.

નવું build પહેલેથી રહેલા ત્રણ modified application files અને `src/lib/calculator-search-copy.ts` પણ સમાવે છે. આ અસંબંધિત ફેરફારો આ QA commitsમાં સામેલ નથી. `source-state.json`માં 274 source/config filesના SHA-256 hashes છે. તે copy module ફક્ત English-US/us loan અને English-US/Poland income-tax copy બદલે છે; retained matrixમાં પહેલો જ route આવે છે. Loanના ચાર viewport geometry અને detailed interactions ફરી પાસ થયા છે. Mortgageના ચાર વધારાના geometry/interaction checks પણ થયાં; તેમને નવા unique journeys તરીકે ગણ્યાં નથી.

Continuation વખતે તમામ 274 hashes ફરી સરખાવ્યાં; source/configમાં ફેરફાર મળ્યો નથી. તેથી આ checkpoint માટે build ફરી ચલાવવાની જરૂર પડી નથી. Local previewએ Next start સાથે standalone અંગે warning આપી; તેનો successful HTTP/browser QA standalone deployment acceptance ગણાતો નથી.

છ સ્થાનિક representative routes HTTP 200 છે. દરેક documentમાં denied consent defaults અને paused ad requests Google ad loaderની પહેલાં છે. Report-only header `script-src-attr 'none'` મળ્યો; production policyમાં `unsafe-eval` નથી. આ document-order checks છે, network consent certification નથી.

## Responsive matrix

જૂના raw ledgerનું requested journey, resolved route/alias, locale, configured home-country selection, fixed-country route અને દરેક recorded viewport સામે validation કર્યું. જૂના 823 attemptsમાંથી 816 unique completed combinations માન્ય છે. અધૂરા attempts ગણ્યાં નથી. Copy બદલાયેલા loanના ચાર જૂના checksને current-build rerunsથી બદલ્યાં છે. બાકીના 812 interactions અને 2,876 geometry records સંબંધિત source/UI યથાવત્ હોવાથી carry કર્યાં છે.

નવા checks ફક્ત permitted in-app browserમાં, serial રીતે, આ production build પર ચાલે છે. Viewport change પછી actual DOM width/height assert થાય છે. દરેક interaction recordમાં route, language, country અને baseline/restored states છે. `ledger.mjs`નું summary અને `coverage.csv` duplicates દૂર કરે છે. Profile visible editable controls, પ્રથમ inputનાં blank/malformed/upper-bound states અને recovery, checkboxes/radio choices, dropdown keyboard interaction, breakdown tabs, chart-legend focus, તથા દરેક locale/sizeના loan fixture પર shared menu/search તપાસે છે. દરેક inputનું arithmetic, native print/share, બધા chart points અને validation permutations આ profileમાં આવતાં નથી.

Screenshotનાં inherited `.png` નામોમાં JPEG bytes હોઈ શકે છે. Capture croppingને overflow ગણ્યું નથી; candidates actual DOM geometryમાંથી જ આવે છે. Raw geometry/interaction ledgers અને samples સ્થાનિક રીતે જ રાખ્યાં છે.

અંતિમ ledger validation: અગાઉના 816માંથી 812 unaffected checks carry કર્યા, નવા buildમાં 510 unique checks થયા; તેમાંથી ચાર અગાઉના unaffected mortgage checks સાથે overlap થાય છે. એટલે 812 + 510 − 4 = **1,318 unique passes**, અગાઉના checkpointથી **502 નવા combinations**. એક નવા incomplete attemptને ગણ્યો નથી. Geometryમાં 2,876 unaffected જૂના records અને ચાર loan rerunsથી 2,880 applicable combinations થાય છે; ચાર mortgage reruns વધારાના છે. નવું geometry count આઠ છે, આખું matrix નવા build પર ફરી ચલાવ્યું હોવાનો દાવો નથી. Loanના mobile અને large-desktop screenshots visually review કર્યાં.

Manifestના 720 country mappings calculator metadata અને actual selection/fallback rules સામે validate કર્યાં. Generic calculatorમાં unsupported preferred country હોય તો supported fallback દેશ રહે છે; fixed-country route પોતાની country રાખે છે. Coverage એ retained configured journeysનું પ્રમાણ છે, દરેક દેશ × દરેક calculatorનો દાવો નથી.

પહેલાનો continuation helper incomplete attempt પછી પણ cursor આગળ વધારતો હતો. તે QA-tooling bug સુધાર્યો: અધૂરા check પર cursor યથાવત્ રહે છે. Ledger પરથી cursor ફરી બનાવ્યો: **`{"route":329,"size":2}`**, `/pt-br/calculators/health/tdee`, **768×1024**. પહેલાં disk cursor size 3 બતાવતો હતો; હવે tabletનો અધૂરો check પહેલાં ફરી થશે. Summary helper raw local ledgers ન મળે તો તરત અટકે છે, જેથી clone પર ખાલી countsથી versioned evidence overwrite ન થાય. આ helper સુધારાની syntax/lint ચકાસાઈ છે; browser replay access બંધ હોવાથી pending છે.

## વાસ્તવિક regional consent, ads અને CSP

શરૂઆતમાં આ chatમાં browser access ઉપલબ્ધ હતું. પછી TDEE tablet checkમાં automatic approval review usage-limitને કારણે input fill અટક્યું. વપરાશકર્તાએ continue કહ્યું ત્યારે ફરી capability તપાસતાં **“Local browser use is disabled in Work settings”** મળ્યું. હાલ આ ચોક્કસ blocker છે; ordinary Codex usage ઉપલબ્ધ દેખાવાથી browser access મળતું નથી. Work settingsમાં local browser use ફરી enable થયા પછી ઉપરના ledger-derived cursorથી ચાલુ કરવું. Alternate browser automation અથવા approval bypass કર્યો નથી.

વપરાશકર્તાએ જણાવ્યું કે legitimate EEA/UK/Switzerland regional access હાલમાં ઉપલબ્ધ નથી. તેથી regional Accept, Manage/granular, reject, reopen, revoke, persistence અને tag/network verification હજી blocked છે. Region spoof, VPN change કે fake CMP responsesને regional pass તરીકે ઉપયોગ કર્યો નથી.

એક સ્વાભાવિક live home visitમાં “Privacy choices” ખોલતાં CMP-unavailable fallbackમાં Reject અને Close મળ્યાં; Accept નહોતું. Reject કરતાં dialog બંધ થયો. DOM, screenshot અને diagnostics સાચવ્યાં છે. Cause જાણી શકાયો નથી; આથી account misconfiguration અથવા policy violationનો નિષ્કર્ષ કાઢ્યો નથી. Guaranteed clean browser context પણ ઉપલબ્ધ capabilitiesથી પ્રમાણિત નથી.

તે મુલાકાતમાં real filled creative મળ્યો નથી; observed ad nodeનું size 0×0 હતું અને creative iframe નહોતું. તેથી filled-ad CLS, overlap અને responsiveness unverified છે. Ad click, repeated refresh, fake creative અથવા consent bypass કર્યાં નથી. Observed consoleમાં warnings/errors નહોતાં; એક pageનો આ sample સંપૂર્ણ Google integration pass નથી.

Live HTTP responseમાં report-only CSP header હવે હાજર હોવાનું ચકાસાયું છે. Enforced policy હજી inline permissions ધરાવે છે. નવી strict enforcement કરી નથી; real regional CMP અને filled ads વગર તેની safety certify થતી નથી.

Official references ફરી વાંચ્યાં: [Google callback queue / consent API](https://developers.google.com/funding-choices/fc-api-docs), [Google publisher CMP requirements](https://support.google.com/adsense/answer/13554116?hl=en). Google queue અને TCF event listener આગળના updates માટેનું documented mechanism છે. Preview parameters genuine regional targetingનો પુરાવો નથી. CMP certification અથવા simulationsથી સંપૂર્ણ legal compliance સાબિત થતી નથી.

## Git અને બાકી સ્થિતિ

Remote main fetch/compare કર્યા પછી ઉપરનો verified fix push કર્યો. Direct chat approval મળ્યા પછી push થયો; remote hash `a29a34ff4f4c6f601faf5466545bea0b32070081` તરીકે ચકાસ્યો. અસંબંધિત modified/untracked files સાચવ્યાં છે. આ checkpointના compact evidence, manifest અને QA helpers અલગ evidence commitમાં સાચવ્યાં છે; મોટા raw ledgers સ્થાનિક જ છે. `coverage.csv`માં તમામ 2,880 combinationsની completion સ્થિતિ છે, `matrix-summary.json`માં counts અને next cursor છે.

Open: mobile lab LCP root cause/after measurements, genuine regional consent, real filled ads, strict CSP enforcement અને field CWV. કોઈ “બધું પાસ” દાવો નથી.
