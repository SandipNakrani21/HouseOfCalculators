import { MONEY_SCALE } from "@/config/calculators/scale";
import { num, type CalculatorDef } from "@/config/calculators/types";
import { sipFutureValue } from "@/lib/finance";

/**
 * Monthly contribution into a fund. The maths is the same everywhere; what
 * changes per country is the money scale and what the product is called -
 * SIP in India, a monthly investment plan elsewhere.
 */
export const sipCalculator: CalculatorDef = {
  slug: "sip",
  icon: "📈",
  category: "investment",
  titleKey: "calc.sip.title",
  descKey: "calc.sip.desc",
  countries: ["in", "us", "gb", "ae"],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "monthly",
        labelKey: "calc.sip.field.monthly",
        kind: "currency",
        min: scale.monthlyMin,
        max: scale.monthlyMax,
        step: scale.monthlyStep,
        default: scale.defaults.monthly,
      },
      {
        id: "rate",
        labelKey: "calc.sip.field.rate",
        kind: "percent",
        min: 1,
        max: 30,
        step: 0.5,
        default: 12,
      },
      {
        id: "years",
        labelKey: "calc.sip.field.years",
        kind: "years",
        min: 1,
        max: 40,
        step: 1,
        default: 10,
      },
    ];
  },
  compute: (values) => {
    const monthly = num(values, "monthly");
    const rate = num(values, "rate");
    const years = num(values, "years");

    const invested = monthly * Math.round(years * 12);
    const maturity = sipFutureValue(monthly, rate, years);
    const returns = Math.max(maturity - invested, 0);

    return {
      primary: {
        labelKey: "calc.sip.result.total",
        value: maturity,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        {
          labelKey: "calc.sip.result.invested",
          value: invested,
          kind: "currency",
          tone: "principal",
        },
        {
          labelKey: "calc.sip.result.returns",
          value: returns,
          kind: "currency",
          tone: "returns",
        },
      ],
      chart: [
        { labelKey: "calc.sip.result.invested", value: invested, tone: "principal" },
        { labelKey: "calc.sip.result.returns", value: returns, tone: "returns" },
      ],
    };
  },
  explainerKeys: ["calc.sip.explain.1", "calc.sip.explain.2"],
  faqKeys: ["calc.sip.faq.1", "calc.sip.faq.2"],
};
