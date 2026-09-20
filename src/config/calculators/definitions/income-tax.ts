import { MONEY_SCALE } from "@/config/calculators/scale";
import {
  num,
  str,
  type CalculatorDef,
  type ResultRow,
} from "@/config/calculators/types";
import { INCOME_TAX_RULES } from "@/lib/finance/tax/income-tax";

/**
 * The clearest case of country-specific logic on the site: slabs, allowances,
 * rebates and payroll add-ons all come from the country rule set, and the form
 * reshapes itself around them (regimes in India, filing status in the US,
 * nothing to choose in the UAE).
 */
export const incomeTaxCalculator: CalculatorDef = {
  slug: "income-tax",
  icon: "🧾",
  category: "tax",
  titleKey: "calc.income-tax.title",
  descKey: "calc.income-tax.desc",
  countries: ["in", "us", "gb", "ae"],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    const rules = INCOME_TAX_RULES[countryCode];

    return [
      {
        id: "income",
        labelKey: "calc.income-tax.field.income",
        kind: "currency",
        min: scale.incomeMin,
        max: scale.incomeMax,
        step: scale.incomeStep,
        default: scale.defaults.income,
      },
      ...(rules.regimes.length > 1
        ? ([
            {
              id: "regime",
              labelKey: "calc.income-tax.field.regime",
              kind: "select" as const,
              default: rules.defaultRegime,
              options: rules.regimes.map((regime) => ({
                value: regime.value,
                labelKey: regime.labelKey,
              })),
            },
          ])
        : []),
      {
        id: "deductions",
        labelKey: "calc.income-tax.field.deductions",
        hintKey: `calc.income-tax.hint.deductions.${countryCode}`,
        kind: "currency",
        min: 0,
        max: Math.round(scale.incomeMax / 4),
        step: scale.incomeStep,
        default: 0,
        visibleWhen: (values) =>
          rules.allowsDeductions(
            str(values, "regime", rules.defaultRegime),
          ),
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
        labelKey: "calc.income-tax.result.gross",
        value: result.grossIncome,
        kind: "currency",
        tone: "neutral",
      },
      {
        labelKey: "calc.income-tax.result.taxable",
        value: result.taxableIncome,
        kind: "currency",
        tone: "neutral",
      },
      {
        labelKey: "calc.income-tax.result.baseTax",
        value: result.baseTax,
        kind: "currency",
        tone: "tax",
      },
    ];

    if (result.rebate > 0) {
      rows.push({
        labelKey: "calc.income-tax.result.rebate",
        value: -result.rebate,
        kind: "currency",
        tone: "returns",
      });
    }
    if (result.surcharge > 0) {
      rows.push({
        labelKey: "calc.income-tax.result.surcharge",
        value: result.surcharge,
        kind: "currency",
        tone: "tax",
      });
    }
    for (const extra of result.additional) {
      rows.push({
        labelKey: extra.labelKey,
        value: extra.amount,
        kind: "currency",
        tone: "tax",
      });
    }

    rows.push(
      {
        labelKey: "calc.income-tax.result.totalTax",
        value: result.totalTax,
        kind: "currency",
        tone: "tax",
        emphasis: true,
      },
      {
        labelKey: "calc.income-tax.result.effective",
        value: result.effectiveRate,
        kind: "percent",
        tone: "neutral",
      },
      {
        labelKey: "calc.income-tax.result.marginal",
        value: result.marginalRate,
        kind: "percent",
        tone: "neutral",
      },
    );

    return {
      primary: {
        labelKey: "calc.income-tax.result.net",
        value: result.netIncome,
        kind: "currency",
        emphasis: true,
      },
      rows,
      chart: [
        {
          labelKey: "calc.income-tax.result.net",
          value: result.netIncome,
          tone: "principal",
        },
        {
          labelKey: "calc.income-tax.result.totalTax",
          value: result.totalTax,
          tone: "tax",
        },
      ],
      table: result.portions.length
        ? {
            columns: [
              {
                key: "band",
                labelKey: "calc.income-tax.table.band",
                kind: "text",
              },
              {
                key: "rate",
                labelKey: "calc.income-tax.table.rate",
                kind: "percent",
              },
              {
                key: "taxableInSlab",
                labelKey: "calc.income-tax.table.taxable",
                kind: "currency",
              },
              {
                key: "tax",
                labelKey: "calc.income-tax.table.tax",
                kind: "currency",
              },
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
      notes:
        countryCode === "ae"
          ? [{ key: "calc.income-tax.note.ae" }]
          : countryCode === "us"
            ? [{ key: "calc.income-tax.note.us" }]
            : countryCode === "gb"
              ? [{ key: "calc.income-tax.note.gb" }]
              : [{ key: "calc.income-tax.note.in" }],
    };
  },
  explainerKeys: ["calc.income-tax.explain.1", "calc.income-tax.explain.2"],
  faqKeys: ["calc.income-tax.faq.1", "calc.income-tax.faq.2"],
};
