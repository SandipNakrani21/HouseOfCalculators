import { num, str, type CalculatorDef } from "@/config/calculators/types";

/**
 * GST in India, VAT in the UK and UAE, sales tax in the US. Same arithmetic,
 * different name and different statutory rates - both of which come from the
 * country config, so this file never names a country.
 */
export const consumptionTaxCalculator: CalculatorDef = {
  slug: "gst",
  icon: "🧮",
  category: "business",
  titleKey: "calc.gst.title",
  descKey: "calc.gst.desc",
  params: ({ country, t }) => ({ tax: t(country.consumptionTax.labelKey) }),
  countries: ["in", "us", "gb", "ae"],
  fields: ({ country }) => [
    {
      id: "amount",
      labelKey: "calc.gst.field.amount",
      kind: "currency",
      min: 0,
      max: 10_000_000,
      step: 100,
      slider: false,
      default: 10_000,
    },
    {
      id: "direction",
      labelKey: "calc.gst.field.direction",
      kind: "select",
      default: "exclusive",
      options: [
        { value: "exclusive", labelKey: "calc.gst.direction.exclusive" },
        { value: "inclusive", labelKey: "calc.gst.direction.inclusive" },
      ],
    },
    {
      id: "rate",
      labelKey: "calc.gst.field.rate",
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
    const gross = net + tax;

    const taxName = t(country.consumptionTax.labelKey);

    return {
      primary: {
        labelKey: "calc.gst.result.gross",
        value: gross,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        {
          labelKey: "calc.gst.result.net",
          value: net,
          kind: "currency",
          tone: "principal",
        },
        {
          labelKey: "calc.gst.result.tax",
          value: tax,
          kind: "currency",
          tone: "tax",
        },
      ],
      chart: [
        { labelKey: "calc.gst.result.net", value: net, tone: "principal" },
        { labelKey: "calc.gst.result.tax", value: tax, tone: "tax" },
      ],
      notes:
        country.code === "in"
          ? [{ key: "calc.gst.note.in" }]
          : country.code === "us"
            ? [{ key: "calc.gst.note.us" }]
            : [{ key: "calc.gst.note.generic", params: { tax: taxName } }],
    };
  },
  explainerKeys: ["calc.gst.explain.1"],
  faqKeys: ["calc.gst.faq.1"],
};
