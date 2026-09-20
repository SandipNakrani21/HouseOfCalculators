import type { ChartCategory, Section } from "@/config/categories";
import { getConverter } from "@/config/converters/definitions";
import { convert, findUnit } from "@/config/converters/units";
import type { Formatter } from "@/lib/format";
import type { TranslateFn } from "@/lib/i18n";
import { compoundFutureValue, amortisationSchedule, emi } from "@/lib/finance";
import { toRoman } from "@/lib/tools/numbers";

/**
 * Reference tables. These are the pages people scan rather than type into, and
 * every one is generated from the same data the calculators use - so a table
 * cannot quietly disagree with the tool it sits next to.
 *
 * Tables render on the server: they need no interaction, so they cost no
 * JavaScript and arrive complete in the HTML.
 */
export type ChartContext = { t: TranslateFn; fmt: Formatter };

export type ChartTable = {
  columns: { key: string; label: string }[];
  rows: Record<string, string>[];
  /** Optional note under the table, already translated. */
  note?: string;
};

export type ChartDefinition = {
  slug: string;
  category: ChartCategory;
  icon: string;
  titleKey: string;
  descKey: string;
  explainerKey: string;
  keywords: string;
  /** Tools this table belongs with, linked in both directions. */
  related: { section: Section; category: string; slug?: string }[];
  build: (ctx: ChartContext) => ChartTable;
};

/* ------------------------------------------------------- Conversion tables */

const CONVERSION_STEPS = [1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 250, 500, 1000];

/** One table per converter, covering its most-used units side by side. */
function conversionTable(converterSlug: string, unitIds: string[]) {
  return ({ t, fmt }: ChartContext): ChartTable => {
    const converter = getConverter(converterSlug)!;
    const units = unitIds
      .map((id) => findUnit(converter, id))
      .filter((unit): unit is NonNullable<typeof unit> => Boolean(unit));

    const [base, ...rest] = units;

    return {
      columns: units.map((unit) => ({
        key: unit.id,
        label: `${t(unit.labelKey)} (${unit.symbol})`,
      })),
      rows: CONVERSION_STEPS.map((step) => {
        const row: Record<string, string> = {
          [base.id]: fmt.number(step),
        };
        for (const unit of rest) {
          const value = convert(converter, step, base.id, unit.id);
          row[unit.id] = fmt.number(value, {
            decimals: value >= 1000 ? 0 : value >= 1 ? 2 : 4,
          });
        }
        return row;
      }),
    };
  };
}

const CONVERSION_TABLES: ChartDefinition[] = [
  {
    slug: "length-conversion-table",
    category: "conversion",
    icon: "📏",
    titleKey: "chart.length.title",
    descKey: "chart.length.desc",
    explainerKey: "chart.length.explain",
    keywords: "meters feet inches centimeters conversion chart",
    related: [{ section: "converters", category: "length" }],
    build: conversionTable("length", ["meter", "centimeter", "foot", "inch", "yard"]),
  },
  {
    slug: "weight-conversion-table",
    category: "conversion",
    icon: "⚖️",
    titleKey: "chart.weight.title",
    descKey: "chart.weight.desc",
    explainerKey: "chart.weight.explain",
    keywords: "kilograms pounds grams ounces conversion chart",
    related: [{ section: "converters", category: "weight" }],
    build: conversionTable("weight", ["kilogram", "pound", "gram", "ounce", "stone"]),
  },
  {
    slug: "temperature-conversion-table",
    category: "conversion",
    icon: "🌡️",
    titleKey: "chart.temperature.title",
    descKey: "chart.temperature.desc",
    explainerKey: "chart.temperature.explain",
    keywords: "celsius fahrenheit kelvin conversion chart",
    related: [{ section: "converters", category: "temperature" }],
    build: ({ t, fmt }) => {
      const converter = getConverter("temperature")!;
      const units = ["celsius", "fahrenheit", "kelvin"].map(
        (id) => findUnit(converter, id)!,
      );
      // A linear ramp through the temperatures people actually look up.
      const degrees = [-40, -20, -10, 0, 10, 20, 25, 30, 37, 40, 50, 75, 100];

      return {
        columns: units.map((unit) => ({
          key: unit.id,
          label: `${t(unit.labelKey)} (${unit.symbol})`,
        })),
        rows: degrees.map((celsius) => ({
          celsius: fmt.number(celsius, { decimals: 0 }),
          fahrenheit: fmt.number(convert(converter, celsius, "celsius", "fahrenheit"), { decimals: 1 }),
          kelvin: fmt.number(convert(converter, celsius, "celsius", "kelvin"), { decimals: 2 }),
        })),
      };
    },
  },
  {
    slug: "area-conversion-table",
    category: "conversion",
    icon: "🔲",
    titleKey: "chart.area.title",
    descKey: "chart.area.desc",
    explainerKey: "chart.area.explain",
    keywords: "square meters feet acres hectares conversion chart",
    related: [{ section: "converters", category: "area" }],
    build: conversionTable("area", ["square-meter", "square-foot", "square-yard", "acre", "hectare"]),
  },
  {
    slug: "volume-conversion-table",
    category: "conversion",
    icon: "🧪",
    titleKey: "chart.volume.title",
    descKey: "chart.volume.desc",
    explainerKey: "chart.volume.explain",
    keywords: "liters gallons milliliters cups conversion chart",
    related: [{ section: "converters", category: "volume" }],
    build: conversionTable("volume", ["liter", "milliliter", "us-gallon", "imperial-gallon", "us-cup"]),
  },
  {
    slug: "speed-conversion-table",
    category: "conversion",
    icon: "🚀",
    titleKey: "chart.speed.title",
    descKey: "chart.speed.desc",
    explainerKey: "chart.speed.explain",
    keywords: "kmh mph knots conversion chart",
    related: [{ section: "converters", category: "speed" }],
    build: conversionTable("speed", ["kilometer-per-hour", "mile-per-hour", "meter-per-second", "knot"]),
  },
  {
    slug: "pressure-conversion-table",
    category: "conversion",
    icon: "🎈",
    titleKey: "chart.pressure.title",
    descKey: "chart.pressure.desc",
    explainerKey: "chart.pressure.explain",
    keywords: "bar psi kpa tyre pressure chart",
    related: [{ section: "converters", category: "pressure" }],
    build: conversionTable("pressure", ["bar", "psi", "kilopascal", "atmosphere"]),
  },
];

/* ------------------------------------------------------------- Math tables */

const MATH_TABLES: ChartDefinition[] = [
  {
    slug: "multiplication-table",
    category: "math",
    icon: "✖️",
    titleKey: "chart.multiplication.title",
    descKey: "chart.multiplication.desc",
    explainerKey: "chart.multiplication.explain",
    keywords: "times table multiplication grid 12x12",
    related: [{ section: "tools", category: "number-math", slug: "percentage" }],
    build: ({ fmt }) => {
      const size = 12;
      const range = Array.from({ length: size }, (_, i) => i + 1);
      return {
        columns: [
          { key: "n", label: "×" },
          ...range.map((n) => ({ key: `c${n}`, label: String(n) })),
        ],
        rows: range.map((row) => ({
          n: String(row),
          ...Object.fromEntries(
            range.map((col) => [`c${col}`, fmt.number(row * col)]),
          ),
        })),
      };
    },
  },
  {
    slug: "squares-and-cubes",
    category: "math",
    icon: "🔢",
    titleKey: "chart.squares.title",
    descKey: "chart.squares.desc",
    explainerKey: "chart.squares.explain",
    keywords: "squares cubes square root cube root table",
    related: [{ section: "tools", category: "number-math", slug: "prime-checker" }],
    build: ({ t, fmt }) => ({
      columns: [
        { key: "n", label: t("chart.col.number") },
        { key: "square", label: t("chart.col.square") },
        { key: "cube", label: t("chart.col.cube") },
        { key: "root", label: t("chart.col.squareRoot") },
      ],
      rows: Array.from({ length: 25 }, (_, i) => i + 1).map((n) => ({
        n: String(n),
        square: fmt.number(n * n),
        cube: fmt.number(n * n * n),
        root: fmt.number(Math.sqrt(n), { decimals: 4 }),
      })),
    }),
  },
  {
    slug: "prime-numbers",
    category: "math",
    icon: "🧮",
    titleKey: "chart.primes.title",
    descKey: "chart.primes.desc",
    explainerKey: "chart.primes.explain",
    keywords: "prime numbers list first 100 primes",
    related: [{ section: "tools", category: "number-math", slug: "prime-checker" }],
    build: ({ t }) => {
      // Sieve of Eratosthenes up to 500, which covers the first 95 primes.
      const limit = 500;
      const sieve = new Array<boolean>(limit + 1).fill(true);
      sieve[0] = sieve[1] = false;
      for (let n = 2; n * n <= limit; n += 1) {
        if (!sieve[n]) continue;
        for (let multiple = n * n; multiple <= limit; multiple += n) {
          sieve[multiple] = false;
        }
      }
      const primes = sieve.flatMap((isPrime, n) => (isPrime ? [n] : []));

      const perRow = 10;
      const rows: Record<string, string>[] = [];
      for (let i = 0; i < primes.length; i += perRow) {
        const slice = primes.slice(i, i + perRow);
        rows.push({
          range: `${i + 1}–${i + slice.length}`,
          values: slice.join(", "),
        });
      }
      return {
        columns: [
          { key: "range", label: t("chart.col.position") },
          { key: "values", label: t("chart.col.primes") },
        ],
        rows,
      };
    },
  },
  {
    slug: "roman-numeral-chart",
    category: "math",
    icon: "🏛️",
    titleKey: "chart.roman.title",
    descKey: "chart.roman.desc",
    explainerKey: "chart.roman.explain",
    keywords: "roman numerals chart 1 to 100 years",
    related: [{ section: "tools", category: "number-math", slug: "roman-numerals" }],
    build: ({ t }) => {
      const values = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
        400, 500, 900, 1000, 1500, 1900, 1990, 2000, 2025,
      ];
      return {
        columns: [
          { key: "n", label: t("chart.col.number") },
          { key: "roman", label: t("chart.col.roman") },
        ],
        rows: values.map((n) => ({ n: String(n), roman: toRoman(n) })),
      };
    },
  },
  {
    slug: "metric-prefixes",
    category: "math",
    icon: "🔬",
    titleKey: "chart.prefixes.title",
    descKey: "chart.prefixes.desc",
    explainerKey: "chart.prefixes.explain",
    keywords: "si prefixes kilo mega giga milli micro nano",
    related: [{ section: "converters", category: "length" }],
    build: ({ t }) => {
      const prefixes: [string, string, number][] = [
        ["Tera", "T", 12], ["Giga", "G", 9], ["Mega", "M", 6], ["Kilo", "k", 3],
        ["Hecto", "h", 2], ["Deca", "da", 1], ["—", "", 0], ["Deci", "d", -1],
        ["Centi", "c", -2], ["Milli", "m", -3], ["Micro", "µ", -6],
        ["Nano", "n", -9], ["Pico", "p", -12],
      ];
      return {
        columns: [
          { key: "name", label: t("chart.col.prefix") },
          { key: "symbol", label: t("chart.col.symbol") },
          { key: "power", label: t("chart.col.power") },
          { key: "value", label: t("chart.col.multiplier") },
        ],
        rows: prefixes.map(([name, symbol, power]) => ({
          name,
          symbol: symbol || "—",
          power: `10${superscript(power)}`,
          value: power >= 0
            ? `1${"0".repeat(power)}`
            : `0.${"0".repeat(-power - 1)}1`,
        })),
      };
    },
  },
  {
    slug: "percentage-fraction-table",
    category: "math",
    icon: "％",
    titleKey: "chart.percentFraction.title",
    descKey: "chart.percentFraction.desc",
    explainerKey: "chart.percentFraction.explain",
    keywords: "percentage fraction decimal equivalents table",
    related: [{ section: "tools", category: "number-math", slug: "fraction-simplifier" }],
    build: ({ t, fmt }) => {
      const entries: [number, number][] = [
        [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5],
        [1, 6], [1, 8], [3, 8], [5, 8], [7, 8], [1, 10], [1, 16], [1, 20], [1, 100],
      ];
      return {
        columns: [
          { key: "fraction", label: t("chart.col.fraction") },
          { key: "decimal", label: t("chart.col.decimal") },
          { key: "percent", label: t("chart.col.percent") },
        ],
        rows: entries.map(([numerator, denominator]) => ({
          fraction: `${numerator}/${denominator}`,
          decimal: fmt.number(numerator / denominator, { decimals: 4 }),
          percent: fmt.percent((numerator / denominator) * 100, { decimals: 2 }),
        })),
      };
    },
  },
];

/* ---------------------------------------------------------- Finance tables */

const FINANCE_TABLES: ChartDefinition[] = [
  {
    slug: "compound-growth-table",
    category: "finance",
    icon: "📈",
    titleKey: "chart.compound.title",
    descKey: "chart.compound.desc",
    explainerKey: "chart.compound.explain",
    keywords: "compound interest growth table doubling",
    related: [{ section: "calculators", category: "finance", slug: "retirement" }],
    build: ({ t, fmt }) => {
      const rates = [3, 5, 7, 10];
      const years = [1, 2, 5, 10, 15, 20, 25, 30, 40];
      return {
        columns: [
          { key: "years", label: t("chart.col.years") },
          ...rates.map((rate) => ({ key: `r${rate}`, label: `${rate}%` })),
        ],
        rows: years.map((year) => ({
          years: String(year),
          ...Object.fromEntries(
            rates.map((rate) => [
              `r${rate}`,
              // What one unit of currency grows to, so the table works in any.
              fmt.number(compoundFutureValue(1, rate, year, 1), { decimals: 2 }),
            ]),
          ),
        })),
        note: t("chart.compound.note"),
      };
    },
  },
  {
    slug: "amortisation-example",
    category: "finance",
    icon: "🏦",
    titleKey: "chart.amortisation.title",
    descKey: "chart.amortisation.desc",
    explainerKey: "chart.amortisation.explain",
    keywords: "amortization schedule example loan repayment table",
    related: [{ section: "calculators", category: "finance", slug: "mortgage" }],
    build: ({ t, fmt }) => {
      // A round example so the arithmetic is easy to follow by hand.
      const principal = 100_000;
      const rate = 5;
      const months = 240;
      const schedule = amortisationSchedule(principal, rate, months);

      return {
        columns: [
          { key: "year", label: t("chart.col.year") },
          { key: "principal", label: t("table.principalPaid") },
          { key: "interest", label: t("table.interestPaid") },
          { key: "balance", label: t("table.balance") },
        ],
        rows: schedule.map((entry) => ({
          year: String(entry.year),
          principal: fmt.number(entry.principalPaid, { decimals: 0 }),
          interest: fmt.number(entry.interestPaid, { decimals: 0 }),
          balance: fmt.number(entry.balance, { decimals: 0 }),
        })),
        note: t("chart.amortisation.note", {
          principal: fmt.number(principal),
          rate: `${rate}%`,
          years: months / 12,
          payment: fmt.number(emi(principal, rate, months), { decimals: 2 }),
        }),
      };
    },
  },
  {
    slug: "inflation-reference",
    category: "finance",
    icon: "📉",
    titleKey: "chart.inflation.title",
    descKey: "chart.inflation.desc",
    explainerKey: "chart.inflation.explain",
    keywords: "inflation purchasing power table erosion",
    related: [{ section: "calculators", category: "finance", slug: "inflation" }],
    build: ({ t, fmt }) => {
      const rates = [2, 3, 5, 8];
      const years = [1, 5, 10, 15, 20, 25, 30];
      return {
        columns: [
          { key: "years", label: t("chart.col.years") },
          ...rates.map((rate) => ({ key: `r${rate}`, label: `${rate}%` })),
        ],
        rows: years.map((year) => ({
          years: String(year),
          ...Object.fromEntries(
            rates.map((rate) => [
              `r${rate}`,
              // What 100 units of today's money will still buy.
              fmt.number(100 / Math.pow(1 + rate / 100, year), { decimals: 2 }),
            ]),
          ),
        })),
        note: t("chart.inflation.note"),
      };
    },
  },
];

/* --------------------------------------------------------- Everyday tables */

const EVERYDAY_TABLES: ChartDefinition[] = [
  {
    slug: "cooking-measurements",
    category: "everyday",
    icon: "🥄",
    titleKey: "chart.cooking.title",
    descKey: "chart.cooking.desc",
    explainerKey: "chart.cooking.explain",
    keywords: "cups tablespoons milliliters cooking conversion",
    related: [{ section: "converters", category: "volume" }],
    build: ({ t, fmt }) => {
      const entries: [string, number][] = [
        ["1 tsp", 4.92892],
        ["1 tbsp", 14.7868],
        ["1 fl oz", 29.5735],
        ["1/4 cup", 59.1471],
        ["1/3 cup", 78.8628],
        ["1/2 cup", 118.294],
        ["1 cup", 236.588],
        ["1 pint", 473.176],
        ["1 quart", 946.353],
        ["1 gallon", 3785.41],
      ];
      return {
        columns: [
          { key: "measure", label: t("chart.col.measure") },
          { key: "ml", label: t("chart.col.milliliters") },
          { key: "l", label: t("chart.col.liters") },
        ],
        rows: entries.map(([measure, ml]) => ({
          measure,
          ml: fmt.number(ml, { decimals: 2 }),
          l: fmt.number(ml / 1000, { decimals: 4 }),
        })),
        note: t("chart.cooking.note"),
      };
    },
  },
  {
    slug: "paper-sizes",
    category: "everyday",
    icon: "📄",
    titleKey: "chart.paper.title",
    descKey: "chart.paper.desc",
    explainerKey: "chart.paper.explain",
    keywords: "a4 a3 letter paper sizes mm inches",
    related: [{ section: "converters", category: "length" }],
    build: ({ t, fmt }) => {
      const sizes: [string, number, number][] = [
        ["A0", 841, 1189], ["A1", 594, 841], ["A2", 420, 594], ["A3", 297, 420],
        ["A4", 210, 297], ["A5", 148, 210], ["A6", 105, 148],
        ["Letter", 215.9, 279.4], ["Legal", 215.9, 355.6], ["Tabloid", 279.4, 431.8],
      ];
      return {
        columns: [
          { key: "name", label: t("chart.col.size") },
          { key: "mm", label: t("chart.col.millimeters") },
          { key: "inches", label: t("chart.col.inches") },
        ],
        rows: sizes.map(([name, width, height]) => ({
          name,
          mm: `${fmt.number(width, { decimals: 1 })} × ${fmt.number(height, { decimals: 1 })}`,
          inches: `${fmt.number(width / 25.4, { decimals: 2 })} × ${fmt.number(height / 25.4, { decimals: 2 })}`,
        })),
        note: t("chart.paper.note"),
      };
    },
  },
  {
    slug: "screen-resolutions",
    category: "everyday",
    icon: "🖥️",
    titleKey: "chart.screens.title",
    descKey: "chart.screens.desc",
    explainerKey: "chart.screens.explain",
    keywords: "1080p 4k resolution aspect ratio megapixels",
    related: [{ section: "converters", category: "data" }],
    build: ({ t, fmt }) => {
      const screens: [string, number, number][] = [
        ["HD", 1280, 720], ["Full HD", 1920, 1080], ["QHD", 2560, 1440],
        ["4K UHD", 3840, 2160], ["5K", 5120, 2880], ["8K UHD", 7680, 4320],
        ["WXGA", 1366, 768], ["WUXGA", 1920, 1200],
      ];
      const ratio = (w: number, h: number) => {
        const divide = (a: number, b: number): number => (b ? divide(b, a % b) : a);
        const d = divide(w, h);
        return `${w / d}:${h / d}`;
      };
      return {
        columns: [
          { key: "name", label: t("chart.col.name") },
          { key: "pixels", label: t("chart.col.resolution") },
          { key: "ratio", label: t("chart.col.aspectRatio") },
          { key: "mp", label: t("chart.col.megapixels") },
        ],
        rows: screens.map(([name, width, height]) => ({
          name,
          pixels: `${fmt.number(width)} × ${fmt.number(height)}`,
          ratio: ratio(width, height),
          mp: fmt.number((width * height) / 1_000_000, { decimals: 1 }),
        })),
      };
    },
  },
];

function superscript(power: number): string {
  const digits: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻",
  };
  return String(power)
    .split("")
    .map((character) => digits[character] ?? character)
    .join("");
}

export const CHARTS: ChartDefinition[] = [
  ...CONVERSION_TABLES,
  ...MATH_TABLES,
  ...FINANCE_TABLES,
  ...EVERYDAY_TABLES,
];

export function getChart(slug: string): ChartDefinition | undefined {
  return CHARTS.find((chart) => chart.slug === slug);
}

export function chartsIn(category: ChartCategory): ChartDefinition[] {
  return CHARTS.filter((chart) => chart.category === category);
}

/** Tables that reference a given converter category, for cross-linking. */
export function chartsForConverter(category: string): ChartDefinition[] {
  return CHARTS.filter((chart) =>
    chart.related.some(
      (link) => link.section === "converters" && link.category === category,
    ),
  );
}

