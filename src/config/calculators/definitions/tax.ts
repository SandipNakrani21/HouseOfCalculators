import { applyReviewedCountry } from "../reviewed";
import { MONEY_SCALE } from "@/config/calculators/scale";
import {
  bool,
  num,
  str,
  type CalculatorDef,
  type ResultRow,
} from "@/config/calculators/types";
import type { CountryCode } from "@/config/countries";
import { applySlabs, INCOME_TAX_RULES, type Slab } from "@/lib/finance/tax";
import { polishEmploymentMarginalRate } from "@/lib/finance/tax/poland";

const ALL: CountryCode[] = [
  "in", "us", "gb", "ae", "ca", "au", "de", "at", "ch", "fr",
  "be", "nl", "jp", "es", "mx", "it", "pt", "br", "pl", "tr",
  "ru", "cn",
];

/* ------------------------------------------------------------ Income tax */

export const incomeTaxCalculator: CalculatorDef = {
  slug: "income-tax",
  icon: "🧾",
  version: 14,
  category: "finance",
  isCountrySpecific: true,
  titleKey: "calc.income-tax.title",
  descKey: "calc.income-tax.desc",
  countries: ALL,
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    const rules = INCOME_TAX_RULES[countryCode];

    return [
      {
        id: "income",
        labelKey: "field.annualIncome",
        kind: "currency",
        min: countryCode === "pl" ? 57_672 : scale.incomeMin,
        max: countryCode === "pl" ? 1_000_000 : scale.incomeMax,
        step: countryCode === "pl" ? 1 : scale.incomeStep,
        default: scale.defaults.income,
      },
      ...(rules.regimes.length > 1
        ? [
            {
              id: "regime",
              labelKey: "field.regime",
              kind: "select" as const,
              default: rules.defaultRegime,
              options: rules.regimes.map((regime) => ({
                value: regime.value,
                labelKey: regime.labelKey,
              })),
            },
          ]
        : []),
      {
        id: "deductions",
        labelKey: "field.deductions",
        hintKey: `calc.income-tax.hint.${countryCode}`,
        kind: "currency",
        min: 0,
        max: Math.round(scale.incomeMax / 4),
        step: scale.incomeStep,
        default: 0,
        visibleWhen: (values) =>
          rules.allowsDeductions(str(values, "regime", rules.defaultRegime)),
      },
    ];
  },
  compute: (values, { countryCode, fmt }) => {
    const rules = INCOME_TAX_RULES[countryCode];
    const result = rules.compute({
      grossIncome: num(values, "income"),
      regime: str(values, "regime", rules.defaultRegime),
      deductions: num(values, "deductions"),
    });
    // A band rate omits allowance/credit withdrawal and contribution changes.
    // Measure the next annual currency unit with every other input unchanged.
    const nextUnit = rules.compute({
      grossIncome: num(values, "income") + 1,
      regime: str(values, "regime", rules.defaultRegime),
      deductions: num(values, "deductions"),
    });

    const rows: ResultRow[] = [
      {
        labelKey: "result.grossIncome",
        value: result.grossIncome,
        kind: "currency",
        tone: "neutral",
      },
      {
        labelKey: "result.taxableIncome",
        value: result.taxableIncome,
        kind: "currency",
        tone: "neutral",
      },
      {
        labelKey: "result.taxOnIncome",
        value: result.baseTax,
        kind: "currency",
        tone: "tax",
      },
    ];

    if (result.credit > 0) {
      rows.push({
        labelKey: "result.credit",
        value: -result.credit,
        kind: "currency",
        tone: "returns",
      });
    }
    for (const levy of [...result.surtaxes, ...result.social]) {
      rows.push({
        labelKey: levy.labelKey,
        value: levy.amount,
        kind: "currency",
        tone: "tax",
      });
    }

    rows.push(
      {
        labelKey: "result.totalTax",
        value: result.totalTax,
        kind: "currency",
        tone: "tax",
        emphasis: true,
      },
      {
        labelKey: "result.effectiveRate",
        value: result.effectiveRate,
        kind: "percent",
        tone: "neutral",
      },
      {
        labelKey: "result.marginalRate",
        // Whole-ruble NDFL collection steps are not the statutory band rate.
        value: countryCode === "ru" ? result.marginalRate : countryCode === "pl"
          ? polishEmploymentMarginalRate(num(values, "income"))
          : (nextUnit.totalTax - result.totalTax) * 100,
        kind: "percent",
        tone: "neutral",
      },
    );

    return {
      primary: {
        labelKey: "result.annualAfterModelledDeductions",
        value: result.netIncome,
        kind: "currency",
        emphasis: true,
      },
      rows,
      chart: [
        { labelKey: "result.annualAfterModelledDeductions", value: result.netIncome, tone: "principal" },
        { labelKey: "result.totalTax", value: result.totalTax, tone: "tax" },
      ],
      table: result.portions.some((portion) => portion.taxableInSlab > 0)
        ? {
            columns: [
              { key: "band", labelKey: "table.band", kind: "text" },
              { key: "rate", labelKey: "table.rate", kind: "percent" },
              { key: "taxableInSlab", labelKey: "table.incomeInBand", kind: "currency" },
              { key: "tax", labelKey: "table.tax", kind: "currency" },
            ],
            rows: result.portions
              .filter((portion) => portion.taxableInSlab > 0)
              .map((portion) => ({
                band:
                  portion.to === null
                    ? `${fmt.currencyShort(portion.from)}+`
                    : `${fmt.currencyShort(portion.from)} – ${fmt.currencyShort(portion.to)}`,
                rate: portion.rate,
                taxableInSlab: portion.taxableInSlab,
                tax: portion.tax,
              })),
          }
        : undefined,
      notes: [{ key: result.noteKey }, { key: "calc.salary.scope" }],
    };
  },
  explainerKeys: ["calc.income-tax.explain.1", "calc.income-tax.explain.2"],
  faqKeys: ["calc.income-tax.faq.1", "calc.income-tax.faq.2"],
};

/* ------------------------------------------------------- Consumption tax */

export const consumptionTaxCalculator: CalculatorDef = {
  slug: "vat",
  icon: "🧮",
  version: 2,
  category: "finance",
  countryRelevance: "currency",
  titleKey: "calc.vat.title",
  descKey: "calc.vat.desc",
  params: ({ t }) => ({ tax: t("field.taxRate") }),
  countries: ALL,
  fields: ({ countryCode }) => [
    {
      id: "amount",
      labelKey: "field.amount",
      kind: "currency",
      min: 0,
      max: MONEY_SCALE[countryCode].lumpMax,
      step: MONEY_SCALE[countryCode].lumpStep,
      slider: false,
      default: MONEY_SCALE[countryCode].defaults.lump,
    },
    {
      id: "direction",
      labelKey: "field.amountType",
      kind: "select",
      default: "exclusive",
      options: [
        { value: "exclusive", labelKey: "option.taxExclusive" },
        { value: "inclusive", labelKey: "option.taxInclusive" },
      ],
    },
    {
      id: "rate",
      labelKey: "field.taxRate",
      hintKey: "calc.vat.rateHint",
      kind: "percent",
      min: 0,
      max: 100,
      step: 0.01,
      slider: false,
      // An illustrative starting value, never a claimed national/default rate.
      default: 0,
    },
  ],
  compute: (values, { country, t }) => {
    const amount = num(values, "amount");
    const rate = num(values, "rate");
    const inclusive = str(values, "direction", "exclusive") === "inclusive";

    // Inclusive means the figure entered already contains the tax.
    const net = inclusive ? amount / (1 + rate / 100) : amount;
    const tax = inclusive ? amount - net : (amount * rate) / 100;

    return {
      primary: {
        labelKey: "result.totalAmount",
        value: net + tax,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.amountBeforeTax", value: net, kind: "currency", tone: "principal" },
        { labelKey: "result.taxAmount", value: tax, kind: "currency", tone: "tax" },
      ],
      chart: [
        { labelKey: "result.amountBeforeTax", value: net, tone: "principal" },
        { labelKey: "result.taxAmount", value: tax, tone: "tax" },
      ],
      notes: [
        {
          key: "calc.vat.scope",
          params: { tax: t(country.consumptionTax.labelKey) },
        },
      ],
    };
  },
  explainerKeys: ["calc.vat.explain"],
  faqKeys: ["calc.vat.faq.1"],
};

/* -------------------------------------------------------- Capital gains */

/**
 * Long-term capital gains treatment, per country. Systems vary far more than
 * income tax does: some apply a flat rate, some discount the gain and tax it
 * at the marginal rate, some run a separate savings scale.
 */
type GainsRule = {
  /** Tax-free amount before anything is charged. */
  allowance: number;
  /** Flat rate, or a scale applied to the gain. */
  longTerm: Slab[];
  /** Fraction of the gain that is taxable at all (Canada, Australia). */
  inclusion?: number;
  /** Months of ownership that qualify for the long-term treatment. */
  longTermMonths: number;
};

const GAINS_RULES: Partial<Record<CountryCode, GainsRule>> = {
  us: {
    allowance: 0,
    longTerm: [
      { from: 0, rate: 0 },
      { from: 48_350, rate: 15 },
      { from: 533_400, rate: 20 },
    ],
    longTermMonths: 12,
  },
  gb: {
    allowance: 3_000,
    longTerm: [{ from: 0, rate: 18 }, { from: 37_700, rate: 24 }],
    longTermMonths: 0,
  },
  ca: {
    allowance: 0,
    inclusion: 0.5,
    longTerm: [{ from: 0, rate: 29 }],
    longTermMonths: 0,
  },
  au: {
    allowance: 0,
    inclusion: 0.5,
    longTerm: [{ from: 0, rate: 32.5 }],
    longTermMonths: 12,
  },
  de: {
    allowance: 1_000,
    longTerm: [{ from: 0, rate: 26.375 }],
    longTermMonths: 0,
  },
  fr: {
    allowance: 0,
    // Ordinary 2025 securities gains assessed in 2026: 12.8% IR +18.6% social.
    longTerm: [{ from: 0, rate: 31.4 }],
    longTermMonths: 0,
  },
  es: {
    allowance: 0,
    longTerm: [
      { from: 0, rate: 19 },
      { from: 6_000, rate: 21 },
      { from: 50_000, rate: 23 },
      { from: 200_000, rate: 27 },
      { from: 300_000, rate: 30 },
    ],
    longTermMonths: 0,
  },
  it: {
    allowance: 0,
    longTerm: [{ from: 0, rate: 26 }],
    longTermMonths: 0,
  },
  in: {
    allowance: 125_000,
    longTerm: [{ from: 0, rate: 12.5 }],
    longTermMonths: 12,
  },
};

export const capitalGainsCalculator: CalculatorDef = {
  slug: "capital-gains",
  icon: "📊",
  version: 4,
  category: "finance",
  isCountrySpecific: true,
  titleKey: "calc.capital-gains.title",
  descKey: "calc.capital-gains.desc",
  countries: Object.keys(GAINS_RULES) as CountryCode[],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "purchase",
        labelKey: "field.purchasePrice",
        kind: "currency",
        min: 0,
        max: scale.lumpMax,
        step: scale.lumpStep,
        default: scale.defaults.lump,
      },
      {
        id: "sale",
        labelKey: "field.salePrice",
        kind: "currency",
        min: 0,
        max: scale.lumpMax,
        step: scale.lumpStep,
        default: Math.round(scale.defaults.lump * 1.6),
      },
      {
        id: "holding",
        labelKey: "field.holdingPeriod",
        kind: "select",
        default: "long",
        visibleWhen: () => !["gb", "de", "it", "es", "fr"].includes(countryCode),
        options: [
          { value: "long", labelKey: "option.longTerm" },
          { value: "short", labelKey: "option.shortTerm" },
        ],
      },
      {
        id: "income",
        labelKey: countryCode === "gb" ? "field.taxableOtherIncome"
          : countryCode === "es" ? "field.otherTaxableSavingsIncome"
            : countryCode === "fr" ? "field.frReferenceIncome" : "field.otherIncome",
        ...(countryCode === "gb" ? { hintKey: "calc.capital-gains.ukIncomeHint" } : {}),
        ...(countryCode === "fr" ? { hintKey: "calc.capital-gains.frReferenceHint" } : {}),
        visibleWhen: () => !["de", "it"].includes(countryCode),
        kind: "currency",
        min: 0,
        max: countryCode === "fr" ? 250_000 : scale.incomeMax,
        step: scale.incomeStep,
        default: countryCode === "es" ? 0 : scale.defaults.income,
      },
      ...(countryCode === "de" ? [{
        id: "remainingAllowance",
        labelKey: "field.remainingSavingsAllowance",
        kind: "currency" as const,
        min: 0, max: 1_000, step: 1, default: 0, slider: false,
      }] : []),
    ];
  },
  validate: (values, { countryCode }) => countryCode === "fr"
    && num(values, "income") < Math.max(num(values, "sale") - num(values, "purchase"), 0)
    ? "calc.capital-gains.frReferenceError" : null,
  compute: (values, { countryCode }) => {
    const rule = GAINS_RULES[countryCode];
    const gain = Math.max(num(values, "sale") - num(values, "purchase"), 0);
    const income = num(values, "income");
    const longTerm = str(values, "holding", "long") === "long";

    if (!rule) {
      return {
        primary: { labelKey: "result.netGain", value: gain, kind: "currency", emphasis: true },
        rows: [],
      };
    }

    const included = gain * (rule.inclusion ?? 1);
    const allowance = countryCode === "de"
      ? Math.min(Math.max(num(values, "remainingAllowance"), 0), 1_000)
      : rule.allowance;
    const taxable = Math.max(included - allowance, 0);

    let tax: number;
    if (longTerm || ["gb", "de", "it", "es", "fr"].includes(countryCode)) {
      // Rates that depend on total income are found by locating the gain on
      // the scale above the income already earned.
      const withIncome = applySlabs(income + taxable, rule.longTerm).tax;
      const withoutGain = applySlabs(income, rule.longTerm).tax;
      tax =
        rule.longTerm.length > 1 ? withIncome - withoutGain : (taxable * rule.longTerm[0].rate) / 100;
    } else {
      // Retained unreviewed models use this branch; statutory publication is
      // controlled independently. It is not valid for the reviewed securities
      // regimes above, regardless of a stale saved holding-period selection.
      const rules = INCOME_TAX_RULES[countryCode];
      const withGain = rules.compute({ grossIncome: income + gain }).incomeTax;
      const withoutGain = rules.compute({ grossIncome: income }).incomeTax;
      tax = Math.max(withGain - withoutGain, 0);
    }

    return {
      primary: {
        labelKey: "result.netGain",
        value: gain - tax,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.grossGain", value: gain, kind: "currency", tone: "principal" },
        ...(rule.inclusion
          ? [
              {
                labelKey: "result.includedGain",
                value: included,
                kind: "currency" as const,
                tone: "neutral" as const,
              },
            ]
          : []),
        ...(allowance
          ? [
              {
                labelKey: "result.exemptAmount",
                value: -Math.min(included, allowance),
                kind: "currency" as const,
                tone: "returns" as const,
              },
            ]
          : []),
        { labelKey: "result.taxableGain", value: taxable, kind: "currency", tone: "neutral" },
        ...(countryCode === "fr" ? [
          { labelKey: "result.incomeTax", value: taxable * 0.128, kind: "currency" as const, tone: "tax" as const },
          { labelKey: "result.socialContributions", value: taxable * 0.186, kind: "currency" as const, tone: "tax" as const },
        ] : []),
        { labelKey: "result.taxAmount", value: tax, kind: "currency", tone: "tax", emphasis: true },
        {
          labelKey: "result.effectiveRate",
          value: gain > 0 ? (tax / gain) * 100 : 0,
          kind: "percent",
          tone: "neutral",
        },
      ],
      chart: [
        { labelKey: "result.netGain", value: gain - tax, tone: "principal" },
        { labelKey: "result.taxAmount", value: tax, tone: "tax" },
      ],
      notes: [{ key: countryCode === "gb" ? "review.scope.ukGains" : `calc.capital-gains.note.${countryCode}` }],
    };
  },
  explainerKeys: ["calc.capital-gains.explain"],
};

/* ------------------------------------------------------------ Stamp duty */

// SDLT, England and Northern Ireland, from April 2025.
const SDLT_STANDARD: Slab[] = [
  { from: 0, rate: 0 },
  { from: 125_000, rate: 2 },
  { from: 250_000, rate: 5 },
  { from: 925_000, rate: 10 },
  { from: 1_500_000, rate: 12 },
];

const SDLT_FIRST_TIME: Slab[] = [
  { from: 0, rate: 0 },
  { from: 300_000, rate: 5 },
];

export const stampDutyCalculator: CalculatorDef = {
  slug: "stamp-duty",
  icon: "📜",
  version: 2,
  category: "finance",
  isCountrySpecific: true,
  titleKey: "calc.stamp-duty.title",
  descKey: "calc.stamp-duty.desc",
  countries: ["gb"],
  fields: ({ countryCode }) => [
    {
      id: "price",
      labelKey: "field.propertyPrice",
      kind: "currency",
      min: 50_000,
      max: 5_000_000,
      step: 5_000,
      default: MONEY_SCALE[countryCode].defaults.property,
    },
    {
      id: "buyer",
      labelKey: "field.buyerType",
      kind: "select",
      default: "standard",
      options: [
        { value: "standard", labelKey: "option.movingHome" },
        { value: "first", labelKey: "option.firstTimeBuyer" },
        { value: "additional", labelKey: "option.additionalProperty" },
      ],
    },
    {
      id: "nonResident",
      labelKey: "field.sdltNonResident",
      hintKey: "calc.stamp-duty.residencyHint",
      kind: "toggle",
      default: false,
    },
  ],
  compute: (values) => {
    const price = num(values, "price");
    const buyer = str(values, "buyer", "standard");

    // First-time buyer relief only applies below the 500,000 cap.
    const useRelief = buyer === "first" && price <= 500_000;
    const { tax: base, portions } = applySlabs(
      price,
      useRelief ? SDLT_FIRST_TIME : SDLT_STANDARD,
    );
    // Additional properties pay a flat surcharge on the whole price.
    const surcharge = (buyer === "additional" ? price * 0.05 : 0) + (bool(values, "nonResident") ? price * 0.02 : 0);
    const total = base + surcharge;

    return {
      primary: {
        labelKey: "result.stampDuty",
        value: total,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.propertyPrice", value: price, kind: "currency", tone: "principal" },
        ...(surcharge > 0
          ? [
              {
                labelKey: "result.surcharge",
                value: surcharge,
                kind: "currency" as const,
                tone: "tax" as const,
              },
            ]
          : []),
        {
          labelKey: "result.effectiveRate",
          value: price > 0 ? (total / price) * 100 : 0,
          kind: "percent",
          tone: "neutral",
        },
        { labelKey: "result.totalCost", value: price + total, kind: "currency", tone: "neutral" },
      ],
      chart: [
        { labelKey: "result.propertyPrice", value: price, tone: "principal" },
        { labelKey: "result.stampDuty", value: total, tone: "tax" },
      ],
      table: {
        columns: [
          { key: "band", labelKey: "table.band", kind: "text" },
          { key: "rate", labelKey: "table.rate", kind: "percent" },
          { key: "tax", labelKey: "table.tax", kind: "currency" },
        ],
        rows: portions
          .filter((portion) => portion.taxableInSlab > 0)
          .map((portion) => ({
            band:
              portion.to === null
                ? `£${portion.from.toLocaleString("en-GB")}+`
                : `£${portion.from.toLocaleString("en-GB")} – £${portion.to.toLocaleString("en-GB")}`,
            rate: portion.rate,
            tax: portion.tax,
          })),
      },
      notes: [{ key: "review.scope.sdlt" }],
    };
  },
  explainerKeys: ["calc.stamp-duty.explain"],
};

/* ------------------------------------------------------------ Church tax */

export const churchTaxCalculator: CalculatorDef = {
  slug: "church-tax",
  icon: "⛪",
  version: 1,
  category: "finance",
  isCountrySpecific: true,
  titleKey: "calc.church-tax.title",
  descKey: "calc.church-tax.desc",
  countries: ["de", "at", "ch"],
  fields: ({ countryCode }) => [
    {
      id: "income",
      labelKey: "field.annualIncome",
      kind: "currency",
      min: MONEY_SCALE[countryCode].incomeMin,
      max: MONEY_SCALE[countryCode].incomeMax,
      step: MONEY_SCALE[countryCode].incomeStep,
      default: MONEY_SCALE[countryCode].defaults.income,
    },
    {
      id: "rate",
      labelKey: "field.churchTaxRate",
      kind: "select",
      default: "9",
      options: [
        { value: "8", labelKey: "", label: "8%" },
        { value: "9", labelKey: "", label: "9%" },
      ],
    },
  ],
  compute: (values, { countryCode }) => {
    const income = num(values, "income");
    const rate = num(values, "rate", 9);
    const incomeTax = INCOME_TAX_RULES[countryCode].compute({ grossIncome: income }).baseTax;
    const churchTax = (incomeTax * rate) / 100;

    return {
      primary: {
        labelKey: "result.churchTax",
        value: churchTax,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.taxOnIncome", value: incomeTax, kind: "currency", tone: "principal" },
        { labelKey: "result.churchTaxMonthly", value: churchTax / 12, kind: "currency", tone: "tax" },
      ],
      chart: [
        { labelKey: "result.taxOnIncome", value: incomeTax, tone: "principal" },
        { labelKey: "result.churchTax", value: churchTax, tone: "tax" },
      ],
      notes: [{ key: "calc.church-tax.note" }],
    };
  },
  explainerKeys: ["calc.church-tax.explain"],
};

/* ---------------------------------------------------------- Property tax */

export const propertyTaxCalculator: CalculatorDef = {
  slug: "property-tax",
  icon: "🏡",
  version: 2,
  category: "finance",
  countryRelevance: "currency",
  titleKey: "calc.property-tax.title",
  descKey: "calc.property-tax.desc",
  countries: ALL,
  fields: ({ countryCode }) => [
    {
      id: "value",
      labelKey: "field.taxablePropertyValue",
      kind: "currency",
      min: 0,
      max: MONEY_SCALE[countryCode].loanMax,
      step: MONEY_SCALE[countryCode].loanStep,
      default: MONEY_SCALE[countryCode].defaults.property,
    },
    {
      id: "rate",
      labelKey: "field.taxRate",
      hintKey: "calc.property-tax.desc",
      kind: "percent",
      min: 0,
      max: 100,
      step: 0.01,
      slider: false,
      default: 0,
    },
  ],
  compute: (values) => {
    const annual = (num(values, "value") * num(values, "rate")) / 100;
    return {
      primary: {
        labelKey: "result.annualTax",
        value: annual,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.monthlyTax", value: annual / 12, kind: "currency", tone: "tax" },
        { labelKey: "result.tenYearTax", value: annual * 10, kind: "currency", tone: "neutral" },
      ],
      notes: [{ key: "calc.property-tax.scope" }],
    };
  },
  explainerKeys: ["calc.property-tax.explain"],
};

// Apply only independently source-reviewed country replacements.
applyReviewedCountry(incomeTaxCalculator);
applyReviewedCountry(capitalGainsCalculator);
applyReviewedCountry(churchTaxCalculator);
