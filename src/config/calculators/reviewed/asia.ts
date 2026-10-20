import { bool, num, str, type CalculatorField, type CalculatorResult, type FieldValues, type ResultRow } from "../types";
import type { CountryCode } from "@/config/countries";
import type { ReviewedCountryCalculator } from "./types";

const cents = (n: number) => Math.round((n + Number.EPSILON * Math.max(1, Math.abs(n))) * 100) / 100;
const money = (id: string, labelKey: string, value: number, min = 0, max = 100_000_000, step = .01): CalculatorField => ({ id, labelKey, kind: "currency", default: value, min, max, step, slider: false });
const row = (labelKey: string, value: number): ResultRow => ({ labelKey, value, kind: "currency", decimals: 2 });
function scaleTax(base: number, bands: [number, number][]): number {
  return bands.reduce((total, [floor, rate], index) => total + Math.max(0, Math.min(base, bands[index + 1]?.[0] ?? Infinity) - floor) * rate / 100, 0);
}
const sources = {
  tr: ["https://www.sgk.gov.tr/Content/Post/2e0c9e1a-2cfe-4456-af10-49d3de0c58ba/Prime-Esas-Kazanc-Miktarlari-2026-01-14-10-35-39","https://www.csgb.gov.tr/poco-pages/asgari-ucret","https://intvrg.gib.gov.tr/hazirbeyan/assets/pdf/DUYURU_UNIVERSAL_2026_2026_Ucret_Geliri.pdf","https://cdn.gib.gov.tr/api/gibportal-file/file/getFile?objectKey=MEVZUAT_TEBLIGLER/UNIVERSAL/2025/488_Teblig71.pdf"],
  br: ["https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2026","https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm","https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal"],
  cn: ["https://shanghai.chinatax.gov.cn/zcfw/zcfgk/grsds/201809/t441789.html", "https://guangdong.chinatax.gov.cn/gdsw/fssw_nsrxt_sex_rdzl/2026-04/15/content_fe1213ad91c4412b8b665af7de3309a7.shtml", "https://www.chinatax.gov.cn/n810219/n810744/n3752930/n3752974/c3970366/content.html", "https://12366.chinatax.gov.cn/bzds/079/079.html"],
  jp: ["https://www.nta.go.jp/taxes/shiraberu/shinkoku/tebiki/2025/pdf/001.pdf", "https://www.nta.go.jp/taxes/shiraberu/shinkoku/tebiki/2025/pdf/050.pdf", "https://www.nta.go.jp/publication/pamph/shotoku/fukko_tokubetsu/pdf/0014060.pdf", "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm"],
  mx: ["https://www.sat.gob.mx/minisitio/NormatividadRMFyRGCE/documentos2026/rmf/anexos/Anexo-8-RMF-2026_DOF-28122025.pdf","https://sidof.segob.gob.mx/notas/docFuente/5777219","https://sidof.segob.gob.mx/notas/docFuente/5777649","https://www.gob.mx/conasami/prensa/consejo-de-representantes-de-la-conasami-acuerda-incremento-de-13-al-salario-minimo-general-en-2026?idiom=es"],
};
const scope = (country: string) => `review.scope.asia.${country}`;
const scopeDescriptions: Record<string, string> = {
  tr: "2026 ordinary private-sector resident 4/a employee, one employer, twelve equal full-month wages above TRY33030.00/month. Monthly employee SGK14% plus unemployment1%, monthly base cap297270.00. Deduct those contributions before cumulative wage-income tariff15/20/27/35/40 with wage third breakpoint1500000. Monthly minimum-wage tax exemption using cumulative minimum-wage base, plus stamp tax0.759% only above minimum wage. No bonuses, partial periods, pensioners, reliefs, other income or BES. Annual withholding totals before return settlement and average monthly output, not an individual payslip. Contribution-only tool excludes income/stamp taxes.",
  br: "2026 calendar-year single resident employee, twelve equal regular contributory wage payments, no other income/dependants/credits. Monthly progressive INSS January2026 bands1621/2902.84/4354.27/8475.55 at7.5/9/12/14, capped and rounded to cents each month. Annual2026 IRPF assessment uses official annual tariff (not monthly table multiplied by12), and whichever is larger of actual modeled INSS or20% simplified deduction capped17640.00. Annual tax reduction: gross taxable wage income up to60000 produces zero tax;60000.01–88200 reduction8429.73 minus0.095575 times gross, capped at computed tax, none above88200. Literal published formula retained at inclusive upper endpoint. Wage-only ordinary tax already exceeds any high-income minimum; other income/dividends excluded. Excludes13th salary, vacation additional pay, irregular remuneration, benefits, other itemized deductions, withholding settlement/refunds or employer contributions. Salary monthly output is annual assessment average. Contribution-only tool excludes IRPF.",
  cn: "2026 full-year resident ordinary wage-only annual IIT, RMB60000 expense deduction and official3–45% comprehensive-income bands. Enter actual eligible employee social insurance/housing-fund payments and other independently verified eligible deductions from records; these are deductible before IIT and actual payments are also subtracted from wages. No invented national social/housing percentage, nonresident treatment, separately-taxed bonuses, other income, foreign credits, tax relief or refund/withholding settlement. Salary output is annual average after this tax and entered actual contributions, not a complete payslip.",
  jp: "2025 full-year resident wage-only NATIONAL income tax plus2.1% reconstruction tax, single with no dependants/credits/adjustment deduction or other income. Official2025 salary-income table including JPY4000 bucketing below6.6m and new650000 minimum employment deduction; revised basic deduction950000/880000/680000/630000/580000 with high-income taper. Enter actual annual eligible social premiums; national taxable income floors to1000yen, reconstruction tax floors to1yen. Liability is before withholding settlement;100yen rounding of the final balance after credits is not applied prematurely. Local resident tax is NOT calculated from national taxable income: salary comparison subtracts only separately entered actual assessed local tax. No current-year local-tax estimate, benefits, employer charges or final refund/payment determination.",
  mx: "2026 resident fully taxable ordinary wage-only annual ISR under official SAT2026 Annex8 sectionC.II fixed-fee/lower-limit tariff, no personal deductions or other income. Wages restricted to at leastMXN180000 with twelve equal monthly payments above2026 employment-subsidy monthly limit11492.66 and both minimum-wage zones; no subsidy entitlement. Enter actual employee IMSS from records: it is subtracted from cash wages, not deducted again from ISR base. No automatic2.775% approximation. Excludes exempt benefit components, minimum-wage exemption, aguinaldo/vacation exemptions, bonuses, other deductions, annual employer adjustment/refund settlement and employer contributions. Annual average after modeled deductions, not a payslip.",
};
function review(country: keyof typeof sources, description = scopeDescriptions[country], period = ["cn", "tr", "mx", "br"].includes(country) ? "2026" : "2025") {
  return { revision: ["cn", "tr", "mx", "br"].includes(country) ? 7 : 6, period, reviewed: ["cn", "tr", "mx", "br"].includes(country) ? "2026-10-20" : "2026-10-19", scope: description, sources: sources[country] };
}
const defaults = { tr: 600_000, br: 60_000, jp: 6_000_000, cn: 240_000, mx: 300_000 };
type WageCountry = keyof typeof defaults;

/** Pure full-year calculations; no tariff is annualised from a current monthly table. */
export function asiaWageAmounts(country: WageCountry, gross: number, actualSocial = 0, other = 0, local = 0) {
  let social = actualSocial, taxable = gross, tax = 0, stamp = 0;
  if (country === "tr") {
    const monthly = gross / 12;
    const base = Math.min(monthly, 297_270.00);
    const monthlySocial = cents(base * .14) + cents(base * .01);
    social = cents(monthlySocial * 12);
    taxable = cents(gross - social);
    const tariff: [number, number][] = [[0, 15], [190000, 20], [400000, 27], [1500000, 35], [5300000, 40]];
    let previous = 0, previousMinimum = 0;
    for (let month = 1; month <= 12; month++) {
      const cumulative = scaleTax(cents((monthly - monthlySocial) * month), tariff);
      // Employee minimum-wage premiums: 4624.20 +330.30 =4954.50 monthly.
      const minimum = scaleTax(cents(28075.50 * month), tariff);
      tax += Math.max(0, cents(cumulative - previous) - cents(minimum - previousMinimum));
      previous = cumulative; previousMinimum = minimum;
    }
    tax = cents(tax);
    stamp = cents(cents(Math.max(0, monthly - 33030.00) * .00759) * 12);
  } else if (country === "br") {
    social = cents(brazilMonthlyContribution(gross / 12, "2026") * 12);
    const deduction = Math.max(social, Math.min(gross * .2, 17640.00));
    taxable = Math.max(0, cents(gross - deduction));
    const tariff = [[0,0,0],[29145.60,.075,2185.92],[33919.80,.15,4729.91],[45012.60,.225,8105.85],[55976.16,.275,10904.66]];
    const band = tariff.findLast(([floor]) => taxable > floor) ?? tariff[0];
    const ordinary = cents(Math.max(0, taxable * band[1] - band[2]));
    // The published coefficient leaves an exact half-cent at BRL88200.
    // Integer units avoid cancellation turning0.015 into0.014999999999.
    const reduction = gross <= 60000 ? ordinary : gross <= 88200
      ? Math.round(Math.max(0,842_973_000_000 - 95_575 * Math.round(gross * 100)) / 1_000_000) / 100 : 0;
    tax = cents(Math.max(0,ordinary - Math.min(ordinary,reduction)));
  } else if (country === "cn") {
    taxable = Math.max(0, cents(gross - 60000 - social - other));
    tax = cents(scaleTax(taxable, [[0, 3], [36000, 10], [144000, 20], [300000, 25], [420000, 30], [660000, 35], [960000, 45]]));
  } else if (country === "jp") {
    const income = japanSalaryIncome(gross);
    const basic = income <= 1320000 ? 950000 : income <= 3360000 ? 880000 : income <= 4890000 ? 680000 : income <= 6550000 ? 630000 : income <= 23500000 ? 580000 : income <= 24000000 ? 480000 : income <= 24500000 ? 320000 : income <= 25000000 ? 160000 : 0;
    taxable = Math.floor(Math.max(0, income - basic - social) / 1000) * 1000;
    const ordinary = scaleTax(taxable, [[0, 5], [1950000, 10], [3300000, 20], [6950000, 23], [9000000, 33], [18000000, 40], [40000000, 45]]);
    // Tax liability precedes withholding credits. The final balance payable
    // has its own JPY100 rounding AFTER those credits and is not this output.
    tax = ordinary + Math.floor(ordinary * .021);
  } else {
    const table = [[.01,0,.0192],[10135.12,194.59,.064],[86022.12,5051.37,.1088],[151176.20,12140.13,.16],[175735.67,16069.64,.1792],[210403.70,22282.14,.2136],[424353.98,67981.92,.2352],[668840.15,125485.07,.30],[1276925.99,307910.81,.32],[1702567.98,444116.23,.34],[5107703.93,1601862.46,.35]];
    const band = table.findLast(([floor]) => gross >= floor) ?? table[0];
    tax = cents(Math.max(0, band[1] + (gross - band[0]) * band[2]));
  }
  return { gross, social, taxable, tax, stamp, local: country === "jp" ? local : 0, net: cents(gross - social - tax - stamp - (country === "jp" ? local : 0)) };
}
export function japanSalaryIncome(gross: number): number {
  if (gross < 651000) return 0;
  if (gross < 1900000) return gross - 650000;
  if (gross < 3600000) return Math.floor(gross / 4000) * 2800 - 80000;
  if (gross < 6600000) return Math.floor(gross / 4000) * 3200 - 440000;
  if (gross < 8500000) return Math.floor(gross * .9 - 1100000);
  return gross - 1950000;
}
export function brazilMonthlyContribution(gross: number, year: "2025" | "2026" = "2025"): number {
  // Preserve the explicit historical2025 helper path; current wage and
  // standalone contribution models request2026 after authority comparison.
  return year === "2026"
    ? cents(scaleTax(Math.min(gross,8475.55),[[0,7.5],[1621,9],[2902.84,12],[4354.27,14]]))
    : cents(scaleTax(Math.min(gross,8157.41),[[0,7.5],[1518,9],[2793.88,12],[4190.83,14]]));
}
function wageFields(country: WageCountry, salary: boolean): CalculatorField[] {
  const result = [money(salary ? "salary" : "income", "field.annualIncome", defaults[country], country === "tr" ? 396360 : country === "mx" ? 180000 : country === "br" ? 19452 : 0, country === "jp" ? 100000000 : 10000000, country === "jp" ? 1 : .01)];
  if (["jp", "cn", "mx"].includes(country)) result.push(money("actualSocial", "asia.field.actualSocial", 0, 0, 100000000, country === "jp" ? 1 : .01));
  if (country === "cn") result.push(money("otherEligible", "asia.field.otherEligible", 0));
  if (country === "jp" && salary) result.push(money("actualLocalTax", "asia.field.actualLocalTax", 0, 0, 100000000, 1));
  return result;
}
function wageResult(country: WageCountry, salary: boolean, v: FieldValues): CalculatorResult {
  const a = asiaWageAmounts(country, num(v, salary ? "salary" : "income"), num(v, "actualSocial"), num(v, "otherEligible"), salary ? num(v, "actualLocalTax") : 0);
  const rows = [row("result.grossIncome", a.gross), row("result.taxableIncome", a.taxable), row("result.incomeTax", a.tax), row("levy.socialSecurity", a.social)];
  if (country === "tr") rows.push(row("asia.result.stampTax", a.stamp));
  if (country === "jp" && salary) rows.push(row("asia.field.actualLocalTax", a.local));
  rows.push(row("result.monthlyAfterModelledDeductions", a.net / 12));
  return { primary: { ...row("result.annualAfterModelledDeductions", a.net), emphasis: true }, rows, chart: [{ labelKey: "result.annualAfterModelledDeductions", value: Math.max(0, a.net), tone: "principal" }, { labelKey: "result.totalDeductions", value: a.gross - a.net, tone: "tax" }], notes: [{ key: scope(country) }] };
}
const wages: ReviewedCountryCalculator[] = (Object.keys(defaults) as WageCountry[]).flatMap(country => ["income-tax", "salary"].map(slug => ({
  slug, country: country as CountryCode, scopeKey: scope(country), review: review(country),
  fields: () => wageFields(country, slug === "salary"),
  compute: (v: FieldValues) => wageResult(country, slug === "salary", v),
  validate: (v: FieldValues) => num(v, "actualSocial") + num(v, "otherEligible") + (slug === "salary" ? num(v, "actualLocalTax") : 0) > num(v, slug === "salary" ? "salary" : "income") ? "asia.error.deductions" : null,
})));

function contributionResult(key: string, components: ResultRow[], scopeKey: string): CalculatorResult {
  const total = cents(components.reduce((sum, component) => sum + Number(component.value), 0));
  return { primary: { ...row(key, total), emphasis: true }, rows: components, chart: components.map(component => ({ labelKey: component.labelKey, value: Number(component.value), tone: "tax" })), notes: [{ key: scopeKey }] };
}
const socialScope = (country: string) => `review.scope.asiaSocial.${country}`;
const social: ReviewedCountryCalculator[] = [
  {
    slug: "social-security", country: "tr", scopeKey: socialScope("tr"), review: review("tr"),
    fields: () => [money("salary", "field.annualContributionBase", 600000, 396360, 10000000)],
    compute: v => {
      const monthly = Math.min(num(v, "salary") / 12, 297270.00);
      return contributionResult("result.annualContribution", [row("levy.sgk", cents(cents(monthly * .14) * 12)), row("levy.unemploymentInsurance", cents(cents(monthly * .01) * 12))], socialScope("tr"));
    },
  },
  {
    slug: "social-security", country: "br", scopeKey: socialScope("br"), review: { ...review("br", "2026 ordinary employee, domestic employee or avulso monthly contributory remuneration, progressive employee INSS only, bands1621/2902.84/4354.27/8475.55 and7.5/9/12/14percent, capped at top base. Single employer, full month, no13th pay, irregular earnings, employer shares, self-employed contributions, pension benefits or income tax.", "2026"), reviewed: "2026-10-20", sources: ["https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal"] },
    fields: () => [money("salary", "asia.field.monthlyBase", 5000, 1621, 1000000)],
    compute: v => contributionResult("asia.result.monthlyContribution", [row("levy.inss", brazilMonthlyContribution(num(v, "salary"), "2026"))], socialScope("br")),
  },
];

// Values are the formally assessed standard monthly remunerations, not a
// guessed percentage of current cash pay; annual revisions can lag that pay.
const jpHealthBases = [58000,68000,78000,88000,98000,104000,110000,118000,126000,134000,142000,150000,160000,170000,180000,190000,200000,220000,240000,260000,280000,300000,320000,340000,360000,380000,410000,440000,470000,500000,530000,560000,590000,620000,650000,680000,710000,750000,790000,830000,880000,930000,980000,1030000,1090000,1150000,1210000,1270000,1330000,1390000];
const jpPensionBases = [88000,98000,104000,110000,118000,126000,134000,142000,150000,160000,170000,180000,190000,200000,220000,240000,260000,280000,300000,320000,340000,360000,380000,410000,440000,470000,500000,530000,560000,590000,620000,650000];
const assessedSelect = (id: string, labelKey: string, values: number[]): CalculatorField => ({ id, labelKey, kind: "select", default: "300000", options: values.map(value => ({ value: String(value), labelKey, label: String(value) })) });
const yenEmployeeRound = (value: number) => Math.ceil(value - .5 - 1e-8);
social.push({
  slug: "social-security", country: "jp", scopeKey: socialScope("jp"),
  review: { revision: 6, period: "2025-04 to 2025-12, Tokyo Kyokai Kenpo", reviewed: "2026-10-19", scope: "One full month, ordinary Tokyo Kyokai Kenpo employee age20–64 enrolled in employee pension and general-industry employment insurance. Enter insurer-assessed standard monthly health and pension remuneration separately; official health50grades58000–1390000, pension32grades88000–650000. Employee half health9.91%, half care1.59% only40–64, half pension18.3%, unemployment0.55% of actual insured wages. Standard payroll employee half-yen round-down convention, not employer-side total-premium rounding. No bonuses, agriculture/construction, other prefectures/insurers, age/eligibility determination, exempt months, resident tax or income tax. Not a full-year2025 multiplication: rates differ before April.", sources: ["https://www.kyoukaikenpo.or.jp/about/business/insurance_rate/premium_prefectures/r07/", "https://www.nenkin.go.jp/service/kounen/hokenryo/hoshu/20150515-01.html", "https://www.mhlw.go.jp/content/001401966.pdf", "https://www.kyoukaikenpo.or.jp/assets/13tokyo_7.pdf", "https://jsite.mhlw.go.jp/kanagawa-roudoukyoku/hourei_seido_tetsuzuki/roudou_hoken/hourei_seido/Hoken.html"] },
  fields: () => [money("salary", "asia.field.monthlyInsuredWages", 300000, 88000, 10000000, 1), assessedSelect("healthBase", "asia.field.assessedHealth", jpHealthBases), assessedSelect("pensionBase", "asia.field.assessedPension", jpPensionBases), { id: "care", labelKey: "asia.field.age40to64", kind: "toggle", default: false }],
  validate: v => !jpHealthBases.includes(num(v, "healthBase", 300000)) || !jpPensionBases.includes(num(v, "pensionBase", 300000)) ? "asia.error.assessedBase" : null,
  compute: v => contributionResult("asia.result.monthlyContribution", [row("levy.healthInsurance", yenEmployeeRound(num(v, "healthBase", 300000) * (bool(v, "care") ? .0575 : .04955))), row("levy.pensionInsurance", yenEmployeeRound(num(v, "pensionBase", 300000) * .0915)), row("levy.unemploymentInsurance", yenEmployeeRound(num(v, "salary") * .0055))], socialScope("jp")),
});
social.push({
  slug: "social-security", country: "cn", scopeKey: socialScope("cn"),
  review: { revision: 6, period: "2025-07 to 2025-12, Beijing", reviewed: "2026-10-19", scope: "One full month of ordinary Beijing enterprise employee contributions July–December2025. Enter assessed prior-year average monthly contribution wage, clamp to7162–35811; employee pension8%, basic health2% plusRMB3 mutual assistance, unemployment0.5%, each component rounded tofen. No housing fund (separate scheme), employer shares, other cities, flexible/self employment, retirees, wage-tax assessment, back-payment or benefits. Previous-year base is not assumed to equal current cash salary. Not a full-year2025 estimate.", sources: ["https://www.beijing.gov.cn/fuwu/bmfw/sy/jrts/tzxx/202509/t20250919_4205649.html", "https://www.beijing.gov.cn/gongkai/zfxxgk/zc/gz/202112/t20211216_2562734.html", "https://www.bjft.gov.cn/ftq/zfgg/202402/16dd5bdf45014b0c992253b520080ebb.shtml", "https://rsj.beijing.gov.cn/xxgk/2024zcwj/202412/t20241227_3974925.html", "https://www.beijing.gov.cn/zhengce/gfxwj/201905/t20190522_56520.html"] },
  fields: () => [money("salary", "asia.field.assessedMonthlyBase", 20000, 0, 1000000)],
  compute: v => {
    const base = Math.min(35811, Math.max(7162, num(v, "salary")));
    return contributionResult("asia.result.monthlyContribution", [row("levy.pensionInsurance", cents(base * .08)), row("levy.healthInsurance", cents(base * .02) + 3), row("levy.unemploymentInsurance", cents(base * .005))], socialScope("cn"));
  },
});
social.push({
  slug: "social-security", country: "mx", scopeKey: socialScope("mx"),
  review: { revision: 7, period: "2026 ordinary IMSS employee", reviewed: "2026-10-20", scope: "Ordinary mandatory-regime employee IMSS quota only, entered actual registered integrated daily SBC at leastMXN500 (above both2026 minimum wages), entered calendar contribution days1–31. January UMA113.14; February–December UMA117.31; SBC capped25UMA. Employee cash sickness0.25%, pensioner medical0.375%, invalidity/life0.625%, retirement/old-age1.125%; extra sickness in-kind0.4% only on SBC exceeding3UMA. Component amounts rounded tocent per entered period; actual monthly/bimonthly agency collection can differ bycent grouping. No employer contributions, low/minimum-wage employer-paid employee shares, ISSSTE, partial-absence/sickness rules, INFONAVIT loans or wage/ISR calculation.", sources: ["https://www.gob.mx/conasami/prensa/consejo-de-representantes-de-la-conasami-acuerda-incremento-de-13-al-salario-minimo-general-en-2026?idiom=es", "https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/uma/uma2026.pdf", "https://www.inegi.org.mx/temas/uma/", "https://www.imss.gob.mx/sites/all/statics/pdf/leyes/LSS.pdf"] },
  fields: () => [money("salary", "asia.field.dailySbc", 1000, 500, 100000), { id: "umaPeriod", labelKey: "asia.field.umaPeriod", kind: "select", default: "feb", options: [{ value: "jan", labelKey: "asia.option.january2025" }, { value: "feb", labelKey: "asia.option.febDecember2025" }] }, { id: "days", labelKey: "asia.field.contributionDays", kind: "number", min: 1, max: 31, step: 1, integer: true, default: 30 }],
  compute: v => {
    const uma = str(v, "umaPeriod", "feb") === "jan" ? 113.14 : 117.31;
    const base = Math.min(num(v, "salary"), 25 * uma), days = num(v, "days", 30);
    return contributionResult("asia.result.periodContribution", [row("asia.levy.cashSickness", cents(base * days * .0025)), row("asia.levy.pensionerMedical", cents(base * days * .00375)), row("asia.levy.invalidityLife", cents(base * days * .00625)), row("asia.levy.oldAge", cents(base * days * .01125)), row("asia.levy.excessHealth", cents(Math.max(0, base - 3 * uma) * days * .004))], socialScope("mx"));
  },
});

export const asiaReviewed: ReviewedCountryCalculator[] = [...wages, ...social];
