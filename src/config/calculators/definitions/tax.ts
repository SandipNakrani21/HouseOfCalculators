import { MONEY_SCALE } from "@/config/calculators/scale";
import {
  num,
  str,
  type CalculatorDef,
  type ResultRow,
} from "@/config/calculators/types";
import type { CountryCode } from "@/config/countries";
import { applySlabs, INCOME_TAX_RULES, type Slab } from "@/lib/finance/tax";

const ALL: CountryCode[] = [
  "in", "us", "gb", "ae", "ca", "au", "de", "at", "ch", "fr",
  "be", "nl", "jp", "es", "mx", "it", "pt", "br", "pl", "tr",
  "ru", "cn",
];

/* ------------------------------------------------------------ Income tax */

export const incomeTaxCalculator: CalculatorDef = {
  slug: "income-tax",
  icon: "🧾",
  version: 1,
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
        min: scale.incomeMin,
        max: scale.incomeMax,
        step: scale.incomeStep,
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
        value: result.marginalRate,
        kind: "percent",
        tone: "neutral",
      },
    );

    return {
      primary: {
        labelKey: "result.takeHome",
        value: result.netIncome,
        kind: "currency",
        emphasis: true,
      },
      rows,
      chart: [
        { labelKey: "result.takeHome", value: result.netIncome, tone: "principal" },
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
      notes: [{ key: result.noteKey }],
    };
  },
  explainerKeys: ["calc.income-tax.explain.1", "calc.income-tax.explain.2"],
  faqKeys: ["calc.income-tax.faq.1", "calc.income-tax.faq.2"],
};

/* ------------------------------------------------------- Consumption tax */

export const consumptionTaxCalculator: CalculatorDef = {
  slug: "vat",
  icon: "🧮",
  version: 1,
  category: "finance",
  isCountrySpecific: true,
  titleKey: "calc.vat.title",
  descKey: "calc.vat.desc",
  params: ({ country, t }) => ({ tax: t(country.consumptionTax.labelKey) }),
  countries: ALL,
  fields: ({ country, countryCode }) => [
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
      kind: "select",
      default: String(country.consumptionTax.standardRate),
      options: country.consumptionTax.rates.map((rate) => ({
        value: String(rate),
        labelKey: "",
        label: `${rate}%`,
      })),
    },
  ],
  compute: (values, { country, t }) => {
    const amount = num(values, "amount");
    const rate = num(values, "rate", country.consumptionTax.standardRate);
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
          key: `calc.vat.note.${country.code}`,
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
    longTerm: [{ from: 0, rate: 24 }],
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
    longTerm: [{ from: 0, rate: 30 }],
    longTermMonths: 0,
  },
  es: {
    allowance: 0,
    longTerm: [
      { from: 0, rate: 19 },
      { from: 6_000, rate: 21 },
      { from: 50_000, rate: 23 },
      { from: 200_000, rate: 27 },
      { from: 300_000, rate: 28 },
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
  version: 1,
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
        options: [
          { value: "long", labelKey: "option.longTerm" },
          { value: "short", labelKey: "option.shortTerm" },
        ],
      },
      {
        id: "income",
        labelKey: "field.otherIncome",
        kind: "currency",
        min: 0,
        max: scale.incomeMax,
        step: scale.incomeStep,
        default: scale.defaults.income,
      },
    ];
  },
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
    const taxable = Math.max(included - rule.allowance, 0);

    let tax: number;
    if (longTerm) {
      // Rates that depend on total income are found by locating the gain on
      // the scale above the income already earned.
      const withIncome = applySlabs(income + taxable, rule.longTerm).tax;
      const withoutGain = applySlabs(income, rule.longTerm).tax;
      tax =
        rule.longTerm.length > 1 ? withIncome - withoutGain : (taxable * rule.longTerm[0].rate) / 100;
    } else {
      // Short-term gains are taxed as ordinary income almost everywhere.
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
        ...(rule.allowance
          ? [
              {
                labelKey: "result.exemptAmount",
                value: -Math.min(included, rule.allowance),
                kind: "currency" as const,
                tone: "returns" as const,
              },
            ]
          : []),
        { labelKey: "result.taxableGain", value: taxable, kind: "currency", tone: "neutral" },
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
      notes: [{ key: `calc.capital-gains.note.${countryCode}` }],
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
  version: 1,
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
    const surcharge = buyer === "additional" ? price * 0.05 : 0;
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
      notes: [{ key: "calc.stamp-duty.note" }],
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

/** Indicative annual property tax rate as a share of value, per country. */
const PROPERTY_TAX_RATE: Partial<Record<CountryCode, number>> = {
  fr: 1.1,
  it: 0.86,
  us: 1.1,
  es: 0.6,
  pt: 0.35,
};

export const propertyTaxCalculator: CalculatorDef = {
  slug: "property-tax",
  icon: "🏡",
  version: 1,
  category: "finance",
  isCountrySpecific: true,
  titleKey: "calc.property-tax.title",
  descKey: "calc.property-tax.desc",
  countries: Object.keys(PROPERTY_TAX_RATE) as CountryCode[],
  fields: ({ countryCode }) => [
    {
      id: "value",
      labelKey: "field.propertyValue",
      kind: "currency",
      min: MONEY_SCALE[countryCode].loanMin,
      max: MONEY_SCALE[countryCode].loanMax,
      step: MONEY_SCALE[countryCode].loanStep,
      default: MONEY_SCALE[countryCode].defaults.property,
    },
    {
      id: "rate",
      labelKey: "field.taxRate",
      kind: "percent",
      min: 0,
      max: 4,
      step: 0.01,
      default: PROPERTY_TAX_RATE[countryCode] ?? 1,
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
      notes: [{ key: "calc.property-tax.note" }],
    };
  },
  explainerKeys: ["calc.property-tax.explain"],
};
