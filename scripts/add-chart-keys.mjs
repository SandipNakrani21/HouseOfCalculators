/** English copy for the Charts & Tables pillar. */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = "src/lib/i18n/dictionaries/en.json";
const dict = JSON.parse(readFileSync(PATH, "utf8"));

Object.assign(dict, {
  "section.charts.intro":
    "Reference tables you scan rather than type into. Every one is generated from the same data the calculators and converters use, so a table can never quietly disagree with the tool beside it.",

  "category.charts.conversion": "Conversion",
  "category.charts.math": "Math",
  "category.charts.finance": "Finance",
  "category.charts.everyday": "Everyday",

  "category.charts.conversion.intro":
    "Common unit conversions laid out side by side, for when you want the value at a glance rather than one answer at a time.",
  "category.charts.math.intro":
    "Times tables, squares, primes and numeral systems - the references worth having open rather than recalculating.",
  "category.charts.finance.intro":
    "How money grows, how a loan unwinds and what inflation does to it, shown as tables rather than claims.",
  "category.charts.everyday.intro":
    "Sizes and measures that come up away from a desk, from paper to cooking to screens.",

  "charts.category.title": "{category} Tables",
  "charts.category.desc": "Free {category} reference tables.",
  "chart.about": "About this table",
  "chart.useInstead": "Prefer a calculator?",

  /* Shared column labels */
  "chart.col.number": "Number",
  "chart.col.square": "Square",
  "chart.col.cube": "Cube",
  "chart.col.squareRoot": "Square root",
  "chart.col.position": "Position",
  "chart.col.primes": "Primes",
  "chart.col.roman": "Roman",
  "chart.col.prefix": "Prefix",
  "chart.col.symbol": "Symbol",
  "chart.col.power": "Power of ten",
  "chart.col.multiplier": "Multiplier",
  "chart.col.fraction": "Fraction",
  "chart.col.decimal": "Decimal",
  "chart.col.percent": "Percentage",
  "chart.col.years": "Years",
  "chart.col.year": "Year",
  "chart.col.measure": "Measure",
  "chart.col.milliliters": "Millilitres",
  "chart.col.liters": "Litres",
  "chart.col.size": "Size",
  "chart.col.millimeters": "Millimetres",
  "chart.col.inches": "Inches",
  "chart.col.name": "Name",
  "chart.col.resolution": "Resolution",
  "chart.col.aspectRatio": "Aspect ratio",
  "chart.col.megapixels": "Megapixels",

  /* Conversion tables */
  "chart.length.title": "Length Conversion Table",
  "chart.length.desc": "Metres, centimetres, feet, inches and yards side by side.",
  "chart.length.explain":
    "Every value is computed from the exact definitions - an inch is 25.4 mm by definition, not by measurement - so the table agrees with the converter to the last decimal shown.",

  "chart.weight.title": "Weight Conversion Table",
  "chart.weight.desc": "Kilograms, pounds, grams, ounces and stone side by side.",
  "chart.weight.explain":
    "These are units of mass. The pound is defined as exactly 0.45359237 kg, so the metric and imperial columns are exact conversions rather than approximations.",

  "chart.temperature.title": "Temperature Conversion Table",
  "chart.temperature.desc": "Celsius, Fahrenheit and Kelvin at the temperatures people look up.",
  "chart.temperature.explain":
    "Temperature conversions need an offset as well as a scale, which is why the columns do not stay in a fixed ratio the way length or weight do.",

  "chart.area.title": "Area Conversion Table",
  "chart.area.desc": "Square metres, square feet, yards, acres and hectares.",
  "chart.area.explain":
    "Area factors are the square of the length factors, which is why a square foot is about a tenth of a square metre rather than a third.",

  "chart.volume.title": "Volume Conversion Table",
  "chart.volume.desc": "Litres, millilitres, gallons and cups side by side.",
  "chart.volume.explain":
    "US and imperial gallons are different sizes, so both appear here. A recipe or fuel figure means different things depending on which one it used.",

  "chart.speed.title": "Speed Conversion Table",
  "chart.speed.desc": "km/h, mph, m/s and knots at common speeds.",
  "chart.speed.explain":
    "Every entry is a distance over a time, so converting between them is converting the distance and the time separately.",

  "chart.pressure.title": "Pressure Conversion Table",
  "chart.pressure.desc": "Bar, psi, kilopascals and atmospheres side by side.",
  "chart.pressure.explain":
    "Useful for tyre pressures, which are quoted in bar in Europe and psi in the US. These are gauge pressures, measured relative to the surrounding air.",

  /* Math tables */
  "chart.multiplication.title": "Multiplication Table",
  "chart.multiplication.desc": "The full 12 × 12 times table.",
  "chart.multiplication.explain":
    "The classic grid. Read across the row and down the column to find the product; the table is symmetric, so either order gives the same answer.",

  "chart.squares.title": "Squares and Cubes Table",
  "chart.squares.desc": "Squares, cubes and square roots from 1 to 25.",
  "chart.squares.explain":
    "Squares and cubes come up constantly in area and volume work, and the square roots are the ones worth recognising on sight.",

  "chart.primes.title": "Prime Numbers Table",
  "chart.primes.desc": "Every prime number below 500.",
  "chart.primes.explain":
    "Generated with the sieve of Eratosthenes: start at 2 and cross out every multiple, then move to the next number still standing. What is left is prime.",

  "chart.roman.title": "Roman Numeral Chart",
  "chart.roman.desc": "Roman numerals for the numbers that come up most.",
  "chart.roman.explain":
    "Standard subtractive notation, where a smaller numeral before a larger one is subtracted. That is why 9 is IX rather than VIIII.",

  "chart.prefixes.title": "Metric Prefixes Table",
  "chart.prefixes.desc": "SI prefixes from tera down to pico.",
  "chart.prefixes.explain":
    "Each prefix is a fixed power of ten. Data storage is the common exception: there, binary prefixes such as kibi and mebi count in 1024s instead.",

  "chart.percentFraction.title": "Percentage to Fraction Table",
  "chart.percentFraction.desc": "Common fractions as decimals and percentages.",
  "chart.percentFraction.explain":
    "The same quantity written three ways. Recognising that 1/8 is 12.5% makes a lot of mental arithmetic faster.",

  /* Finance tables */
  "chart.compound.title": "Compound Growth Table",
  "chart.compound.desc": "What one unit of money grows to at different rates and terms.",
  "chart.compound.explain":
    "Compounding is multiplicative, so the gap between rates widens with time rather than staying proportional. At 7% money roughly doubles every decade; at 3% it takes more than twice as long.",
  "chart.compound.note":
    "Each figure is what 1 unit of any currency grows to, so multiply by your own starting amount. Annual compounding, no fees or tax.",

  "chart.amortisation.title": "Amortisation Schedule Example",
  "chart.amortisation.desc": "How a loan balance falls year by year.",
  "chart.amortisation.explain":
    "The payment is level, but its split is not: early payments are almost all interest and late ones almost all principal. The crossover is later than most people expect.",
  "chart.amortisation.note":
    "Example: {principal} borrowed at {rate} over {years} years, giving a payment of {payment} a month. Use the mortgage calculator for your own figures.",

  "chart.inflation.title": "Inflation Reference Table",
  "chart.inflation.desc": "What 100 units of today's money will still buy.",
  "chart.inflation.explain":
    "Inflation compounds the same way returns do, just against you. At 3% a year, money loses about a quarter of its purchasing power in a decade.",
  "chart.inflation.note":
    "Each figure is what 100 units of today's money buys after that many years at that rate.",

  /* Everyday tables */
  "chart.cooking.title": "Cooking Measurement Table",
  "chart.cooking.desc": "Teaspoons, tablespoons, cups and millilitres.",
  "chart.cooking.explain":
    "These are US customary measures, which is what most online recipes use. Metric recipes usually give weights instead, because a cup of flour and a cup of sugar do not weigh the same.",
  "chart.cooking.note":
    "US customary measures. An imperial or Australian tablespoon is a different size, so check which one a recipe means.",

  "chart.paper.title": "Paper Sizes Table",
  "chart.paper.desc": "A-series and US paper sizes in millimetres and inches.",
  "chart.paper.explain":
    "A-series sizes all share the same proportions, so folding one in half gives the next size down. US sizes do not, which is why scaling between them always crops or leaves a margin.",
  "chart.paper.note":
    "A-series dimensions are exact; US sizes are given in millimetres converted from their inch definitions.",

  "chart.screens.title": "Screen Resolution Table",
  "chart.screens.desc": "Common resolutions with aspect ratios and megapixels.",
  "chart.screens.explain":
    "Doubling a resolution's width and height quadruples the pixels, which is why 4K is four times the work of 1080p rather than twice.",
});

writeFileSync(PATH, `${JSON.stringify(dict, null, 2)}\n`, "utf8");
console.log(`en: ${Object.keys(dict).length} keys`);
