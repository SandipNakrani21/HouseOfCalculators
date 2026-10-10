import type { ConverterDefinition } from "./units";
/** Curated practical magnitudes, not every possible unit permutation. */
const INPUTS: Record<string, Record<string, [number, number, number]>> = {
  length: { "meter:foot": [1, 1.8, 10], "centimeter:inch": [2.54, 30, 100], "kilometer:mile": [5, 10, 42.195], "foot:meter": [3, 6, 12], "inch:centimeter": [1, 12, 24], "mile:kilometer": [1, 5, 26.2], "millimeter:inch": [10, 25.4, 50], "yard:meter": [1, 10, 100] },
  weight: { "kilogram:pound": [1, 5, 70], "pound:kilogram": [1, 10, 150], "gram:ounce": [28.349523125, 100, 250], "ounce:gram": [1, 4, 8], "stone:kilogram": [1, 10, 12], "kilogram:stone": [60, 70, 80], "tonne:pound": [1, 2.5, 10] },
  temperature: { "celsius:fahrenheit": [0, 37, 100], "fahrenheit:celsius": [32, 98.6, 212], "celsius:kelvin": [-273.15, 0, 25], "kelvin:celsius": [0, 273.15, 300] },
};

// Remaining categories use authored magnitudes selected for their ordinary applications.
const CATEGORY_INPUTS: Record<string, [number, number, number]> = {
  area: [1, 100, 1000], volume: [1, 2, 10], speed: [5, 30, 100],
  data: [1, 8, 1024], time: [1, 24, 90], energy: [1, 1000, 3600],
  pressure: [1, 100, 101.325], power: [1, 100, 1000], angle: [-90, 0, 180],
  "fuel-economy": [5, 8, 12],
};

export function conversionExamples(definition: ConverterDefinition, from: string, to: string): [number, number, number] {
  const authored = INPUTS[definition.id]?.[`${from}:${to}`];
  if (authored) return authored;
  if (definition.id === "fuel-economy" && from !== "liters-per-100km") return [20, 30, 50];
  if (definition.id === "angle" && from === "radian") return [-Math.PI / 2, 0, Math.PI];
  return CATEGORY_INPUTS[definition.id];
}

export const CONVERSION_SOURCES = [
  { name: "NIST — SI units and conversion factors", href: "https://www.nist.gov/pml/special-publication-811" },
  { name: "BIPM — International System of Units", href: "https://www.bipm.org/en/publications/si-brochure" },
];
