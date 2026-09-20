import type { ConverterDefinition } from "./units";

/**
 * Unit converters. Factors are exact where the definition is exact (an inch is
 * defined as 25.4 mm, a pound as 0.45359237 kg); only the genuinely
 * approximate ones are rounded.
 */

const length: ConverterDefinition = {
  id: "length",
  category: "length",
  slug: "length",
  titleKey: "conv.length.title",
  descKey: "conv.length.desc",
  icon: "📏",
  baseUnit: "meter",
  explainerKey: "conv.length.explain",
  units: [
    { id: "millimeter", labelKey: "unit.length.millimeter", symbol: "mm", urlName: "millimeters", factor: 0.001 },
    { id: "centimeter", labelKey: "unit.length.centimeter", symbol: "cm", urlName: "centimeters", factor: 0.01 },
    { id: "meter", labelKey: "unit.length.meter", symbol: "m", urlName: "meters", factor: 1 },
    { id: "kilometer", labelKey: "unit.length.kilometer", symbol: "km", urlName: "kilometers", factor: 1000 },
    { id: "inch", labelKey: "unit.length.inch", symbol: "in", urlName: "inches", factor: 0.0254 },
    { id: "foot", labelKey: "unit.length.foot", symbol: "ft", urlName: "feet", factor: 0.3048 },
    { id: "yard", labelKey: "unit.length.yard", symbol: "yd", urlName: "yards", factor: 0.9144 },
    { id: "mile", labelKey: "unit.length.mile", symbol: "mi", urlName: "miles", factor: 1609.344 },
    { id: "nautical-mile", labelKey: "unit.length.nauticalMile", symbol: "nmi", urlName: "nautical-miles", factor: 1852 },
  ],
  defaultPair: ["meter", "foot"],
  featuredPairs: [
    ["meter", "foot"],
    ["centimeter", "inch"],
    ["kilometer", "mile"],
    ["foot", "meter"],
    ["inch", "centimeter"],
    ["mile", "kilometer"],
    ["millimeter", "inch"],
    ["yard", "meter"],
  ],
};

const weight: ConverterDefinition = {
  id: "weight",
  category: "weight",
  slug: "weight",
  titleKey: "conv.weight.title",
  descKey: "conv.weight.desc",
  icon: "⚖️",
  baseUnit: "kilogram",
  explainerKey: "conv.weight.explain",
  units: [
    { id: "milligram", labelKey: "unit.weight.milligram", symbol: "mg", urlName: "milligrams", factor: 0.000001 },
    { id: "gram", labelKey: "unit.weight.gram", symbol: "g", urlName: "grams", factor: 0.001 },
    { id: "kilogram", labelKey: "unit.weight.kilogram", symbol: "kg", urlName: "kilograms", factor: 1 },
    { id: "tonne", labelKey: "unit.weight.tonne", symbol: "t", urlName: "tonnes", factor: 1000 },
    { id: "ounce", labelKey: "unit.weight.ounce", symbol: "oz", urlName: "ounces", factor: 0.028349523125 },
    { id: "pound", labelKey: "unit.weight.pound", symbol: "lb", urlName: "pounds", factor: 0.45359237 },
    { id: "stone", labelKey: "unit.weight.stone", symbol: "st", urlName: "stones", factor: 6.35029318 },
    { id: "us-ton", labelKey: "unit.weight.usTon", symbol: "ton", urlName: "us-tons", factor: 907.18474 },
  ],
  defaultPair: ["kilogram", "pound"],
  featuredPairs: [
    ["kilogram", "pound"],
    ["pound", "kilogram"],
    ["gram", "ounce"],
    ["ounce", "gram"],
    ["stone", "kilogram"],
    ["kilogram", "stone"],
    ["tonne", "pound"],
  ],
};

const temperature: ConverterDefinition = {
  id: "temperature",
  category: "temperature",
  slug: "temperature",
  titleKey: "conv.temperature.title",
  descKey: "conv.temperature.desc",
  icon: "🌡️",
  baseUnit: "celsius",
  explainerKey: "conv.temperature.explain",
  units: [
    { id: "celsius", labelKey: "unit.temperature.celsius", symbol: "°C", factor: 1, decimals: 2 },
    {
      id: "fahrenheit",
      labelKey: "unit.temperature.fahrenheit",
      symbol: "°F",
      // Fahrenheit has an offset as well as a scale, so it cannot be a factor.
      toBase: (value) => ((value - 32) * 5) / 9,
      fromBase: (value) => (value * 9) / 5 + 32,
      decimals: 2,
    },
    {
      id: "kelvin",
      labelKey: "unit.temperature.kelvin",
      symbol: "K",
      toBase: (value) => value - 273.15,
      fromBase: (value) => value + 273.15,
      decimals: 2,
    },
  ],
  defaultPair: ["celsius", "fahrenheit"],
  featuredPairs: [
    ["celsius", "fahrenheit"],
    ["fahrenheit", "celsius"],
    ["celsius", "kelvin"],
    ["kelvin", "celsius"],
  ],
};

const area: ConverterDefinition = {
  id: "area",
  category: "area",
  slug: "area",
  titleKey: "conv.area.title",
  descKey: "conv.area.desc",
  icon: "🔲",
  baseUnit: "square-meter",
  explainerKey: "conv.area.explain",
  units: [
    { id: "square-centimeter", labelKey: "unit.area.squareCentimeter", symbol: "cm²", urlName: "square-centimeters", factor: 0.0001 },
    { id: "square-meter", labelKey: "unit.area.squareMeter", symbol: "m²", urlName: "square-meters", factor: 1 },
    { id: "hectare", labelKey: "unit.area.hectare", symbol: "ha", urlName: "hectares", factor: 10_000 },
    { id: "square-kilometer", labelKey: "unit.area.squareKilometer", symbol: "km²", urlName: "square-kilometers", factor: 1_000_000 },
    { id: "square-foot", labelKey: "unit.area.squareFoot", symbol: "ft²", urlName: "square-feet", factor: 0.09290304 },
    { id: "square-yard", labelKey: "unit.area.squareYard", symbol: "yd²", urlName: "square-yards", factor: 0.83612736 },
    { id: "acre", labelKey: "unit.area.acre", symbol: "ac", urlName: "acres", factor: 4046.8564224 },
    { id: "square-mile", labelKey: "unit.area.squareMile", symbol: "mi²", urlName: "square-miles", factor: 2_589_988.110336 },
  ],
  defaultPair: ["square-meter", "square-foot"],
  featuredPairs: [
    ["square-meter", "square-foot"],
    ["square-foot", "square-meter"],
    ["acre", "hectare"],
    ["hectare", "acre"],
    ["square-kilometer", "square-mile"],
  ],
};

const volume: ConverterDefinition = {
  id: "volume",
  category: "volume",
  slug: "volume",
  titleKey: "conv.volume.title",
  descKey: "conv.volume.desc",
  icon: "🧪",
  baseUnit: "liter",
  explainerKey: "conv.volume.explain",
  units: [
    { id: "milliliter", labelKey: "unit.volume.milliliter", symbol: "ml", urlName: "milliliters", factor: 0.001 },
    { id: "liter", labelKey: "unit.volume.liter", symbol: "L", urlName: "liters", factor: 1 },
    { id: "cubic-meter", labelKey: "unit.volume.cubicMeter", symbol: "m³", urlName: "cubic-meters", factor: 1000 },
    { id: "us-gallon", labelKey: "unit.volume.usGallon", symbol: "gal", urlName: "us-gallons", factor: 3.785411784 },
    { id: "imperial-gallon", labelKey: "unit.volume.imperialGallon", symbol: "gal", urlName: "imperial-gallons", factor: 4.54609 },
    { id: "us-cup", labelKey: "unit.volume.usCup", symbol: "cup", urlName: "us-cups", factor: 0.2365882365 },
    { id: "us-fluid-ounce", labelKey: "unit.volume.usFluidOunce", symbol: "fl oz", urlName: "us-fluid-ounces", factor: 0.0295735295625 },
    { id: "us-pint", labelKey: "unit.volume.usPint", symbol: "pt", urlName: "us-pints", factor: 0.473176473 },
  ],
  defaultPair: ["liter", "us-gallon"],
  featuredPairs: [
    ["liter", "us-gallon"],
    ["us-gallon", "liter"],
    ["milliliter", "us-fluid-ounce"],
    ["us-cup", "milliliter"],
    ["liter", "imperial-gallon"],
  ],
};

const speed: ConverterDefinition = {
  id: "speed",
  category: "speed",
  slug: "speed",
  titleKey: "conv.speed.title",
  descKey: "conv.speed.desc",
  icon: "🚀",
  baseUnit: "meter-per-second",
  explainerKey: "conv.speed.explain",
  units: [
    { id: "meter-per-second", labelKey: "unit.speed.meterPerSecond", symbol: "m/s", factor: 1 },
    { id: "kilometer-per-hour", labelKey: "unit.speed.kilometerPerHour", symbol: "km/h", factor: 1 / 3.6 },
    { id: "mile-per-hour", labelKey: "unit.speed.milePerHour", symbol: "mph", factor: 0.44704 },
    { id: "knot", labelKey: "unit.speed.knot", symbol: "kn", factor: 0.514444 },
    { id: "foot-per-second", labelKey: "unit.speed.footPerSecond", symbol: "ft/s", factor: 0.3048 },
  ],
  defaultPair: ["kilometer-per-hour", "mile-per-hour"],
  featuredPairs: [
    ["kilometer-per-hour", "mile-per-hour"],
    ["mile-per-hour", "kilometer-per-hour"],
    ["knot", "kilometer-per-hour"],
    ["meter-per-second", "kilometer-per-hour"],
  ],
};

const data: ConverterDefinition = {
  id: "data",
  category: "data",
  slug: "data",
  titleKey: "conv.data.title",
  descKey: "conv.data.desc",
  icon: "💾",
  baseUnit: "megabyte",
  explainerKey: "conv.data.explain",
  units: [
    { id: "bit", labelKey: "unit.data.bit", symbol: "b", urlName: "bits", factor: 1 / 8_000_000 },
    { id: "byte", labelKey: "unit.data.byte", symbol: "B", urlName: "bytes", factor: 1 / 1_000_000 },
    { id: "kilobyte", labelKey: "unit.data.kilobyte", symbol: "kB", urlName: "kilobytes", factor: 0.001 },
    { id: "megabyte", labelKey: "unit.data.megabyte", symbol: "MB", urlName: "megabytes", factor: 1 },
    { id: "gigabyte", labelKey: "unit.data.gigabyte", symbol: "GB", urlName: "gigabytes", factor: 1000 },
    { id: "terabyte", labelKey: "unit.data.terabyte", symbol: "TB", urlName: "terabytes", factor: 1_000_000 },
    // Binary prefixes are a power of two apart from the decimal ones.
    { id: "kibibyte", labelKey: "unit.data.kibibyte", symbol: "KiB", urlName: "kibibytes", factor: 1024 / 1_000_000 },
    { id: "mebibyte", labelKey: "unit.data.mebibyte", symbol: "MiB", urlName: "mebibytes", factor: 1_048_576 / 1_000_000 },
    { id: "gibibyte", labelKey: "unit.data.gibibyte", symbol: "GiB", urlName: "gibibytes", factor: 1_073_741_824 / 1_000_000 },
  ],
  defaultPair: ["gigabyte", "megabyte"],
  featuredPairs: [
    ["gigabyte", "megabyte"],
    ["megabyte", "kilobyte"],
    ["terabyte", "gigabyte"],
    ["gibibyte", "gigabyte"],
  ],
};

const time: ConverterDefinition = {
  id: "time",
  category: "time",
  slug: "time",
  titleKey: "conv.time.title",
  descKey: "conv.time.desc",
  icon: "⏱️",
  baseUnit: "second",
  explainerKey: "conv.time.explain",
  units: [
    { id: "millisecond", labelKey: "unit.time.millisecond", symbol: "ms", urlName: "milliseconds", factor: 0.001 },
    { id: "second", labelKey: "unit.time.second", symbol: "s", urlName: "seconds", factor: 1 },
    { id: "minute", labelKey: "unit.time.minute", symbol: "min", urlName: "minutes", factor: 60 },
    { id: "hour", labelKey: "unit.time.hour", symbol: "h", urlName: "hours", factor: 3600 },
    { id: "day", labelKey: "unit.time.day", symbol: "d", urlName: "days", factor: 86_400 },
    { id: "week", labelKey: "unit.time.week", symbol: "wk", urlName: "weeks", factor: 604_800 },
    // A calendar month and year vary, so these use the average Gregorian year.
    { id: "month", labelKey: "unit.time.month", symbol: "mo", urlName: "months", factor: 2_629_746 },
    { id: "year", labelKey: "unit.time.year", symbol: "yr", urlName: "years", factor: 31_556_952 },
  ],
  defaultPair: ["hour", "minute"],
  featuredPairs: [
    ["hour", "minute"],
    ["minute", "second"],
    ["day", "hour"],
    ["week", "day"],
    ["year", "day"],
  ],
};

const energy: ConverterDefinition = {
  id: "energy",
  category: "energy",
  slug: "energy",
  titleKey: "conv.energy.title",
  descKey: "conv.energy.desc",
  icon: "⚡",
  baseUnit: "joule",
  explainerKey: "conv.energy.explain",
  units: [
    { id: "joule", labelKey: "unit.energy.joule", symbol: "J", urlName: "joules", factor: 1 },
    { id: "kilojoule", labelKey: "unit.energy.kilojoule", symbol: "kJ", urlName: "kilojoules", factor: 1000 },
    { id: "calorie", labelKey: "unit.energy.calorie", symbol: "cal", urlName: "calories", factor: 4.184 },
    { id: "kilocalorie", labelKey: "unit.energy.kilocalorie", symbol: "kcal", urlName: "kilocalories", factor: 4184 },
    { id: "watt-hour", labelKey: "unit.energy.wattHour", symbol: "Wh", urlName: "watt-hours", factor: 3600 },
    { id: "kilowatt-hour", labelKey: "unit.energy.kilowattHour", symbol: "kWh", urlName: "kilowatt-hours", factor: 3_600_000 },
    { id: "btu", labelKey: "unit.energy.btu", symbol: "BTU", factor: 1055.05585262 },
  ],
  defaultPair: ["kilocalorie", "kilojoule"],
  featuredPairs: [
    ["kilocalorie", "kilojoule"],
    ["kilojoule", "kilocalorie"],
    ["kilowatt-hour", "joule"],
    ["btu", "kilojoule"],
  ],
};

const pressure: ConverterDefinition = {
  id: "pressure",
  category: "pressure",
  slug: "pressure",
  titleKey: "conv.pressure.title",
  descKey: "conv.pressure.desc",
  icon: "🎈",
  baseUnit: "pascal",
  explainerKey: "conv.pressure.explain",
  units: [
    { id: "pascal", labelKey: "unit.pressure.pascal", symbol: "Pa", urlName: "pascals", factor: 1 },
    { id: "kilopascal", labelKey: "unit.pressure.kilopascal", symbol: "kPa", urlName: "kilopascals", factor: 1000 },
    { id: "bar", labelKey: "unit.pressure.bar", symbol: "bar", factor: 100_000 },
    { id: "psi", labelKey: "unit.pressure.psi", symbol: "psi", factor: 6894.757293168 },
    { id: "atmosphere", labelKey: "unit.pressure.atmosphere", symbol: "atm", urlName: "atmospheres", factor: 101_325 },
    { id: "mmhg", labelKey: "unit.pressure.mmhg", symbol: "mmHg", factor: 133.322387415 },
  ],
  defaultPair: ["bar", "psi"],
  featuredPairs: [
    ["bar", "psi"],
    ["psi", "bar"],
    ["kilopascal", "psi"],
    ["atmosphere", "bar"],
  ],
};

const power: ConverterDefinition = {
  id: "power",
  category: "power",
  slug: "power",
  titleKey: "conv.power.title",
  descKey: "conv.power.desc",
  icon: "🔌",
  baseUnit: "watt",
  explainerKey: "conv.power.explain",
  units: [
    { id: "watt", labelKey: "unit.power.watt", symbol: "W", urlName: "watts", factor: 1 },
    { id: "kilowatt", labelKey: "unit.power.kilowatt", symbol: "kW", urlName: "kilowatts", factor: 1000 },
    { id: "megawatt", labelKey: "unit.power.megawatt", symbol: "MW", urlName: "megawatts", factor: 1_000_000 },
    { id: "horsepower", labelKey: "unit.power.horsepower", symbol: "hp", factor: 745.699871582 },
    { id: "metric-horsepower", labelKey: "unit.power.metricHorsepower", symbol: "PS", factor: 735.49875 },
  ],
  defaultPair: ["kilowatt", "horsepower"],
  featuredPairs: [
    ["kilowatt", "horsepower"],
    ["horsepower", "kilowatt"],
    ["kilowatt", "metric-horsepower"],
    ["watt", "kilowatt"],
  ],
};

const angle: ConverterDefinition = {
  id: "angle",
  category: "angle",
  slug: "angle",
  titleKey: "conv.angle.title",
  descKey: "conv.angle.desc",
  icon: "📐",
  baseUnit: "degree",
  explainerKey: "conv.angle.explain",
  units: [
    { id: "degree", labelKey: "unit.angle.degree", symbol: "°", urlName: "degrees", factor: 1, decimals: 4 },
    { id: "radian", labelKey: "unit.angle.radian", symbol: "rad", urlName: "radians", factor: 180 / Math.PI, decimals: 6 },
    { id: "gradian", labelKey: "unit.angle.gradian", symbol: "gon", urlName: "gradians", factor: 0.9, decimals: 4 },
    { id: "arcminute", labelKey: "unit.angle.arcminute", symbol: "′", urlName: "arcminutes", factor: 1 / 60, decimals: 2 },
  ],
  defaultPair: ["degree", "radian"],
  featuredPairs: [
    ["degree", "radian"],
    ["radian", "degree"],
    ["degree", "gradian"],
  ],
};

const fuelEconomy: ConverterDefinition = {
  id: "fuel-economy",
  category: "fuel-economy",
  slug: "fuel-economy",
  titleKey: "conv.fuel-economy.title",
  descKey: "conv.fuel-economy.desc",
  icon: "⛽",
  baseUnit: "km-per-liter",
  explainerKey: "conv.fuel-economy.explain",
  units: [
    { id: "km-per-liter", labelKey: "unit.fuel.kmPerLiter", symbol: "km/L", factor: 1, decimals: 2 },
    { id: "mpg-us", labelKey: "unit.fuel.mpgUs", symbol: "mpg (US)", factor: 0.425143707, decimals: 2 },
    { id: "mpg-imperial", labelKey: "unit.fuel.mpgImperial", symbol: "mpg (UK)", factor: 0.354006042, decimals: 2 },
    {
      id: "liters-per-100km",
      labelKey: "unit.fuel.litersPer100km",
      symbol: "L/100 km",
      // Consumption is the reciprocal of economy, so more is worse - which is
      // why this one cannot be a factor like the others.
      toBase: (value) => (value === 0 ? 0 : 100 / value),
      fromBase: (value) => (value === 0 ? 0 : 100 / value),
      decimals: 2,
    },
  ],
  defaultPair: ["liters-per-100km", "mpg-us"],
  featuredPairs: [
    ["liters-per-100km", "mpg-us"],
    ["mpg-us", "liters-per-100km"],
    ["km-per-liter", "mpg-us"],
    ["mpg-imperial", "liters-per-100km"],
  ],
};

export const CONVERTERS: ConverterDefinition[] = [
  length,
  weight,
  temperature,
  area,
  volume,
  speed,
  data,
  time,
  energy,
  pressure,
  power,
  angle,
  fuelEconomy,
];

export function getConverter(slug: string): ConverterDefinition | undefined {
  return CONVERTERS.find((converter) => converter.slug === slug);
}

export function getConverterByCategory(
  category: string,
): ConverterDefinition | undefined {
  return CONVERTERS.find((converter) => converter.category === category);
}

/** `meters-to-feet` -> the two unit ids, if this pair is a featured one. */
export function parsePairSlug(
  definition: ConverterDefinition,
  slug: string,
): [string, string] | null {
  for (const [from, to] of definition.featuredPairs) {
    if (pairSlug(definition, from, to) === slug) return [from, to];
  }
  return null;
}

/**
 * URL slug for a pair, built from the plural unit names: `meters-to-feet`
 * reads the way the conversion is searched for, where `meter-to-foot` does not.
 */
export function pairSlug(
  definition: ConverterDefinition,
  from: string,
  to: string,
): string {
  const a = definition.units.find((unit) => unit.id === from);
  const b = definition.units.find((unit) => unit.id === to);
  return `${a?.urlName ?? from}-to-${b?.urlName ?? to}`;
}
