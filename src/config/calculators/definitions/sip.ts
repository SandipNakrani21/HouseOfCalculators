import { MONEY_SCALE } from "@/config/calculators/scale";
import { num, type CalculatorDef } from "@/config/calculators/types";
import { sipFutureValue, stepUpSipFutureValue, stepUpSipInvested } from "@/lib/finance";

/**
 * Monthly contribution into a fund. The maths is the same everywhere; what
 * changes per country is the money scale and what the product is called -
 * an SIP in India, a regular investment plan elsewhere.
 */
export const sipCalculator: CalculatorDef = {
  slug: "sip",
  icon: "📈",
  version: 1,
  category: "finance",
  titleKey: "calc.sip.title",
  descKey: "calc.sip.desc",
  countries: ["in", "ae", "us", "gb", "ca", "au"],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "monthly",
        labelKey: "field.monthlyInvestment",
        kind: "currency",
        min: scale.monthlyMin,
        max: scale.monthlyMax,
        step: scale.monthlyStep,
        default: scale.defaults.monthly,
      },
      {
        id: "rate",
        labelKey: "field.expectedReturn",
        kind: "percent",
        min: 1,
        max: 30,
        step: 0.5,
        default: 12,
      },
      {
        id: "years",
        labelKey: "field.timePeriod",
        kind: "years",
        min: 1,
        max: 40,
        step: 1,
        default: 10,
      },
      {
        id: "stepUp",
        labelKey: "field.annualStepUp",
        hintKey: "calc.sip.stepUpHint",
        kind: "percent",
        min: 0,
        max: 25,
        step: 1,
        default: 0,
      },
    ];
  },
  compute: (values) => {
    const monthly = num(values, "monthly");
    const rate = num(values, "rate");
    const years = num(values, "years");
    const stepUp = num(values, "stepUp");

    // A step-up SIP raises the instalment every year, so both the amount paid
    // in and the maturity have to be walked month by month.
    const invested =
      stepUp > 0
        ? stepUpSipInvested(monthly, years, stepUp)
        : monthly * Math.round(years * 12);
    const maturity =
      stepUp > 0
        ? stepUpSipFutureValue(monthly, rate, years, stepUp)
        : sipFutureValue(monthly, rate, years);
    const returns = Math.max(maturity - invested, 0);

    return {
      primary: {
        labelKey: "result.totalValue",
        value: maturity,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        {
          labelKey: "result.investedAmount",
          value: invested,
          kind: "currency",
          tone: "principal",
        },
        {
          labelKey: "result.estimatedReturns",
          value: returns,
          kind: "currency",
          tone: "returns",
        },
      ],
      chart: [
        { labelKey: "result.investedAmount", value: invested, tone: "principal" },
        { labelKey: "result.estimatedReturns", value: returns, tone: "returns" },
      ],
    };
  },
  explainerKeys: ["calc.sip.explain.1", "calc.sip.explain.2"],
  faqKeys: ["calc.sip.faq.1", "calc.sip.faq.2"],
};
