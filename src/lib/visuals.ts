/**
 * The visual identity of every piece of content: which icon it shows and
 * which colour family it belongs to.
 *
 * Held as plain data (icon *names*, not components) so it can be read from
 * server and client code alike and tested without a renderer. The component
 * that turns a name into an SVG lives in `components/shared/Icon.tsx`.
 *
 * The rule, taken from the landing-page design: a category owns a colour, and
 * everything inside it shares that colour. A calculator may pick its own icon
 * but never its own colour, so a grid of finance tools reads as one family.
 */

export const TONES = [
  "blue",
  "green",
  "violet",
  "orange",
  "pink",
  "teal",
  "amber",
  "rose",
  "sky",
  "indigo",
] as const;

export type Tone = (typeof TONES)[number];

export const ICON_NAMES = [
  "Activity", "ArrowLeftRight", "Banknote", "BarChart3", "Bike", "BookOpen",
  "Box", "Briefcase", "Building2", "Cake", "Calculator", "Calendar",
  "CalendarDays", "CalendarPlus", "CalendarRange", "Car", "ChartLine",
  "ChefHat", "Clock", "Coins", "Cog", "Columns3", "Cookie", "Database",
  "Dices", "Divide", "Droplets", "FileText", "Flame", "Footprints", "Fuel",
  "Gauge", "Globe", "GraduationCap", "Grid3x3", "Hammer", "HardHat", "Hash",
  "HeartHandshake", "HeartPulse", "Home", "Info", "Landmark", "Lightbulb", "LineChart", "Lock",
  "Mail", "Megaphone", "Paintbrush", "Percent", "PieChart", "PiggyBank",
  "Plug", "Receipt", "Ruler", "Scale", "Scroll", "Shield", "ShieldCheck",
  "Shuffle", "Sigma", "Smartphone", "Sparkles", "Superscript", "Table2", "Tag", "Target",
  "Thermometer", "Timer", "TrendingUp", "Triangle", "Type", "Users",
  "Utensils", "Wallet", "Weight", "Wrench", "Zap",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export type Visual = { icon: IconName; tone: Tone };

/* ------------------------------------------------------------ sections */

export const SECTION_VISUALS: Record<string, Visual> = {
  calculators: { icon: "Calculator", tone: "blue" },
  converters: { icon: "ArrowLeftRight", tone: "teal" },
  tools: { icon: "Wrench", tone: "violet" },
  charts: { icon: "Table2", tone: "orange" },
  guides: { icon: "BookOpen", tone: "green" },
  countries: { icon: "Globe", tone: "sky" },
};

/* ---------------------------------------------------------- categories */

const CATEGORY_VISUALS: Record<string, Record<string, Visual>> = {
  calculators: {
    finance: { icon: "Coins", tone: "blue" },
    health: { icon: "HeartPulse", tone: "green" },
    math: { icon: "Sigma", tone: "violet" },
    education: { icon: "GraduationCap", tone: "orange" },
    business: { icon: "BarChart3", tone: "pink" },
    everyday: { icon: "Sparkles", tone: "teal" },
    construction: { icon: "HardHat", tone: "amber" },
    engineering: { icon: "Cog", tone: "rose" },
  },
  converters: {
    currency: { icon: "Banknote", tone: "green" },
    length: { icon: "Ruler", tone: "teal" },
    weight: { icon: "Weight", tone: "teal" },
    temperature: { icon: "Thermometer", tone: "teal" },
    area: { icon: "Grid3x3", tone: "teal" },
    volume: { icon: "Box", tone: "teal" },
    speed: { icon: "Gauge", tone: "teal" },
    data: { icon: "Database", tone: "teal" },
    time: { icon: "Clock", tone: "teal" },
    energy: { icon: "Zap", tone: "teal" },
    pressure: { icon: "Activity", tone: "teal" },
    power: { icon: "Plug", tone: "teal" },
    angle: { icon: "Triangle", tone: "teal" },
    "fuel-economy": { icon: "Fuel", tone: "teal" },
  },
  tools: {
    "date-time": { icon: "CalendarDays", tone: "pink" },
    "number-math": { icon: "Hash", tone: "violet" },
    utility: { icon: "Dices", tone: "teal" },
    planning: { icon: "Target", tone: "orange" },
  },
  charts: {
    conversion: { icon: "ArrowLeftRight", tone: "teal" },
    math: { icon: "Sigma", tone: "violet" },
    finance: { icon: "LineChart", tone: "blue" },
    everyday: { icon: "ChefHat", tone: "orange" },
  },
  guides: {
    "how-to-calculate": { icon: "Calculator", tone: "blue" },
    "what-is": { icon: "Lightbulb", tone: "amber" },
    formulas: { icon: "Sigma", tone: "violet" },
    practical: { icon: "Target", tone: "green" },
  },
};

/* --------------------------------------------------- individual items */

/** Icons for items whose category icon would be too generic. Colour always comes from the category. */
const ITEM_ICONS: Record<string, IconName> = {
  // finance
  mortgage: "Home",
  loan: "Landmark",
  "auto-loan": "Car",
  "student-loan": "GraduationCap",
  "income-tax": "Receipt",
  salary: "Wallet",
  payroll: "Users",
  vat: "Percent",
  retirement: "PiggyBank",
  pension: "PiggyBank",
  "401k": "PiggyBank",
  superannuation: "PiggyBank",
  sip: "TrendingUp",
  inflation: "TrendingUp",
  "capital-gains": "ChartLine",
  "stamp-duty": "Scroll",
  "property-tax": "Building2",
  "church-tax": "Landmark",
  "social-security": "Shield",
  "social-security-benefit": "Shield",
  "national-insurance": "ShieldCheck",
  cpp: "Shield",
  ei: "ShieldCheck",
  hecs: "GraduationCap",
  "30-percent-ruling": "Percent",
  "severance-pay": "Briefcase",
  // health
  bmi: "Scale",
  bmr: "Flame",
  tdee: "Utensils",
  "body-fat": "Activity",
  "water-intake": "Droplets",
  "running-pace": "Footprints",
  // math
  statistics: "BarChart3",
  ratio: "Divide",
  exponent: "Superscript",
  "quadratic-equation": "Sigma",
  triangle: "Triangle",
  area: "Grid3x3",
  volume: "Box",
  // business
  "profit-margin": "TrendingUp",
  markup: "Tag",
  "break-even": "Scale",
  roi: "ChartLine",
  roas: "Megaphone",
  "growth-rate": "BarChart3",
  // everyday
  tip: "Receipt",
  discount: "Tag",
  "fuel-cost": "Fuel",
  "electricity-cost": "Lightbulb",
  "recipe-scaler": "ChefHat",
  // education
  gpa: "GraduationCap",
  "weighted-grade": "FileText",
  "final-grade": "Target",
  // construction / engineering
  concrete: "Columns3",
  paint: "Paintbrush",
  tile: "Grid3x3",
  "roof-area": "Home",
  "ohms-law": "Zap",
  force: "Weight",
  torque: "Wrench",
  // tools
  "date-difference": "CalendarRange",
  "add-days": "CalendarPlus",
  "working-days": "Briefcase",
  age: "Cake",
  "week-number": "Calendar",
  "day-of-week": "CalendarDays",
  countdown: "Timer",
  percentage: "Percent",
  "number-to-words": "Type",
  "words-to-number": "Hash",
  "roman-numerals": "Landmark",
  "prime-checker": "Hash",
  "fraction-simplifier": "Divide",
  "factor-finder": "Grid3x3",
  "number-formatter": "Type",
  "random-number": "Shuffle",
  "password-generator": "Lock",
  "dice-roller": "Dices",
  "coin-flip": "Coins",
  "random-picker": "Users",
  "savings-goal": "PiggyBank",
  "debt-payoff": "Wallet",
  "budget-planner": "PieChart",
  // legal
  privacy: "Lock",
  terms: "FileText",
  cookies: "Cookie",
  contact: "Mail",
  about: "Info",
};

const FALLBACK: Visual = { icon: "Calculator", tone: "blue" };

export function sectionVisual(section: string): Visual {
  return SECTION_VISUALS[section] ?? FALLBACK;
}

export function categoryVisual(section: string, category: string): Visual {
  return CATEGORY_VISUALS[section]?.[category] ?? sectionVisual(section);
}

/** An item keeps its category's colour and takes its own icon where it has one. */
export function itemVisual(section: string, category: string, slug: string): Visual {
  const base = categoryVisual(section, category);
  return { icon: ITEM_ICONS[slug] ?? base.icon, tone: base.tone };
}

export function legalVisual(slug: string): Visual {
  return { icon: ITEM_ICONS[slug] ?? "FileText", tone: "indigo" };
}
