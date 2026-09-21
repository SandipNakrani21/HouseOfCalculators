import { MONEY_SCALE } from "@/config/calculators/scale";
import { COUNTRY_CODES } from "@/config/countries";
import { num, str, type CalculatorDef } from "@/config/calculators/types";
import {
  applyDiscount,
  breakEven,
  discountPercent,
  electricityCost,
  fuelCost,
  growthRate,
  marginToMarkup,
  markup,
  markupToMargin,
  priceForMargin,
  priceForMarkup,
  profitMargin,
  recipeScale,
  roas,
  roi,
} from "@/lib/business";

/**
 * Business, pricing and everyday-cost calculators.
 *
 * These are money calculations without statutory rules, so the country sets
 * the currency and the sensible slider range and nothing else - which is
 * exactly what the default `currency` relevance means.
 */

const EVERYWHERE = COUNTRY_CODES;

export const profitMarginCalculator: CalculatorDef = {
  slug: "profit-margin",
  icon: "💹",
  version: 1,
  category: "business",
  titleKey: "calc.margin.title",
  descKey: "calc.margin.desc",
  countries: EVERYWHERE,
  relatedCalculators: ["markup", "break-even", "roi"],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "revenue",
        labelKey: "field.sellingPrice",
        kind: "currency",
        min: 0,
        max: scale.lumpMax,
        step: scale.lumpStep,
        slider: false,
        default: scale.defaults.lump,
      },
      {
        id: "cost",
        labelKey: "field.costPrice",
        kind: "currency",
        min: 0,
        max: scale.lumpMax,
        step: scale.lumpStep,
        slider: false,
        default: Math.round(scale.defaults.lump * 0.6),
      },
    ];
  },
  compute: (values) => {
    const revenue = num(values, "revenue");
    const cost = num(values, "cost");
    const profit = revenue - cost;

    return {
      primary: {
        labelKey: "result.profitMargin",
        value: profitMargin(revenue, cost),
        kind: "percent",
        decimals: 2,
        emphasis: true,
      },
      rows: [
        { labelKey: "result.grossProfit", value: profit, kind: "currency", tone: "returns" },
        { labelKey: "result.markup", value: markup(revenue, cost), kind: "percent", decimals: 2, tone: "principal" },
        { labelKey: "result.costPrice", value: cost, kind: "currency", tone: "neutral" },
        { labelKey: "result.sellingPrice", value: revenue, kind: "currency", tone: "neutral" },
      ],
      chart: [
        { labelKey: "result.costPrice", value: Math.max(cost, 0), tone: "principal" },
        { labelKey: "result.grossProfit", value: Math.max(profit, 0), tone: "returns" },
      ],
      notes: profit < 0 ? [{ key: "calc.margin.lossNote" }] : undefined,
    };
  },
  explainerKeys: ["calc.margin.explain.1", "calc.margin.explain.2"],
  faqKeys: ["calc.margin.faq.1", "calc.margin.faq.2"],
};

export const markupCalculator: CalculatorDef = {
  slug: "markup",
  icon: "🏷️",
  version: 1,
  category: "business",
  titleKey: "calc.markup.title",
  descKey: "calc.markup.desc",
  countries: EVERYWHERE,
  relatedCalculators: ["profit-margin", "break-even"],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "cost",
        labelKey: "field.costPrice",
        kind: "currency",
        min: 0,
        max: scale.lumpMax,
        step: scale.lumpStep,
        slider: false,
        default: Math.round(scale.defaults.lump * 0.6),
      },
      {
        id: "target",
        labelKey: "field.targetPercent",
        kind: "percent",
        min: 0,
        max: 300,
        step: 5,
        default: 50,
      },
      {
        id: "basis",
        labelKey: "field.appliedAs",
        kind: "select",
        default: "markup",
        options: [
          { value: "markup", labelKey: "option.asMarkup" },
          { value: "margin", labelKey: "option.asMargin" },
        ],
      },
    ];
  },
  compute: (values) => {
    const cost = num(values, "cost");
    const target = num(values, "target");
    const asMargin = str(values, "basis", "markup") === "margin";

    const price = asMargin ? priceForMargin(cost, target) : priceForMarkup(cost, target);
    const profit = price - cost;

    return {
      primary: {
        labelKey: "result.sellingPrice",
        value: price,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.grossProfit", value: profit, kind: "currency", tone: "returns" },
        {
          labelKey: "result.markup",
          value: asMargin ? marginToMarkup(target) : target,
          kind: "percent",
          decimals: 2,
          tone: "principal",
        },
        {
          labelKey: "result.profitMargin",
          value: asMargin ? target : markupToMargin(target),
          kind: "percent",
          decimals: 2,
          tone: "principal",
        },
      ],
      chart: [
        { labelKey: "result.costPrice", value: Math.max(cost, 0), tone: "principal" },
        { labelKey: "result.grossProfit", value: Math.max(profit, 0), tone: "returns" },
      ],
      notes: [{ key: "calc.markup.note" }],
    };
  },
  explainerKeys: ["calc.markup.explain.1", "calc.markup.explain.2"],
  faqKeys: ["calc.markup.faq.1", "calc.markup.faq.2"],
};

export const breakEvenCalculator: CalculatorDef = {
  slug: "break-even",
  icon: "⚖️",
  version: 1,
  category: "business",
  titleKey: "calc.breakEven.title",
  descKey: "calc.breakEven.desc",
  countries: EVERYWHERE,
  relatedCalculators: ["profit-margin", "markup", "roi"],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "fixed",
        labelKey: "field.fixedCosts",
        kind: "currency",
        min: 0,
        max: scale.loanMax,
        step: scale.loanStep,
        slider: false,
        default: scale.defaults.lump,
      },
      {
        id: "price",
        labelKey: "field.pricePerUnit",
        kind: "currency",
        min: 0,
        max: scale.lumpMax,
        step: scale.monthlyStep,
        slider: false,
        default: Math.max(Math.round(scale.defaults.monthly / 4), 1),
      },
      {
        id: "variable",
        labelKey: "field.variableCost",
        kind: "currency",
        min: 0,
        max: scale.lumpMax,
        step: scale.monthlyStep,
        slider: false,
        default: Math.max(Math.round(scale.defaults.monthly / 10), 1),
      },
    ];
  },
  compute: (values) => {
    const result = breakEven({
      fixedCosts: num(values, "fixed"),
      pricePerUnit: num(values, "price"),
      variableCostPerUnit: num(values, "variable"),
    });

    if (result.neverBreaksEven) {
      return {
        primary: { labelKey: "result.breakEvenUnits", value: "—", kind: "text", emphasis: true },
        rows: [
          {
            labelKey: "result.contributionPerUnit",
            value: result.contributionPerUnit,
            kind: "currency",
            tone: "tax",
          },
        ],
        notes: [{ key: "calc.breakEven.neverNote" }],
      };
    }

    return {
      primary: {
        labelKey: "result.breakEvenUnits",
        value: Math.ceil(result.units),
        kind: "number",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.breakEvenRevenue", value: result.revenue, kind: "currency", tone: "returns" },
        { labelKey: "result.contributionPerUnit", value: result.contributionPerUnit, kind: "currency", tone: "principal" },
        { labelKey: "result.contributionMargin", value: result.contributionMargin, kind: "percent", decimals: 2, tone: "principal" },
      ],
      notes: [{ key: "calc.breakEven.note" }],
    };
  },
  explainerKeys: ["calc.breakEven.explain.1", "calc.breakEven.explain.2"],
  faqKeys: ["calc.breakEven.faq.1", "calc.breakEven.faq.2"],
};

export const roiCalculator: CalculatorDef = {
  slug: "roi",
  icon: "📈",
  version: 1,
  category: "business",
  titleKey: "calc.roi.title",
  descKey: "calc.roi.desc",
  countries: EVERYWHERE,
  relatedCalculators: ["roas", "break-even", "profit-margin"],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "cost",
        labelKey: "field.amountInvested",
        kind: "currency",
        min: 0,
        max: scale.lumpMax,
        step: scale.lumpStep,
        slider: false,
        default: scale.defaults.lump,
      },
      {
        id: "gain",
        labelKey: "field.amountReturned",
        kind: "currency",
        min: 0,
        max: scale.lumpMax,
        step: scale.lumpStep,
        slider: false,
        default: Math.round(scale.defaults.lump * 1.4),
      },
      {
        id: "years",
        labelKey: "field.holdingPeriod",
        kind: "years",
        min: 1,
        max: 40,
        step: 1,
        default: 3,
      },
    ];
  },
  compute: (values) => {
    const cost = num(values, "cost");
    const gain = num(values, "gain");
    const years = Math.max(num(values, "years", 1), 1);
    const total = roi(gain, cost);

    // Annualised so a 40% return over three years is not compared with a 40%
    // return over one.
    const annualised =
      cost > 0 && gain > 0 ? ((gain / cost) ** (1 / years) - 1) * 100 : 0;

    return {
      primary: {
        labelKey: "result.roi",
        value: total,
        kind: "percent",
        decimals: 2,
        emphasis: true,
      },
      rows: [
        { labelKey: "result.netProfit", value: gain - cost, kind: "currency", tone: "returns" },
        { labelKey: "result.annualisedReturn", value: annualised, kind: "percent", decimals: 2, tone: "principal" },
        { labelKey: "result.amountInvested", value: cost, kind: "currency", tone: "neutral" },
      ],
      chart: [
        { labelKey: "result.amountInvested", value: Math.max(cost, 0), tone: "principal" },
        { labelKey: "result.netProfit", value: Math.max(gain - cost, 0), tone: "returns" },
      ],
      notes: [{ key: "calc.roi.note" }],
    };
  },
  explainerKeys: ["calc.roi.explain.1", "calc.roi.explain.2"],
  faqKeys: ["calc.roi.faq.1", "calc.roi.faq.2"],
};

export const roasCalculator: CalculatorDef = {
  slug: "roas",
  icon: "📣",
  version: 1,
  category: "business",
  titleKey: "calc.roas.title",
  descKey: "calc.roas.desc",
  countries: EVERYWHERE,
  relatedCalculators: ["roi", "profit-margin"],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "spend",
        labelKey: "field.adSpend",
        kind: "currency",
        min: 0,
        max: scale.lumpMax,
        step: scale.lumpStep,
        slider: false,
        default: scale.defaults.lump,
      },
      {
        id: "revenue",
        labelKey: "field.revenueGenerated",
        kind: "currency",
        min: 0,
        max: scale.lumpMax,
        step: scale.lumpStep,
        slider: false,
        default: Math.round(scale.defaults.lump * 4),
      },
      {
        id: "margin",
        labelKey: "field.grossMarginPercent",
        hintKey: "calc.roas.marginHint",
        kind: "percent",
        min: 0,
        max: 100,
        step: 1,
        default: 40,
      },
    ];
  },
  compute: (values) => {
    const spend = num(values, "spend");
    const revenue = num(values, "revenue");
    const marginPercent = num(values, "margin");

    const ratio = roas(revenue, spend);
    const grossProfit = (revenue * marginPercent) / 100;

    return {
      primary: {
        labelKey: "result.roas",
        value: `${ratio.toFixed(2)}×`,
        kind: "text",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.grossProfit", value: grossProfit, kind: "currency", tone: "returns" },
        // The figure that decides whether the campaign actually paid.
        { labelKey: "result.profitAfterAds", value: grossProfit - spend, kind: "currency", tone: "principal" },
        { labelKey: "result.breakEvenRoas", value: marginPercent === 0 ? "—" : `${(100 / marginPercent).toFixed(2)}×`, kind: "text", tone: "tax", hintKey: "calc.roas.breakEvenHint" },
        { labelKey: "result.roi", value: roi(grossProfit, spend), kind: "percent", decimals: 2, tone: "neutral" },
      ],
      notes: [{ key: "calc.roas.note" }],
    };
  },
  explainerKeys: ["calc.roas.explain.1", "calc.roas.explain.2"],
  faqKeys: ["calc.roas.faq.1", "calc.roas.faq.2"],
};

export const growthRateCalculator: CalculatorDef = {
  slug: "growth-rate",
  icon: "📊",
  version: 1,
  category: "business",
  titleKey: "calc.growth.title",
  descKey: "calc.growth.desc",
  countries: EVERYWHERE,
  relatedCalculators: ["roi", "profit-margin"],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "from",
        labelKey: "field.startingValue",
        kind: "currency",
        min: 0,
        max: scale.loanMax,
        step: scale.lumpStep,
        slider: false,
        default: scale.defaults.lump,
      },
      {
        id: "to",
        labelKey: "field.endingValue",
        kind: "currency",
        min: 0,
        max: scale.loanMax,
        step: scale.lumpStep,
        slider: false,
        default: Math.round(scale.defaults.lump * 1.8),
      },
      {
        id: "periods",
        labelKey: "field.periods",
        kind: "number",
        min: 1,
        max: 50,
        step: 1,
        default: 5,
      },
    ];
  },
  compute: (values) => {
    const from = num(values, "from");
    const to = num(values, "to");
    const periods = Math.max(num(values, "periods", 1), 1);

    const total = growthRate(from, to);
    const compound = from > 0 && to > 0 ? ((to / from) ** (1 / periods) - 1) * 100 : 0;

    return {
      primary: {
        labelKey: "result.totalGrowth",
        value: total,
        kind: "percent",
        decimals: 2,
        emphasis: true,
      },
      rows: [
        { labelKey: "result.cagr", value: compound, kind: "percent", decimals: 2, tone: "returns" },
        { labelKey: "result.absoluteChange", value: to - from, kind: "currency", tone: "principal" },
        // The straight average is shown because people reach for it, and it
        // overstates growth whenever the series compounds.
        { labelKey: "result.averagePerPeriod", value: total / periods, kind: "percent", decimals: 2, tone: "neutral", hintKey: "calc.growth.averageHint" },
      ],
      notes: [{ key: "calc.growth.note" }],
    };
  },
  explainerKeys: ["calc.growth.explain.1", "calc.growth.explain.2"],
  faqKeys: ["calc.growth.faq.1", "calc.growth.faq.2"],
};

/* ------------------------------------------------------------- everyday */

export const discountCalculator: CalculatorDef = {
  slug: "discount",
  icon: "🔖",
  version: 1,
  category: "everyday",
  titleKey: "calc.discount.title",
  descKey: "calc.discount.desc",
  countries: EVERYWHERE,
  relatedCalculators: ["tip", "profit-margin"],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "price",
        labelKey: "field.originalPrice",
        kind: "currency",
        min: 0,
        max: scale.lumpMax,
        step: scale.monthlyStep,
        slider: false,
        default: scale.defaults.monthly,
      },
      {
        id: "percent",
        labelKey: "field.discountPercent",
        kind: "percent",
        min: 0,
        max: 90,
        step: 5,
        default: 25,
      },
      {
        id: "extra",
        labelKey: "field.extraPercent",
        hintKey: "calc.discount.extraHint",
        kind: "percent",
        min: 0,
        max: 90,
        step: 5,
        default: 0,
      },
    ];
  },
  compute: (values) => {
    const price = num(values, "price");
    const first = applyDiscount(price, num(values, "percent"));
    // A second "extra 10% off" applies to the already reduced price, which is
    // why two 20% discounts are 36% off rather than 40%.
    const second = applyDiscount(first.final, num(values, "extra"));

    const saved = price - second.final;

    return {
      primary: {
        labelKey: "result.finalPrice",
        value: second.final,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.youSave", value: saved, kind: "currency", tone: "returns" },
        { labelKey: "result.effectiveDiscount", value: discountPercent(price, second.final), kind: "percent", decimals: 2, tone: "principal" },
        { labelKey: "result.originalPrice", value: price, kind: "currency", tone: "neutral" },
      ],
      chart: [
        { labelKey: "result.finalPrice", value: Math.max(second.final, 0), tone: "principal" },
        { labelKey: "result.youSave", value: Math.max(saved, 0), tone: "returns" },
      ],
      notes: num(values, "extra") > 0 ? [{ key: "calc.discount.stackNote" }] : undefined,
    };
  },
  explainerKeys: ["calc.discount.explain.1", "calc.discount.explain.2"],
  faqKeys: ["calc.discount.faq.1", "calc.discount.faq.2"],
};

export const fuelCostCalculator: CalculatorDef = {
  slug: "fuel-cost",
  icon: "⛽",
  version: 1,
  category: "everyday",
  titleKey: "calc.fuelCost.title",
  descKey: "calc.fuelCost.desc",
  countries: EVERYWHERE,
  countryRelevance: "units",
  relatedCalculators: ["electricity-cost", "discount"],
  fields: ({ country, countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    const imperial = country.measurementSystem === "us-customary";
    return [
      {
        id: "style",
        labelKey: "field.economyStyle",
        kind: "select",
        // The US quotes miles per gallon; most of Europe quotes L/100 km.
        default: imperial ? "mpg" : country.measurementSystem === "mixed" ? "mpg" : "per100",
        options: [
          { value: "per100", labelKey: "option.litresPer100" },
          { value: "kmPerL", labelKey: "option.kmPerLitre" },
          { value: "mpg", labelKey: "option.milesPerGallon" },
        ],
      },
      {
        id: "distance",
        labelKey: "field.tripDistance",
        kind: "number",
        min: 1,
        max: 5000,
        step: 10,
        default: 300,
      },
      {
        id: "economy",
        labelKey: "field.fuelEconomy",
        kind: "number",
        min: 1,
        max: 100,
        step: 0.5,
        default: 7,
      },
      {
        id: "price",
        labelKey: "field.fuelPrice",
        kind: "currency",
        min: 0,
        max: Math.max(scale.monthlyStep * 40, 100),
        step: scale.monthlyStep / 25 || 0.01,
        slider: false,
        default: Math.max(Math.round(scale.defaults.monthly / 200), 1),
      },
    ];
  },
  compute: (values) => {
    const style = str(values, "style", "per100");
    const distance = num(values, "distance");
    const economy = num(values, "economy");
    const price = num(values, "price");

    // Miles per gallon is distance per unit, like km/L, just in other units.
    const { fuel, cost, costPerDistance } = fuelCost({
      distance,
      economy,
      pricePerUnit: price,
      consumptionStyle: style === "per100",
    });

    return {
      primary: {
        labelKey: "result.tripCost",
        value: cost,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.fuelUsed", value: fuel, kind: "number", decimals: 2, tone: "principal" },
        { labelKey: "result.costPerDistance", value: costPerDistance, kind: "currency", decimals: 2, tone: "returns" },
        { labelKey: "result.returnTrip", value: cost * 2, kind: "currency", tone: "neutral" },
      ],
      notes: [{ key: "calc.fuelCost.note" }],
    };
  },
  explainerKeys: ["calc.fuelCost.explain.1", "calc.fuelCost.explain.2"],
  faqKeys: ["calc.fuelCost.faq.1", "calc.fuelCost.faq.2"],
};

export const electricityCostCalculator: CalculatorDef = {
  slug: "electricity-cost",
  icon: "💡",
  version: 1,
  category: "everyday",
  titleKey: "calc.electricity.title",
  descKey: "calc.electricity.desc",
  countries: EVERYWHERE,
  relatedCalculators: ["fuel-cost", "discount"],
  fields: ({ countryCode }) => {
    const scale = MONEY_SCALE[countryCode];
    return [
      {
        id: "watts",
        labelKey: "field.appliancePower",
        hintKey: "calc.electricity.wattsHint",
        kind: "number",
        min: 1,
        max: 5000,
        step: 10,
        default: 1000,
      },
      {
        id: "hours",
        labelKey: "field.hoursPerDay",
        kind: "number",
        min: 0.5,
        max: 24,
        step: 0.5,
        default: 4,
      },
      {
        id: "price",
        labelKey: "field.pricePerKwh",
        kind: "currency",
        min: 0,
        max: Math.max(scale.monthlyStep * 40, 100),
        step: scale.monthlyStep / 25 || 0.01,
        slider: false,
        default: Math.max(Math.round(scale.defaults.monthly / 1000), 1),
      },
      {
        id: "days",
        labelKey: "field.daysInPeriod",
        kind: "number",
        min: 1,
        max: 365,
        step: 1,
        default: 30,
      },
    ];
  },
  compute: (values) => {
    const result = electricityCost({
      watts: num(values, "watts"),
      hoursPerDay: num(values, "hours"),
      pricePerKwh: num(values, "price"),
      days: Math.max(num(values, "days", 30), 1),
    });

    return {
      primary: {
        labelKey: "result.periodCost",
        value: result.costTotal,
        kind: "currency",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.costPerDay", value: result.costPerDay, kind: "currency", decimals: 2, tone: "returns" },
        { labelKey: "result.kwhPerDay", value: result.kwhPerDay, kind: "number", decimals: 3, tone: "principal" },
        { labelKey: "result.kwhTotal", value: result.kwhTotal, kind: "number", decimals: 2, tone: "principal" },
        { labelKey: "result.costPerYear", value: result.costPerDay * 365, kind: "currency", tone: "neutral" },
      ],
      notes: [{ key: "calc.electricity.note" }],
    };
  },
  explainerKeys: ["calc.electricity.explain.1", "calc.electricity.explain.2"],
  faqKeys: ["calc.electricity.faq.1", "calc.electricity.faq.2"],
};

export const recipeScaleCalculator: CalculatorDef = {
  slug: "recipe-scaler",
  icon: "🍲",
  version: 1,
  category: "everyday",
  titleKey: "calc.recipe.title",
  descKey: "calc.recipe.desc",
  countries: EVERYWHERE,
  countryRelevance: "none",
  relatedCalculators: ["discount", "tip"],
  fields: () => [
    { id: "from", labelKey: "field.recipeServes", kind: "number", min: 1, max: 100, step: 1, default: 4 },
    { id: "to", labelKey: "field.youNeed", kind: "number", min: 1, max: 200, step: 1, default: 6 },
    { id: "amount", labelKey: "field.ingredientAmount", hintKey: "calc.recipe.amountHint", kind: "number", min: 0, max: 10_000, step: 5, slider: false, default: 250 },
  ],
  compute: (values) => {
    const factor = recipeScale(num(values, "from", 1), num(values, "to"));
    const amount = num(values, "amount");

    return {
      primary: {
        labelKey: "result.scaleFactor",
        value: `${factor.toFixed(3)}×`,
        kind: "text",
        emphasis: true,
      },
      rows: [
        { labelKey: "result.scaledAmount", value: amount * factor, kind: "number", decimals: 2, tone: "returns" },
        { labelKey: "result.originalAmount", value: amount, kind: "number", decimals: 2, tone: "neutral" },
      ],
      // Quick reference for the other quantities in the same recipe.
      table: {
        columns: [
          { key: "original", labelKey: "column.original", kind: "number", decimals: 0 },
          { key: "scaled", labelKey: "column.scaled", kind: "number", decimals: 2 },
        ],
        rows: [1, 2, 5, 10, 25, 50, 100, 250, 500].map((step) => ({
          original: step,
          scaled: step * factor,
        })),
      },
      notes: [{ key: "calc.recipe.note" }],
    };
  },
  explainerKeys: ["calc.recipe.explain.1", "calc.recipe.explain.2"],
  faqKeys: ["calc.recipe.faq.1", "calc.recipe.faq.2"],
};

export const BUSINESS_CALCULATORS = [
  profitMarginCalculator,
  markupCalculator,
  breakEvenCalculator,
  roiCalculator,
  roasCalculator,
  growthRateCalculator,
];

export const EVERYDAY_CALCULATORS = [
  discountCalculator,
  fuelCostCalculator,
  electricityCostCalculator,
  recipeScaleCalculator,
];
