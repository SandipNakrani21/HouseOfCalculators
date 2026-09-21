import type { GuideCategory, Section } from "@/config/categories";

/**
 * Guides are structured explanations tied to a tool, not blog posts.
 *
 * A formula guide follows one shape: the formula, what each symbol means, the
 * steps, a worked example with real numbers, the calculator, related tools and
 * the questions people actually ask. The shape is enforced by the type so a
 * guide cannot ship as an untethered essay.
 */
export type GuideLink = { section: Section; category: string; slug?: string };

export type GuideDefinition = {
  slug: string;
  category: GuideCategory;
  icon: string;
  titleKey: string;
  descKey: string;
  keywords: string;
  /** Intro paragraphs, before any formula. */
  introKeys: string[];
  formula?: {
    /** Written as plain text so it reads the same everywhere. */
    expression: string;
    /** Symbol plus the dictionary key describing it. */
    variables: { symbol: string; key: string }[];
  };
  /** Numbered steps, in order. */
  stepKeys?: string[];
  /** A worked example: each row is a label key and a literal value. */
  workedExample?: {
    introKey: string;
    rows: { key: string; value: string }[];
    resultKey: string;
    resultValue: string;
  };
  /** Paragraphs after the example: caveats, common mistakes. */
  notesKeys?: string[];
  faqKeys: string[];
  related: GuideLink[];
  /**
   * When the content was last reviewed. Used honestly: it is a review date,
   * not a freshness badge to bump for its own sake.
   */
  reviewed: string;
};

export const GUIDES: GuideDefinition[] = [
  {
    slug: "how-to-calculate-loan-payment",
    category: "how-to-calculate",
    icon: "🏦",
    titleKey: "guide.loan-payment.title",
    descKey: "guide.loan-payment.desc",
    keywords: "emi monthly payment loan formula amortisation",
    introKeys: ["guide.loan-payment.intro.1", "guide.loan-payment.intro.2"],
    formula: {
      expression: "P = A × i × (1 + i)ⁿ ÷ ((1 + i)ⁿ − 1)",
      variables: [
        { symbol: "P", key: "guide.loan-payment.var.payment" },
        { symbol: "A", key: "guide.loan-payment.var.amount" },
        { symbol: "i", key: "guide.loan-payment.var.rate" },
        { symbol: "n", key: "guide.loan-payment.var.periods" },
      ],
    },
    stepKeys: [
      "guide.loan-payment.step.1",
      "guide.loan-payment.step.2",
      "guide.loan-payment.step.3",
      "guide.loan-payment.step.4",
    ],
    workedExample: {
      introKey: "guide.loan-payment.example.intro",
      rows: [
        { key: "guide.loan-payment.example.amount", value: "200,000" },
        { key: "guide.loan-payment.example.rate", value: "6% ÷ 12 = 0.005" },
        { key: "guide.loan-payment.example.periods", value: "25 × 12 = 300" },
        { key: "guide.loan-payment.example.growth", value: "1.005³⁰⁰ ≈ 4.4650" },
      ],
      resultKey: "guide.loan-payment.example.result",
      resultValue: "1,288.60",
    },
    notesKeys: ["guide.loan-payment.note.1", "guide.loan-payment.note.2"],
    faqKeys: ["guide.loan-payment.faq.1", "guide.loan-payment.faq.2"],
    related: [
      { section: "calculators", category: "finance", slug: "mortgage" },
      { section: "calculators", category: "finance", slug: "loan" },
      { section: "charts", category: "finance", slug: "amortisation-example" },
    ],
    reviewed: "2026-09-21",
  },
  {
    slug: "how-to-calculate-compound-interest",
    category: "how-to-calculate",
    icon: "📈",
    titleKey: "guide.compound.title",
    descKey: "guide.compound.desc",
    keywords: "compound interest formula growth annual monthly",
    introKeys: ["guide.compound.intro.1", "guide.compound.intro.2"],
    formula: {
      expression: "A = P × (1 + r ÷ n)^(n × t)",
      variables: [
        { symbol: "A", key: "guide.compound.var.final" },
        { symbol: "P", key: "guide.compound.var.principal" },
        { symbol: "r", key: "guide.compound.var.rate" },
        { symbol: "n", key: "guide.compound.var.frequency" },
        { symbol: "t", key: "guide.compound.var.years" },
      ],
    },
    stepKeys: [
      "guide.compound.step.1",
      "guide.compound.step.2",
      "guide.compound.step.3",
    ],
    workedExample: {
      introKey: "guide.compound.example.intro",
      rows: [
        { key: "guide.compound.example.principal", value: "10,000" },
        { key: "guide.compound.example.rate", value: "0.06" },
        { key: "guide.compound.example.frequency", value: "12" },
        { key: "guide.compound.example.years", value: "10" },
      ],
      resultKey: "guide.compound.example.result",
      resultValue: "18,193.97",
    },
    notesKeys: ["guide.compound.note.1"],
    faqKeys: ["guide.compound.faq.1", "guide.compound.faq.2"],
    related: [
      { section: "calculators", category: "finance", slug: "retirement" },
      { section: "charts", category: "finance", slug: "compound-growth-table" },
      { section: "tools", category: "planning", slug: "savings-goal" },
    ],
    reviewed: "2026-09-21",
  },
  {
    slug: "how-to-calculate-percentage",
    category: "how-to-calculate",
    icon: "％",
    titleKey: "guide.percentage.title",
    descKey: "guide.percentage.desc",
    keywords: "percentage of change increase decrease formula",
    introKeys: ["guide.percentage.intro.1", "guide.percentage.intro.2"],
    formula: {
      expression: "change % = (new − old) ÷ old × 100",
      variables: [
        { symbol: "old", key: "guide.percentage.var.old" },
        { symbol: "new", key: "guide.percentage.var.new" },
      ],
    },
    stepKeys: [
      "guide.percentage.step.1",
      "guide.percentage.step.2",
      "guide.percentage.step.3",
    ],
    workedExample: {
      introKey: "guide.percentage.example.intro",
      rows: [
        { key: "guide.percentage.example.old", value: "80" },
        { key: "guide.percentage.example.new", value: "100" },
        { key: "guide.percentage.example.difference", value: "20" },
      ],
      resultKey: "guide.percentage.example.result",
      resultValue: "25%",
    },
    notesKeys: ["guide.percentage.note.1"],
    faqKeys: ["guide.percentage.faq.1", "guide.percentage.faq.2"],
    related: [
      { section: "tools", category: "number-math", slug: "percentage" },
      { section: "charts", category: "math", slug: "percentage-fraction-table" },
    ],
    reviewed: "2026-09-21",
  },
  {
    slug: "how-to-calculate-vat",
    category: "how-to-calculate",
    icon: "🧮",
    titleKey: "guide.vat.title",
    descKey: "guide.vat.desc",
    keywords: "vat gst sales tax add remove reverse calculate",
    introKeys: ["guide.vat.intro.1", "guide.vat.intro.2"],
    formula: {
      expression: "net = gross ÷ (1 + rate)   ·   gross = net × (1 + rate)",
      variables: [
        { symbol: "net", key: "guide.vat.var.net" },
        { symbol: "gross", key: "guide.vat.var.gross" },
        { symbol: "rate", key: "guide.vat.var.rate" },
      ],
    },
    stepKeys: ["guide.vat.step.1", "guide.vat.step.2"],
    workedExample: {
      introKey: "guide.vat.example.intro",
      rows: [
        { key: "guide.vat.example.gross", value: "120.00" },
        { key: "guide.vat.example.rate", value: "20% → 1.20" },
        { key: "guide.vat.example.net", value: "120 ÷ 1.20 = 100.00" },
      ],
      resultKey: "guide.vat.example.result",
      resultValue: "20.00",
    },
    notesKeys: ["guide.vat.note.1"],
    faqKeys: ["guide.vat.faq.1", "guide.vat.faq.2"],
    related: [
      { section: "countries", category: "gb", slug: "vat" },
      { section: "countries", category: "in", slug: "vat" },
    ],
    reviewed: "2026-09-21",
  },

  /* What is */
  {
    slug: "what-is-compound-interest",
    category: "what-is",
    icon: "💡",
    titleKey: "guide.what-compound.title",
    descKey: "guide.what-compound.desc",
    keywords: "what is compound interest meaning explained simple",
    introKeys: [
      "guide.what-compound.intro.1",
      "guide.what-compound.intro.2",
      "guide.what-compound.intro.3",
    ],
    notesKeys: ["guide.what-compound.note.1", "guide.what-compound.note.2"],
    faqKeys: ["guide.what-compound.faq.1", "guide.what-compound.faq.2"],
    related: [
      { section: "guides", category: "how-to-calculate", slug: "how-to-calculate-compound-interest" },
      { section: "charts", category: "finance", slug: "compound-growth-table" },
    ],
    reviewed: "2026-09-21",
  },
  {
    slug: "what-is-amortisation",
    category: "what-is",
    icon: "📉",
    titleKey: "guide.what-amortisation.title",
    descKey: "guide.what-amortisation.desc",
    keywords: "what is amortisation schedule loan explained",
    introKeys: [
      "guide.what-amortisation.intro.1",
      "guide.what-amortisation.intro.2",
      "guide.what-amortisation.intro.3",
    ],
    notesKeys: ["guide.what-amortisation.note.1"],
    faqKeys: ["guide.what-amortisation.faq.1", "guide.what-amortisation.faq.2"],
    related: [
      { section: "charts", category: "finance", slug: "amortisation-example" },
      { section: "calculators", category: "finance", slug: "mortgage" },
    ],
    reviewed: "2026-09-21",
  },
  {
    slug: "what-is-inflation",
    category: "what-is",
    icon: "🎈",
    titleKey: "guide.what-inflation.title",
    descKey: "guide.what-inflation.desc",
    keywords: "what is inflation purchasing power explained",
    introKeys: [
      "guide.what-inflation.intro.1",
      "guide.what-inflation.intro.2",
      "guide.what-inflation.intro.3",
    ],
    notesKeys: ["guide.what-inflation.note.1"],
    faqKeys: ["guide.what-inflation.faq.1", "guide.what-inflation.faq.2"],
    related: [
      { section: "calculators", category: "finance", slug: "inflation" },
      { section: "charts", category: "finance", slug: "inflation-reference" },
    ],
    reviewed: "2026-09-21",
  },
  {
    slug: "what-is-a-marginal-tax-rate",
    category: "what-is",
    icon: "🧾",
    titleKey: "guide.what-marginal.title",
    descKey: "guide.what-marginal.desc",
    keywords: "marginal effective tax rate bracket explained",
    introKeys: [
      "guide.what-marginal.intro.1",
      "guide.what-marginal.intro.2",
      "guide.what-marginal.intro.3",
    ],
    notesKeys: ["guide.what-marginal.note.1"],
    faqKeys: ["guide.what-marginal.faq.1", "guide.what-marginal.faq.2"],
    related: [
      { section: "countries", category: "us", slug: "income-tax" },
      { section: "countries", category: "gb", slug: "income-tax" },
    ],
    reviewed: "2026-09-21",
  },

  /* Practical */
  {
    slug: "how-to-compare-loan-offers",
    category: "practical",
    icon: "⚖️",
    titleKey: "guide.compare-loans.title",
    descKey: "guide.compare-loans.desc",
    keywords: "compare loans apr total cost term",
    introKeys: ["guide.compare-loans.intro.1", "guide.compare-loans.intro.2"],
    stepKeys: [
      "guide.compare-loans.step.1",
      "guide.compare-loans.step.2",
      "guide.compare-loans.step.3",
      "guide.compare-loans.step.4",
    ],
    notesKeys: ["guide.compare-loans.note.1"],
    faqKeys: ["guide.compare-loans.faq.1"],
    related: [
      { section: "calculators", category: "finance", slug: "loan" },
      { section: "calculators", category: "finance", slug: "mortgage" },
    ],
    reviewed: "2026-09-21",
  },
  {
    slug: "how-to-read-an-amortisation-schedule",
    category: "practical",
    icon: "📊",
    titleKey: "guide.read-schedule.title",
    descKey: "guide.read-schedule.desc",
    keywords: "read amortisation schedule columns balance interest",
    introKeys: ["guide.read-schedule.intro.1", "guide.read-schedule.intro.2"],
    stepKeys: [
      "guide.read-schedule.step.1",
      "guide.read-schedule.step.2",
      "guide.read-schedule.step.3",
    ],
    notesKeys: ["guide.read-schedule.note.1"],
    faqKeys: ["guide.read-schedule.faq.1"],
    related: [
      { section: "charts", category: "finance", slug: "amortisation-example" },
      { section: "guides", category: "what-is", slug: "what-is-amortisation" },
    ],
    reviewed: "2026-09-21",
  },
  {
    slug: "how-to-plan-monthly-savings",
    category: "practical",
    icon: "🎯",
    titleKey: "guide.plan-savings.title",
    descKey: "guide.plan-savings.desc",
    keywords: "savings plan monthly target emergency fund",
    introKeys: ["guide.plan-savings.intro.1", "guide.plan-savings.intro.2"],
    stepKeys: [
      "guide.plan-savings.step.1",
      "guide.plan-savings.step.2",
      "guide.plan-savings.step.3",
    ],
    notesKeys: ["guide.plan-savings.note.1"],
    faqKeys: ["guide.plan-savings.faq.1"],
    related: [
      { section: "tools", category: "planning", slug: "savings-goal" },
      { section: "calculators", category: "finance", slug: "retirement" },
    ],
    reviewed: "2026-09-21",
  },

  /* Formulas */
  {
    slug: "future-value-formula",
    category: "formulas",
    icon: "🧮",
    titleKey: "guide.fv.title",
    descKey: "guide.fv.desc",
    keywords: "future value formula annuity sip monthly contributions",
    introKeys: ["guide.fv.intro.1"],
    formula: {
      expression: "FV = C × ((1 + i)ⁿ − 1) ÷ i × (1 + i)",
      variables: [
        { symbol: "FV", key: "guide.fv.var.fv" },
        { symbol: "C", key: "guide.fv.var.contribution" },
        { symbol: "i", key: "guide.fv.var.rate" },
        { symbol: "n", key: "guide.fv.var.periods" },
      ],
    },
    stepKeys: ["guide.fv.step.1", "guide.fv.step.2", "guide.fv.step.3"],
    workedExample: {
      introKey: "guide.fv.example.intro",
      rows: [
        { key: "guide.fv.example.contribution", value: "500" },
        { key: "guide.fv.example.rate", value: "7% ÷ 12 ≈ 0.005833" },
        { key: "guide.fv.example.periods", value: "20 × 12 = 240" },
      ],
      resultKey: "guide.fv.example.result",
      resultValue: "261,983",
    },
    notesKeys: ["guide.fv.note.1"],
    faqKeys: ["guide.fv.faq.1"],
    related: [
      { section: "calculators", category: "finance", slug: "sip" },
      { section: "calculators", category: "finance", slug: "retirement" },
    ],
    reviewed: "2026-09-21",
  },
];

export function getGuide(slug: string): GuideDefinition | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

export function guidesIn(category: GuideCategory): GuideDefinition[] {
  return GUIDES.filter((guide) => guide.category === category);
}

/** Guides that point at a given tool, for the reverse link on its page. */
export function guidesFor(section: Section, slug: string): GuideDefinition[] {
  return GUIDES.filter((guide) =>
    guide.related.some((link) => link.section === section && link.slug === slug),
  );
}
