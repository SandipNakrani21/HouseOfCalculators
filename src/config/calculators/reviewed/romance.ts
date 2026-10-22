import type { ReviewedCountryCalculator } from "./types";
import { num, str, type CalculatorField, type FieldValues, type ResultRow } from "../types";
import type { CountryCode } from "@/config/countries";

const cent = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const positive = (n: number) => Math.max(0, n);
const money = (id: string, labelKey: string, value: number, min = 0, max = 1_000_000): CalculatorField => ({ id, labelKey, kind: "currency", default: value, min, max, step: .01, slider: false });
const row = (labelKey: string, value: number, tone: ResultRow["tone"] = "neutral"): ResultRow => ({ labelKey, value: cent(value), kind: "currency", decimals: 2, tone });
const band = (x: number, bounds: number[], rates: number[]) => bounds.reduce((total, upper, i) => total + positive(Math.min(x, upper) - (bounds[i - 1] ?? 0)) * rates[i] / 100, 0);
const annual = (v: FieldValues, slug: string) => num(v, slug === "income-tax" ? "income" : "salary") * (slug === "salary" && str(v, "period", "year") === "month" ? 12 : 1);
const wages = (slug: string, min: number, max = 250_000): CalculatorField[] => {
  const result = [money(slug === "income-tax" ? "income" : "salary", slug === "income-tax" ? "field.annualIncome" : "field.grossSalary", Math.max(60_000, min), min, max)];
  if (slug === "salary") {
    result[0].resolve = v => str(v, "period", "year") === "month" ? { min: Math.ceil(min / 12 * 100) / 100, max: Math.floor(max / 12 * 100) / 100 } : { min, max };
    result.push({ id: "period", kind: "select", labelKey: "field.payPeriod", default: "year", options: [{value:"year",labelKey:"option.perYear"},{value:"month",labelKey:"option.perMonth"}] });
  }
  return result;
};
type Social = { total: number; deductible: number; taxableAdd: number; rows: ResultRow[] };
// Full-year regular remuneration. Monthly bases/components are rounded before summing.
function frSocial(gross: number, v: FieldValues, current = false): Social {
  const pass = current ? 48060 : 47100, pmss = pass / 12;
  const employeeHealth = num(v, "employeeHealth", 360), employerHealth = num(v, "employerHealth", 360);
  const totalCents = Math.round(gross * 100), healthCents = Math.round(employerHealth * 100);
  let pension = 0, arrco = 0, ceg = 0, cet = 0, csgD = 0, csgN = 0, crds = 0;
  for (let month = 0; month < 12; month++) {
    const pay = (Math.floor(totalCents / 12) + (month < totalCents % 12 ? 1 : 0)) / 100;
    const benefit = (Math.floor(healthCents / 12) + (month < healthCents % 12 ? 1 : 0)) / 100;
    const t1 = Math.min(pay, pmss), t2 = positive(Math.min(pay, pmss*8) - pmss);
    const csgBase = cent(Math.min(pay, pmss*4) * .9825 + positive(pay - pmss*4) + benefit);
    pension += cent(t1 * .069) + cent(pay * .004);
    arrco += cent(t1 * .0315) + cent(t2 * .0864);
    ceg += cent(t1 * .0086) + cent(t2 * .0108);
    cet += gross > pass ? cent((t1 + t2) * .0014) : 0;
    csgD += cent(csgBase * .068); csgN += cent(csgBase * .024); crds += cent(csgBase * .005);
  }
  const deductibleHealth = Math.min(employeeHealth, .05*pass+.02*gross, .08*pass);
  const deductible = cent(pension + arrco + ceg + cet + csgD + deductibleHealth);
  return { total: cent(deductible + employeeHealth-deductibleHealth + csgN + crds), deductible, taxableAdd: employerHealth, rows: [row("result.romancePension",pension),row("result.romanceArrco",arrco+ceg+cet),row("result.romanceCsg",csgD+csgN+crds),row("field.romanceEmployeeHealth",employeeHealth)] };
}
function esSocial(gross: number): Social {
  const monthly = gross / 12, capped = Math.min(monthly,5101.2);
  const cc = cent(capped*.047)*12, unemployment = cent(capped*.0155)*12, training = cent(capped*.001)*12, mei = cent(capped*.0015)*12;
  const solidarity = (cent(positive(Math.min(monthly,5611.32)-5101.2)*.0019) + cent(positive(Math.min(monthly,7651.8)-5611.32)*.0021) + cent(positive(monthly-7651.8)*.0024))*12;
  const total = cent(cc+unemployment+training+mei+solidarity);
  return { total, deductible:total, taxableAdd:0, rows:[row("result.romanceCommon",cc),row("result.romanceUnemployment",unemployment+training),row("result.romanceMei",mei),row("result.romanceSolidarity",solidarity)] };
}
function itSocial(gross: number, v: FieldValues): Social {
  const base = str(v,"insuranceStart","post1995") === "post1995" ? Math.min(gross,122295) : gross;
  const ivs = cent(base*.0919), additional = cent(positive(base-56224)*.01), other = num(v,"otherSocial");
  const total=cent(ivs+additional+other);
  return {total,deductible:total,taxableAdd:0,rows:[row("result.romancePension",ivs),row("result.romanceExtraIvs",additional),row("field.romanceOtherSocial",other)]};
}
function beSocial(gross: number, v: FieldValues): Social {
  const onss=cent(cent(gross/12*.1307)*12), special=num(v,"specialSocial",731.28);
  return { total:cent(onss+special),deductible:onss,taxableAdd:0,rows:[row("result.romanceOnss",onss),row("field.romanceSpecialSocial",special)] };
}
const frHealthFields = () => [money("employeeHealth","field.romanceEmployeeHealth",360,0,3000),money("employerHealth","field.romanceEmployerHealth",360,0,3000)];
const itSocialFields = (): CalculatorField[] => [{id:"insuranceStart",kind:"select",labelKey:"field.romanceInsuranceStart",default:"post1995",options:[{value:"post1995",labelKey:"option.romancePost1995"},{value:"pre1996",labelKey:"option.romancePre1996"}]},money("otherSocial","field.romanceOtherSocial",0,0,10000)];
const scope: Record<string,string> = {fr:"review.scope.frEmployment",be:"review.scope.beEmployment",es:"review.scope.esMadridEmployment",it:"review.scope.itEmployment",pt:"review.scope.ptEmployment"};
const sources: Record<string,string[]> = {
 fr:["https://bofip.impots.gouv.fr/bofip/5956-PGP.html","https://www.service-public.gouv.fr/particuliers/vosdroits/F1989","https://www.service-public.gouv.fr/particuliers/vosdroits/F1419","https://www.service-public.gouv.fr/particuliers/vosdroits/F34328","https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/aides/frais.htm","https://www.service-public.gouv.fr/particuliers/vosdroits/F2302","https://reglementation.agirc-arrco.fr/home/liste-fiche-reglementaires/listes-area/liste-de-fiches-reglementaires/taux-de-cotisations.html","https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/DSS/2025/Chiffres-cles-DSS-2024-ed25.pdf"],
 be:["https://www.ejustice.just.fgov.be/mopdf/2026/08/12_1.pdf","https://fin.belgium.be/fr/particuliers/declaration-impot/revenus/taux-imposition","https://finances.belgium.be/fr/particuliers/declaration_impot/taux-imposition-revenus/revenus/revenus-professionnels","https://www.socialsecurity.be/site_fr/employer/infos/employers_nsso/which-contributions.htm","https://www.ksz-bcss.fgov.be/fr/project/cotisation-speciale-de-securite-sociale"],
 es:["https://www.boe.es/buscar/act.php?id=BOCM-m-2010-90068&p=20260710&tn=1","https://www.boe.es/buscar/act.php?id=BOE-A-2026-7296","https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-autonomico/comunidad-madrid.html","https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-ayuda-presentacion/irpf-2025/8-cumplimentacion-irpf/8_3-adecuacion-impuesto-circunstancias-personales-familiares/8_3_2-minimo-contribuyente.html","https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&lang=es&p=20260101&tn=1"],
 it:["https://www.inps.it/it/it/inps-comunica/notizie/dettaglio-news-page.news.2026.02.riduzione-irpef-e-incremento-delle-maggiorazioni-sociali.html","https://www.inps.it/it/it/inps-comunica/notizie/dettaglio-news-page.news.2026.02.lavoratori-dipendenti-limite-minimo-di-retribuzione-giornaliera-2026.html","https://www.gazzettaufficiale.it/eli/gu/2026/01/21/16/so/2/sg/pdf","https://www.inps.it/content/dam/inps-site/it/scorporati/circolari-e-messaggi/2025/01/Circolare_14806/Allegati/15874_Circolare-numero-26-del-30-01-2025.pdf","https://servizi2.inps.it/servizi/Bussola/visualizzadoc.aspx?sVirtuaLURL=%2Fcircolari%2FCircolare+numero+23+del+24-1-2007.htm","https://documenti.camera.it/leg19/dossier/pdf/VQ2112BIS.pdf","https://www.gazzettaufficiale.it/eli/id/2024/12/31/24G00229/sg","https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1986-12-22;917~art13!vig=2025-12-31"],
 pt:["https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/Folhetos_informativos/Documents/SFP-Taxas-2026.pdf","https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs68.aspx","https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs25.aspx","https://info.portaldasfinancas.gov.pt/pt/informacao_fiscal/codigos_tributarios/cirs_rep/Pages/irs68a.aspx","https://diariodarepublica.pt/dr/detalhe/portaria/480-a-2025-993056222","https://www.gov.pt/servicos/obter-informacoes-sobre-as-contribuicoes-para-a-seguranca-social-pagamento-de-entidade-empregadora-por-trabalhador-por-conta-de-outrem"]
};
const descriptions: Record<string,string> = {
 fr:"2025 metropolitan resident single, one tax share, ordinary non-executive private employee for all12 months, standard Agirc-Arrco split, no Alsace-Moselle. Annual gross includes all subject remuneration,12 near-equal payments; annual ceiling EUR47100. Capped/uncapped pension, Arrco T1/T2, CEG/CET, CSG/CRDS; actual annual qualifying mandatory mutual-health employee/employer amounts required. Employee health deduction capped at min(5%PASS+2%gross,8%PASS); excess added back. Combined plan contributions limited to social-exemption ceiling min(6%PASS+1.5%gross,12%PASS) by validation. No other benefits/pension/protection plans. Taxable wages add employer health and nondeductible CSG; 2026 assessment uses2025 wage deduction509–14555, bands11600/29579/84577/181917, single décote897−45.25% and EUR61 collection threshold. Whole-euro tax declaration approximation, no credits, other income, expenses election, dependants or high-income levy; gross capped250000. Social-only excludes income tax. Monthly net is annual/12, not payslip withholding.",
 be:"2026 income / 2027 assessment; resident single, no dependants, ordinary private profit-sector white-collar employment,12 equal annual contributory wage payments, gross at least EUR48000 to exclude low-wage work bonus. Ordinary employee ONSS13.07%, annual special social contribution is entered from final household assessment (not inferred from salary); municipal surcharge percentage entered for2026 municipality. Standard professional costs30% capped6070, tax bands16720/29510/51070 and11550 basic exempt slice per Gazette12August2026 tablesI/III.A; allowance tax reduction2887.50. Annual components rounded cents for illustration, not final-return settlement. No other income, benefits, special salary payments/holiday double-pay, expense election, regional credits or withholding. Social-only shows ONSS plus entered assessed special charge and excludes PIT. Annual net/12 is only an average.",
 es:"2026 ordinary permanent full-time Spanish General Regime employee with regular prorated extra pay and12 equal contribution months, annual contributory pay at least30000, no overtime/benefits/exemptions. Employee common4.7%, unemployment1.55%, training.1%, MEI.15%, monthly base capped5101.20; employee solidarity.19/.21/.24% above100/110/150% of cap. Monthly components rounded cents then summed. Income/salary additionally Madrid resident under65, single no dependants/disability, wage-only: social deduction plus2000 expense, state and Madrid scales minus separate minimum tax5550/5956.65. No other deductions/credits/other income, regional eligibility or payslip withholding. Social tool is national regime; income/salary limited to Madrid. Annual net/12 is average.",
 it:"2026 full-year resident ordinary FPLD employee, one wage source, no dependants/special reliefs. Employee IVS9.19%, additional1% above56224,122295 pension base cap only for first compulsory insurance after1995. Enter actual annual other compulsory employee contributions and actual assessed regional/municipal surtax; these are not inferred from national rate. Wage taxable income must exceed20000 (enforced), avoiding low-income cash-bonus/integrativo models. IRPEF23/33/43%, full365-day employment credit with statutory four-decimal ratios and65 increase, additional1000 credit through32000 tapering to40000. No expense/pension election, other income, special sectors, exempt bonuses, mothers/other contribution relief special2026 contract-renewal/shift/bonus substitute taxes or withholding. Standalone social excludes IRPEF/local tax. Annual estimates rounded cents, not return or pay-period reconciliation.",
 pt:"2026 mainland Portugal adult full-year ordinary employee, single no dependants, only categoryA wage income, gross at least30000 to exclude minimum-existence cases. Employee social11% on entered annual subject remuneration including holiday/Christmas payments; salary period monthly means annual/12 average. Deduction greater of4587.09 and mandatory social; official2026 practical IRS rate/offset table and solidarity2.5% above80000/5% above250000. Enter independently determined tax-credit/municipal-refund total already subject to eligibility/caps; default0 gives tax before those adjustments. No regional island rates, IRS Jovem/NHR/IFICI, disability, joint assessment, other income, benefit in kind or payslip withholding. Does not determine credit entitlement."
};
function review(country: string) { return {revision:["es","it","fr","be"].includes(country)?6:country === "pt"?6:5,period:country === "be"?"2026 income / 2027 assessment":["pt","es","it"].includes(country)?"2026 full-year ordinary employment":country === "fr"?"2025 wages / 2026 assessment":"2025 full-year ordinary employment",reviewed:["es","it","fr","be"].includes(country)?"2026-10-22":country === "pt"?"2026-10-20":"2026-10-19",scope:descriptions[country],sources:sources[country]}; }
function social(country: string,gross:number,v:FieldValues):Social {
 if(country ==="fr")return frSocial(gross,v); if(country==="es")return esSocial(gross); if(country==="it")return itSocial(gross,v); if(country==="be")return beSocial(gross,v);
 const amount=cent(gross*.11);return {total:amount,deductible:amount,taxableAdd:0,rows:[row("result.socialContributions",amount)]};
}
function wageTax(country:string,gross:number,v:FieldValues,s:Social):{tax:number;taxable:number;extra:ResultRow[]} {
 if(country === "fr") {
  const declared=Math.round(gross-s.deductible+s.taxableAdd);
  const costs=Math.min(declared,Math.round(Math.min(14555,Math.max(509,declared*.1))));
  const taxable=positive(declared-costs), before=band(taxable,[11600,29579,84577,181917,Infinity],[0,11,30,41,45]);
  const decote=positive(897-before*.4525);let tax=Math.round(positive(before-decote));if(tax<61)tax=0;
  return {tax,taxable,extra:[row("result.romanceEmploymentDeduction",costs),row("result.romanceTaxCredit",Math.min(before,decote))]};
 }
 if(country === "be") {
  const pay=positive(gross-s.deductible),costs=Math.min(pay*.3,6070),taxable=cent(pay-costs);
  const federal=cent(positive(band(taxable,[16720,29510,51070,Infinity],[25,40,45,50])-2887.5));
  const municipal=cent(federal*num(v,"municipalRate",7)/100);
  return {tax:cent(federal+municipal),taxable,extra:[row("result.romanceEmploymentDeduction",costs),row("result.romanceLocalTax",municipal)]};
 }
 if(country === "es") {
  const taxable=cent(positive(gross-s.deductible-2000));
  const state=cent(positive(band(taxable,[12450,20200,35200,60000,300000,Infinity],[9.5,12,15,18.5,22.5,24.5])-5550*.095));
  // The official Madrid scale publishes rounded accumulated quotas at each threshold.
  const madridBase=[0,13362.22,19004.63,35425.68,57320.4],quota=[0,1135.79,1739.53,3841.42,7651.1],rates=[.085,.107,.128,.174,.205];
  let i=0;while(i<4&&taxable>madridBase[i+1])i++;
  const regional=cent(positive(quota[i]+(taxable-madridBase[i])*rates[i]-cent(5956.65*.085)));
  return {tax:cent(state+regional),taxable,extra:[row("result.romanceStateTax",state),row("result.romanceLocalTax",regional)]};
 }
 if(country === "it") {
  const taxable=cent(positive(gross-s.deductible));const ratio=(a:number)=>Math.floor(positive(a)*10000)/10000;
  let credit=taxable<=28000?1910+1190*ratio((28000-taxable)/13000):taxable<=50000?1910*ratio((50000-taxable)/22000):0;
  if(taxable>25000&&taxable<=35000)credit+=65;
  const extraCredit=taxable<=32000?1000:taxable<40000?1000*(40000-taxable)/8000:0;
  const national=cent(positive(band(taxable,[28000,50000,Infinity],[23,33,43])-credit-extraCredit));
  return {tax:cent(national+num(v,"localTax")),taxable,extra:[row("result.romanceTaxCredit",credit+extraCredit),row("result.romanceLocalTax",num(v,"localTax"))]};
 }
 const taxable=cent(positive(gross-Math.max(4587.09,s.deductible)));
 const upper=[8342,12587,17838,23089,29397,43090,46566,86634,Infinity], rates=[12.5,15.7,21.2,24.1,31.1,34.9,43.1,44.6,48], offsets=[0,266.94,959.13,1476.45,3092.77,4209.94,7743.27,8441.48,11387.17];
 const index=upper.findIndex(limit=>taxable<=limit), ordinary=taxable*rates[index]/100-offsets[index];
 const solidarity=cent(positive(Math.min(taxable,250000)-80000)*.025+positive(taxable-250000)*.05);
 return {tax:cent(positive(cent(ordinary)+solidarity-num(v,"taxCredits"))),taxable,extra:[row("result.romanceSolidarity",solidarity),row("field.romanceTaxCredits",num(v,"taxCredits"))]};
}
function wageEntry(country:CountryCode,slug:string):ReviewedCountryCalculator {
 return {slug,country,scopeKey:scope[country],review:review(country),fields:()=>[
  ...wages(slug,country==="be"?48000:country==="fr"?22000:30000,country==="fr"?250000:1_000_000),
  ...(country==="fr"?frHealthFields():country==="it"?itSocialFields():[]),
  ...(country==="be"?[money("specialSocial","field.romanceSpecialSocial",731.28,0,731.28),{id:"municipalRate",kind:"percent" as const,labelKey:"field.romanceMunicipalRate",default:7,min:0,max:10,step:.01}]:[]),
  ...(country==="it"?[money("localTax","field.romanceLocalTax",1000,0,100000)]:[]),
  ...(country==="pt"?[money("taxCredits","field.romanceTaxCredits",0,0,100000)]:[])
 ],validate:v=>{
  const gross=annual(v,slug),s=social(country,gross,v);
  if(s.total>gross)return "error.romanceDeductions";
  if(country==="it"&&gross-s.deductible<=20000)return "error.romanceItMinimum";
  if(country==="fr"&&(num(v,"employerHealth",360)<num(v,"employeeHealth",360)||num(v,"employerHealth",360)+num(v,"employeeHealth",360)>Math.min(5652,2826+.015*gross)))return "error.romanceHealth";
  return null;
 },compute:v=>{
  const gross=annual(v,slug),s=social(country,gross,v),tax=wageTax(country,gross,v,s),net=cent(gross-s.total-tax.tax);
  return {primary:row("result.romanceRemainder",net,"principal"),rows:[row("result.grossAnnual",gross),row("result.taxableIncome",tax.taxable),...s.rows,row("result.incomeTax",tax.tax,"tax"),...tax.extra,row("result.totalDeductions",s.total+tax.tax,"tax"),row("result.romanceMonthlyRemainder",net/12,"principal")],chart:[{labelKey:"result.romanceRemainder",value:net,tone:"principal"},{labelKey:"result.incomeTax",value:tax.tax,tone:"tax"},{labelKey:"result.socialContributions",value:s.total,tone:"neutral"}],notes:[{key:scope[country]}]};
 }};
}
function socialEntry(country:CountryCode):ReviewedCountryCalculator {
 return {slug:"social-security",country,scopeKey:country==="fr"?"review.scope.frSocial2026":country==="be"?"review.scope.beSocial2026":scope[country],review:country==="fr"?{...review(country),revision:6,period:"2026 ordinary employee contributions",reviewed:"2026-10-22",scope:"2026 metropolitan ordinary non-executive employee,12 regular monthly payments, PASS48060/PMSS4005. Standard employee pension/Agirc-Arrco/CEG/CET,CSG/CRDS and actual qualifying health premiums; no income tax, benefits, exemptions, Alsace-Moselle or employer contributions. Health limits updated to current PASS. Annual approximation with each monthly component rounded cents.",sources:[...sources.fr,"https://www.legifrance.gouv.fr/eli/arrete/2025/12/22/CPPS2536168A/jo/texte"]}:country==="be"?{...review(country),revision:6,period:"2026 ordinary employee contributions",reviewed:"2026-10-22",scope:"2026 ordinary profit-sector white-collar employee,12 equal payments,gross at least48000; employee ONSS13.07%, entered actual final household special contribution0–731.28. No PIT, work bonus, benefits, special wages or payslip assessment; monthly components rounded cents and annualized.",sources:[...sources.be,"https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/socialsecuritycontributions/contributions/ordinarycontributions.html"]}:review(country),fields:()=>[money("salary","field.annualContributionBase",60000,country==="be"?48000:country==="fr"?22000:30000),...(country==="fr"?frHealthFields():country==="it"?itSocialFields():country==="be"?[money("specialSocial","field.romanceSpecialSocial",731.28,0,731.28)]:[])],validate:v=>(country==="fr"?frSocial(num(v,"salary"),v,true):social(country,num(v,"salary"),v)).total>num(v,"salary")?"error.romanceDeductions":country==="fr"&&(num(v,"employerHealth",360)<num(v,"employeeHealth",360)||num(v,"employerHealth",360)+num(v,"employeeHealth",360)>Math.min(5767.2,2883.6+.015*num(v,"salary")))?"error.romanceHealth":null,compute:v=>{
 const s=(country==="fr"?frSocial(num(v,"salary"),v,true):social(country,num(v,"salary"),v));return {primary:row("result.annualContribution",s.total,"tax"),rows:[...s.rows,row("result.averageMonthlyContribution",s.total/12)],notes:[{key:country==="fr"?"review.scope.frSocial2026":country==="be"?"review.scope.beSocial2026":scope[country]}]};
 }};
}
export const romanceReviewed: ReviewedCountryCalculator[] = [
 ...(["fr","be","es","it","pt"] as CountryCode[]).flatMap(country=>[wageEntry(country,"income-tax"),wageEntry(country,"salary")]),
 ...(["fr","be","es","it"] as CountryCode[]).map(socialEntry)
];

function frEmployer(gross:number,v:FieldValues) {
 let pension=0,insurance=0,arrco=0,general=0;
 const cents=Math.round(gross*100);
 for(let month=0;month<12;month++) {
  const pay=(Math.floor(cents/12)+(month<cents%12?1:0))/100,t1=Math.min(pay,4005),t2=positive(Math.min(pay,32040)-4005),t4=Math.min(pay,16020);
  pension+=cent(t1*.0855)+cent(pay*.0211);
  insurance+=cent(t4*.04)+cent(t4*.0025);
  arrco+=cent(t1*.0472)+cent(t2*.1295)+cent(t1*.0129)+cent(t2*.0162)+(gross>48060?cent((t1+t2)*.0021):0);
  general+=[.13,.0525,.003,.00016,.0055,.0068,num(v,"accidentRate",1)/100].reduce((sum,rate)=>sum+cent(pay*rate),0)+cent(t1*.001);
 }
 return {total:cent(pension+insurance+arrco+general),rows:[row("levy.pensionInsurance",pension),row("result.romanceUnemployment",insurance),row("result.romanceArrco",arrco),row("result.romanceEmployerLevies",general)]};
}
const frEmployerScope="2026 metropolitan private profit-sector employer with1–10 employees, no threshold transition/sector special charge, ordinary permanent non-executive employee,12 near-equal payments, gross80000–250000 so full health13%/family5.25% and no general low-pay relief. Standard pension/Arrco shares and48060 annual ceiling; unemployment4% all year with4PASS cap, AGS.25%, FNAL.1% capped, CSA.3%, dialogue.016%, training.55%, apprenticeship.68%. Enter actual annual average AT/MP rate, employer mandatory mutual-health amount and remaining mandatory company/sector charges, insurance/occupational health and benefits not already modeled. No mobility/PEEC/social forfait under stated headcount, no tax on salaries (VAT-liable employer), no exemptions/first-hire subsidies/bonus-malus/overtime/special contracts. Output is wage cost of entered package, not employee net or blanket national burden. Other-cost input must come from payroll records; zero only when no additional costs exist.";
const beEmployerScope="2026 Belgian ordinary white-collar employee of private profit-sector employer subject to standard25% employer ONSS, no reduced/first-hire/target-group rates, annual subject wage48000–250000 including all subject bonuses, no quarter above85000 so high-pay cap does not apply. Ordinary employer contribution calculated at25% of entered subject remuneration; separately enter actual annual non-ONSS remuneration (including normal double holiday pay), special/sector employer contributions, accident insurance, benefits and other mandatory employment costs from payroll records, without double counting. No worker/manual108% base, nonprofit/public sector, flexi/student, special remuneration or subsidy eligibility determination. This computes employer cost from statutory ordinary ONSS plus actual package costs; it does not infer those variable costs from a universal percentage and does not compute employee tax/net salary.";
for(const country of ["fr","be"] as const) {
 const employerScope=country==="fr"?frEmployerScope:beEmployerScope;
 const scopeKey=country==="fr"?"review.scope.frEmployer":"review.scope.beEmployer";
 romanceReviewed.push({slug:"payroll",country,scopeKey,review:{revision:6,period:"2026 ordinary employer wage cost",reviewed:"2026-10-22",scope:employerScope,sources:country==="fr"?[...sources.fr,"https://www.urssaf.fr/accueil/employeur/cotisations/liste-cotisations/assurance-chomage-ags.html","https://entreprendre.service-public.gouv.fr/vosdroits/F22570","https://entreprendre.service-public.gouv.fr/vosdroits/F33308","https://www.urssaf.fr/accueil/actualites/informations-nouvelle-annee.html","https://entreprendre.service-public.gouv.fr/vosdroits/F31415"]:[...sources.be,"https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/deductions/otheremployersreductions/partial_exemption_very_high_salaries.html"]},fields:()=>[
 money("salary","field.annualContributionBase",country==="fr"?90000:60000,country==="fr"?80000:48000,250000),
 ...(country==="fr"?[{id:"accidentRate",kind:"percent" as const,labelKey:"field.romanceAccidentRate",default:1,min:0,max:20,step:.01},money("employerHealth","field.romanceEmployerHealth",360,0,3000)]:[money("nonSubjectPay","field.romanceNonSubjectPay",4600,0,100000)]),
 money("otherEmployerCosts","field.romanceOtherEmployerCosts",0,0,100000),
 {id:"actualCostsConfirmed",kind:"toggle" as const,labelKey:"field.romanceCostsConfirmed",default:false}
 ],validate:v=>country==="fr"&&num(v,"employerHealth",360)>Math.min(5767.2,2883.6+.015*num(v,"salary"))?"error.romanceHealth":v.actualCostsConfirmed===true?null:"error.romanceActualCosts",compute:v=>{
 const gross=num(v,"salary"),base=country==="fr"?frEmployer(gross,v):{total:cent(gross*.25),rows:[row("result.romanceOnss",gross*.25)]};
 const other=num(v,"otherEmployerCosts")+(country==="fr"?num(v,"employerHealth",360):num(v,"nonSubjectPay",4600));
 const cost=cent(gross+base.total+other);
 return {primary:row("result.employerCost",cost,"principal"),rows:[row("result.grossAnnual",gross),...base.rows,row("result.employerContributions",base.total,"tax"),row("field.romanceOtherEmployerCosts",other),row("result.romanceMonthlyCost",cost/12)],notes:[{key:scopeKey}]};
 }});
}
