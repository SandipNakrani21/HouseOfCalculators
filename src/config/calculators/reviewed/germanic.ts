import { num, str, type CalculatorField, type CalculatorResult, type FieldValues, type ResultRow } from "../types";
import type { RuleReview } from "../provenance";
import type { ReviewedCountryCalculator } from "./types";

const cents = (n: number) => Math.round((n + Number.EPSILON * Math.max(1, Math.abs(n))) * 100) / 100;
const downCents = (n: number) => Math.floor((n + 1e-8) * 100) / 100;
const money = (id: string, labelKey: string, value = 0, min = 0, max = 2_000_000): CalculatorField => ({ id, labelKey, kind: "currency", default: value, min, max, step: 0.01, slider: false });
const row = (labelKey: string, value: number, emphasis = false): ResultRow => ({ labelKey, value: cents(value), kind: "currency", decimals: 2, emphasis });
const scope = (key: string) => `review.scope.${key}`;
const review = (period: string, detail: string, sources: string[], reviewed = "2026-10-19"): RuleReview => ({ revision: 5, period, reviewed, scope: detail, sources });
const deSources = [
  "https://www.gesetze-im-internet.de/estg/__32a.html",
  "https://www.gesetze-im-internet.de/estg/__10.html",
  "https://www.gesetze-im-internet.de/estg/__10c.html",
  "https://www.tk.de/resource/blob/2098446/7445181694077ffa3c734446798a01f1/beitraeger-der-tk-fk-version-2026-data.pdf",
  "https://www.bundesgesundheitsministerium.de/themen/pflege/online-ratgeber-pflege/die-pflegeversicherung/finanzierung",
  "https://finanzamt.brandenburg.de/fa/de/themen/familien-und-steuern/",
  "https://www.gesetze-im-internet.de/solzg_1995/__4.html"
];
const atSources = [
  "https://www.bmf.gv.at/themen/steuern/arbeitnehmerveranlagung/steuertarif-steuerabsetzbetraege/steuertarif-steuerabsetzbetraege.html",
  "https://www.bmf.gv.at/themen/steuern/arbeitnehmerveranlagung/steuertarif-steuerabsetzbetraege/uebersicht-steuerabsetzbetraege.html-1",
  "https://www.gesundheitskasse.at/cdscontent/load?contentid=10008.802672&version=1775628844",
  "https://www.bmf.gv.at/themen/steuern/arbeitnehmerveranlagung/was-kann-ich-geltend-machen/werbungskosten/werbungskosten-ueberblick.html"
];
const chSources = [
  "https://www.estv.admin.ch/dam/de/sd-web/vFK3ntWLQ4s4/2-215-D-2025-d.pdf",
  "https://www.estv.admin.ch/dam/de/sd-web/gnde9CmEsalK/dbst-tairfe-58c-2026-dfi.pdf",
  "https://www.ahv-iv.ch/p/2.01.e",
  "https://www.ahv-iv.ch/p/2.08.d"
];

/** 2026 basic tariff: input and resulting income tax are rounded down to euros. */
export function germanIncomeTax2026(taxable: number): number {
  const x = Math.floor(Math.max(0, taxable));
  if (x <= 12348) return 0;
  if (x <= 17799) { const y = (x - 12348) / 10000; return Math.floor((914.51 * y + 1400) * y); }
  if (x <= 69878) { const z = (x - 17799) / 10000; return Math.floor((173.10 * z + 2397) * z + 1034.87); }
  return Math.floor(x <= 277825 ? x * .42 - 11135.63 : x * .45 - 19470.38);
}
export function germanSolidarity2026(tax: number): number {
  return downCents(Math.max(0, Math.min(tax * .055, (tax - 20350) * .119)));
}
/** Ordinary full-year employee, childless age 23+, outside Saxony; 12 equal payments. */
export function germanEmployee2026(annual: number, supplement: number) {
  const month = annual / 12, rv = Math.min(month, 8450), kv = Math.min(month, 5812.50);
  const pension = cents(rv * .093) * 12;
  const unemployment = cents(rv * .013) * 12;
  // General and supplementary health shares have distinct contribution rates.
  const health = (cents(kv * .073) + cents(kv * supplement / 200)) * 12;
  const care = cents(kv * .024) * 12;
  const social = cents(pension + unemployment + health + care);
  // §10(1)3: 4% reduction of health contributions with sickness-benefit entitlement.
  const taxable = Math.max(0, annual - 1230 - 36 - pension - health * .96 - care);
  const tax = germanIncomeTax2026(taxable), solidarity = germanSolidarity2026(tax);
  return { pension, unemployment, health, care, social, taxable: Math.floor(taxable), tax, solidarity, net: cents(annual - social - tax - solidarity) };
}

const deReview = review("2026 ordinary full-year employment", "Single resident, childless age 23+ throughout 2026, outside Saxony, ordinary general pension/unemployment and GKV with sickness-benefit entitlement, 12 equal payments each above EUR2000. Enter actual full-year health-fund supplementary percentage, unchanged throughout year. Monthly component cent rounding; RV/AV bases EUR8450, KV/PV EUR5812.50; employee 9.3/1.3/7.3 plus half supplementary/2.4 percent. Taxable wages deduct employee RV, 96% health and full care, EUR1230 employment costs and EUR36 special-expense lump sum; basic tariff §32a floor euros and solidarity exemption EUR20350 with 11.9% phase-in capped at 5.5% tax, floor cents. No church tax, joint/children, other income/deductions, bonuses, mini/midijobs, private insurance, refunds, payslip wage-tax classification or benefit determination. Health/care exceeds other-insurance EUR1900 deduction cap within input scope, so unemployment gives no additional deduction.", deSources, "2026-10-20");
const atReview = review("2026 regular pay, 12 equal payments", "Outside Vienna only (housing contribution0.5%; Vienna0.75% excluded). Ordinary resident employee below age 60, one ASVG job, 12 equal regular payments only, annual gross at least EUR40000 (no low-income contribution reductions or refundable credits in this scope). Employee pension 10.25%, health 3.87%, unemployment 2.95%, AK 0.5%, housing 0.5%, each monthly base capped EUR6930 and components rounded cents. Taxable wages subtract contributions and EUR132 employment cost lump sum; 2026 brackets 13539/21992/36458/70365/104859/1000000, 0/20/30/40/48/50/55%; EUR496 transport credit. No 13th/14th salary, special payments, other income, commuting/family/other credits or deductions, negative tax/refunds, multiple jobs, e-card service charge or payslip withholding. Monthly result annual average only.", atSources, "2026-10-20");

export function austrianEmployee2026(annual: number) {
  const base = Math.min(annual / 12, 6930);
  const social = cents([.1025, .0387, .0295, .005, .005].reduce((sum, r) => sum + cents(base * r) * 12, 0));
  const taxable = Math.max(0, annual - social - 132);
  const bounds = [13539, 21992, 36458, 70365, 104859, 1000000, Infinity];
  const rates = [0, .2, .3, .4, .48, .5, .55];
  let tax = 0, lower = 0;
  for (let i = 0; i < bounds.length; i++) { tax += Math.max(0, Math.min(taxable, bounds[i]) - lower) * rates[i]; lower = bounds[i]; }
  tax = cents(Math.max(0, tax - 496));
  return { social, taxable, tax, net: cents(annual - social - tax) };
}

const payPeriod: CalculatorField = { id: "period", labelKey: "field.payPeriod", kind: "select", default: "year", options: [{ value: "year", labelKey: "option.perYear" }, { value: "month", labelKey: "option.perMonth" }] };
const supplementField: CalculatorField = { id: "supplement", labelKey: "field.deFundSupplement", kind: "percent", default: 2.5, min: 0, max: 10, step: .01, slider: false };
function wageFields(country: "de" | "at", salary: boolean): CalculatorField[] {
  const minimum = country === "de" ? 24000.12 : 40000;
  const gross = money(salary ? "salary" : "income", salary ? "field.grossSalary" : "field.annualIncome", 60000, minimum);
  if (salary) gross.resolve = v => str(v, "period", "year") === "month" ? { min: Math.ceil(minimum / 12 * 100) / 100, max: Math.floor(2_000_000 / 12 * 100) / 100 } : {};
  return [gross, ...(salary ? [payPeriod] : []), ...(country === "de" ? [supplementField] : [])];
}
function wageResult(v: FieldValues, country: "de" | "at", salary: boolean): CalculatorResult {
  const gross = num(v, salary ? "salary" : "income") * (salary && str(v, "period", "year") === "month" ? 12 : 1);
  const p = country === "de" ? germanEmployee2026(gross, num(v, "supplement", 2.5)) : austrianEmployee2026(gross);
  const soli = "solidarity" in p && typeof p.solidarity === "number" ? p.solidarity : 0;
  return {
    primary: row("result.annualAfterModelledDeductions", p.net, true),
    rows: [row("result.grossAnnual", gross), row("result.taxableIncome", p.taxable), row("result.incomeTax", p.tax), ...(soli ? [row("result.solidaritySurcharge", soli)] : []), row("result.socialContributions", p.social), row("result.monthlyAfterModelledDeductions", p.net / 12, true)],
    chart: [{ labelKey: "result.annualAfterModelledDeductions", value: p.net, tone: "principal" }, { labelKey: "result.incomeTax", value: p.tax + soli, tone: "tax" }, { labelKey: "result.socialContributions", value: p.social, tone: "neutral" }],
    notes: [{ key: scope(country === "de" ? "deEmployment2025" : "atEmployment2025") }],
  };
}

/** Official 2026 single-person federal tariff; tax base rounded down to CHF100. */
export function swissFederal2026(taxable: number): number {
  const x = Math.floor(Math.max(0, taxable) / 100) * 100;
  if (x >= 794000) return Math.floor((x * .115 + 1e-8) * 20) / 20;
  const thresholds = [15200,33200,43500,58000,76200,82100,108900,141500,185100,793900];
  const bases = [0,138.60,229.20,612,1152.50,1502.95,3271.75,6140.55,10936.55,91298.15];
  const rates = [.0077,.0088,.0264,.0297,.0594,.066,.088,.11,.132,0];
  let tax = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) if (x >= thresholds[i]) { tax = bases[i] + (x - thresholds[i]) * rates[i]; break; }
  tax = Math.floor((tax + 1e-8) * 20) / 20;
  return tax < 25 ? 0 : tax;
}
const chReview = review("2026 single-person federal assessment", "Single full-year resident, ordinary assessment, federal direct income tax only. Enter the independently determined final taxable federal income after all allowed deductions (not gross wages); rounded down to CHF100. Official 2026 single-person table uses statutory base amounts/rates, 11.5% whole-income ceiling from CHF794000, annual tax rounded down to CHF0.05, tax below CHF25 uncollected. Salary additionally uses actual gross pay, final taxable federal income and entered actual other employee deductions: computes employee AHV/IV/EO5.3% plus ALV1.1% capped CHF148200; average annual estimate before cantonal/municipal/church taxes and health-insurance premiums. Final taxable base must be established separately from the return; this tool does not determine deduction eligibility or claim to calculate national total take-home. No married/parent tariff, source withholding, partial years, multiple employment, reference-age exemptions, wealth tax or benefits.", chSources, "2026-10-20");
const chTaxable = () => money("federalTaxable", "field.chFederalTaxable", 60000);
const federalAndOtherExceedGross = (gross: number, taxable: number, social: number, other: number) => swissFederal2026(taxable) + social + other > gross;
const chIncome: ReviewedCountryCalculator = {
  slug: "income-tax", country: "ch", scopeKey: scope("chFederal2025"), review: chReview,
  fields: () => [chTaxable()],
  compute: v => { const base = num(v, "federalTaxable"), tax = swissFederal2026(base); return { primary: row("result.chFederalTax", tax, true), rows: [row("result.taxableIncome", Math.floor(base / 100) * 100)], notes: [{ key: scope("chFederal2025") }] }; },
};
const chSalary: ReviewedCountryCalculator = {
  slug: "salary", country: "ch", scopeKey: scope("chFederal2025"), review: chReview,
  fields: () => [money("salary", "field.annualGrossSalary", 80000, 2500.01), chTaxable(), money("otherEmployee", "field.chOtherEmployee", 5000)],
  validate: v => {
    const gross = num(v, "salary"), other = num(v, "otherEmployee"), taxable = num(v, "federalTaxable");
    const social = cents(gross * .053) + cents(Math.min(gross, 148200) * .011);
    return taxable > gross - social - other || federalAndOtherExceedGross(gross, taxable, social, other) ? "error.reviewedBaseExceedsPay" : null;
  },
  compute: v => {
    const gross = num(v, "salary"), federal = swissFederal2026(num(v, "federalTaxable"));
    const social = cents(gross * .053) + cents(Math.min(gross, 148200) * .011), other = num(v, "otherEmployee"), net = gross - federal - social - other;
    return { primary: row("result.annualAfterModelledDeductions", net, true), rows: [row("result.grossAnnual", gross), row("result.chFederalTax", federal), row("result.socialContributions", social), row("field.chOtherEmployee", other), row("result.monthlyAfterModelledDeductions", net / 12)], notes: [{ key: scope("chFederal2025") }] };
  },
};

const deChurchReview = review("2026 ordinary assessed church-income-tax surcharge", "Ordinary full-year church member, assessed church income-tax surcharge only. Input is the final §51a church-tax assessment base (adjusted income tax, not income). Rate8% Bavaria/Baden-Württemberg or9% elsewhere. No capital-income tax special formula, special church payment, joint/mixed-faith allocation, minimum tax, optional church-specific income cap, special relief or net deduction/refund benefit; supply already resolved assessment base. This calculates the uncapped ordinary surcharge, not a complete church assessment.", ["https://www.ekd.de/statistik-kirchensteuer-44297.htm", "https://www.gesetze-im-internet.de/estg/__51a.html", "https://www.dbk.de/themen/kirche-und-geld/kirchensteuer/", "https://www.bpb.de/kurz-knapp/lexika/recht-a-z/323629/kirchensteuer/"], "2026-10-20");
const atChurchReview = review("2026 Vienna Roman Catholic ordinary employee", "Erzdiözese Wien ordinary single employee/pensioner income contribution, full year, no family or discretionary relief: prior-year2025 assessed taxable income as contribution base,1.1% minus EUR61, minimumEUR35. Separate taxable-favoured special-pay base §§37/38/67 at0.5% supplied explicitly. No non-taxable additions, self-employment/agricultural/property/consumption bases, family support allocations, other dioceses, procedural fees or income-tax deduction benefit; eligibility and bases supplied independently.", ["https://www.erzdioezese-wien.at/pages/inst/14428333/wissenswertes/rechtgeschichte/kboanhang/article/32314.html"], "2026-10-20");
const chChurchReview = review("2026 City of Zurich Reformed church", "Reformed full-year member resident City of Zurich.10% of independently assessed simple cantonal income tax (not taxable income, not total cantonal/municipal tax). Ordinary income-tax church surcharge only; excludes wealth-related church tax, mixed-faith allocation, limited liability and other denominations/municipalities. This is an assessed-base surcharge, not total Swiss church liability.", ["https://www.parlament.reformiert-zuerich.ch/content/10_Akt/1050_Akt_Proto/2025-12-18_Protokoll_Kirchgemeindeparlament-22.pdf", "https://www.zh.ch/de/steuern-finanzen/steuern/treuhaender/steuerbuch/steuerbuch-definition/zstb-201-1.html"], "2026-10-20");

const churchEntries: ReviewedCountryCalculator[] = [
  { slug: "church-tax", country: "de", scopeKey: scope("deChurch2025"), review: deChurchReview,
    fields: () => [money("churchBase", "field.deChurchBase", 10000), { id: "churchRegion", labelKey: "field.churchTaxRate", kind: "select", default: "9", options: [{ value: "8", labelKey: "option.deChurch8" }, { value: "9", labelKey: "option.deChurch9" }] }],
    compute: v => { const tax = cents(num(v, "churchBase") * (str(v, "churchRegion", "9") === "8" ? .08 : .09)); return { primary: row("result.churchTax", tax, true), rows: [row("result.churchTaxMonthly", tax / 12)], notes: [{ key: scope("deChurch2025") }] }; } },
  { slug: "church-tax", country: "at", scopeKey: scope("atChurch2026"), review: atChurchReview,
    fields: () => [money("churchBase", "field.atChurchBase", 40000), money("specialBase", "field.atChurchSpecial")],
    compute: v => { const tax = cents(Math.max(35, num(v, "churchBase") * .011 - 61 + num(v, "specialBase") * .005)); return { primary: row("result.churchTax", tax, true), rows: [row("result.churchTaxMonthly", tax / 12)], notes: [{ key: scope("atChurch2026") }] }; } },
  { slug: "church-tax", country: "ch", scopeKey: scope("chChurch2025"), review: chChurchReview,
    fields: () => [money("churchBase", "field.chChurchBase", 5000)],
    compute: v => { const tax = cents(num(v, "churchBase") * .1); return { primary: row("result.churchTax", tax, true), rows: [row("result.churchTaxMonthly", tax / 12)], notes: [{ key: scope("chChurch2025") }] }; } },
];

const payrollReview = review("2026 ordinary German employer annual cost", "Ordinary employee age23–59 outside Saxony, 12 equal full-month payments aboveEUR2000, GKV with entered unchanged supplemental rate. Employer9.3% pension+1.3% unemployment cappedEUR101400, health7.3%+half actual fund supplement and care1.8% cappedEUR69750. Enter actual applicable U1/U2 percentages from fund/employer notice; bases capped at RV ceiling; U1 may legitimately be0 for exempt large employer. Insolvency levy0.15% RV base for liable private employer. Enter actual annual occupational-accident and other employer costs separately. Components rounded monthly cents, annualized. No mini/midijobs, special payments, public/employer levy exemptions, Saxony, special occupations, benefits or determination of U1/U2/accident eligibility. Salary income-tax/employee deductions not part of employer extra cost.", [...deSources, "https://www.kbs.de/SharedDocs/SV_AZ/i/Insolvenzgeldumlage", "https://www.tk.de/firmenkunden/versicherung/beitraege-faq-und-mehr/umlagen-u1-u2-und-insolvenzgeld-2042506"], "2026-10-20");
const payroll: ReviewedCountryCalculator = {
  slug: "payroll", country: "de", scopeKey: scope("dePayroll2025"), review: payrollReview,
  fields: () => [money("salary", "field.annualGrossSalary", 60000, 24000.12), supplementField, { id: "u1", labelKey: "field.deU1", kind: "percent", default: 0, min: 0, max: 10, step: .01, slider: false }, { id: "u2", labelKey: "field.deU2", kind: "percent", default: .44, min: 0, max: 10, step: .01, slider: false }, money("otherEmployer", "field.deOtherEmployer", 600)],
  compute: v => {
    const gross = num(v, "salary"), rv = Math.min(gross / 12, 8450), kv = Math.min(gross / 12, 5812.5);
    const insurance = 12 * (cents(rv * .093) + cents(rv * .013) + cents(kv * .073) + cents(kv * num(v, "supplement", 2.5) / 200) + cents(kv * .018));
    const levies = 12 * (cents(rv * num(v, "u1") / 100) + cents(rv * num(v, "u2", .44) / 100) + cents(rv * .0015));
    const other = num(v, "otherEmployer"), total = cents(gross + insurance + levies + other);
    return { primary: row("result.totalCost", total, true), rows: [row("result.grossAnnual", gross), row("result.socialContributions", insurance), row("result.deEmployerLevies", levies), row("field.deOtherEmployer", other), row("result.deMonthlyCost", total / 12)], notes: [{ key: scope("dePayroll2025") }] };
  },
};

export const germanicReviewed: ReviewedCountryCalculator[] = [
  ...(["de", "at"] as const).flatMap(country => ["income-tax", "salary"].map(slug => ({
    slug, country, scopeKey: scope(country === "de" ? "deEmployment2025" : "atEmployment2025"), review: country === "de" ? deReview : atReview,
    fields: () => wageFields(country, slug === "salary"), compute: (v: FieldValues) => wageResult(v, country, slug === "salary"),
  }))),
  ...(["de", "at"] as const).map(country => ({
    slug: "social-security", country, scopeKey: scope(country === "de" ? "deEmployment2025" : "atEmployment2025"), review: country === "de" ? deReview : atReview,
    fields: () => wageFields(country, false).map(f => f.id === "income" ? { ...f, id: "salary", labelKey: "field.annualGrossSalary" } : f),
    compute: (v: FieldValues): CalculatorResult => { const gross = num(v, "salary"), p = country === "de" ? germanEmployee2026(gross, num(v, "supplement", 2.5)) : austrianEmployee2026(gross); return { primary: row("result.annualContribution", p.social, true), rows: [row("result.monthlyContribution", p.social / 12)], notes: [{ key: scope(country === "de" ? "deEmployment2025" : "atEmployment2025") }] }; },
  })),
  chIncome, chSalary, ...churchEntries, payroll,
];
