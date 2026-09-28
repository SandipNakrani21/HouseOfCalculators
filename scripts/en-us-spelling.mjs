/**
 * American English for the en-US pages.
 *
 *   npm run i18n:en-us     rewrite src/lib/i18n/dictionaries/regional/en-US.json
 *
 * The base dictionary (en.json) is written in British English, which the
 * en-GB pages use as is. This derives the en-US overrides from it: spelling
 * (metre -> meter, amortisation -> amortization, instalment -> installment),
 * a few words (spanner -> wrench, tonne -> metric ton) and the market-specific
 * snippet suffix. Only keys that change are written.
 *
 * Run it after adding or editing English copy. `npm run i18n` fails when the
 * file is out of date, so a new British spelling cannot reach the US pages.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = join(ROOT, "src/lib/i18n/dictionaries/en.json");
export const EN_US_FILE = join(ROOT, "src/lib/i18n/dictionaries/regional/en-US.json");

/** [pattern, replacement] - lower-case forms; capitalised forms are derived. */
const RULES = [
  // Proper nouns and set terms are left alone by construction: "flat rate",
  // "public holidays" and the Dutch "holiday allowance" are not listed.
  [/\b(kilo|centi|milli|micro|nano)?metre(s?)\b/g, "$1meter$2"],
  [/\b(milli|centi|deci)?litre(s?)\b/g, "$1liter$2"],
  [/\bcolour/g, "color"],
  [/\borganis(e|ed|es|ing|ation)\b/g, "organiz$1"],
  [/\bamortis(e|ed|es|ing|ation)\b/g, "amortiz$1"],
  [/\bcentre(s?)\b/g, "center$1"],
  [/\bcheque(s?)\b/g, "check$1"],
  [/\bmaths\b/g, "math"],
  [/\btyre(s?)\b/g, "tire$1"],
  [/\bmodell(ed|ing)\b/g, "model$1"],
  [/\blabell(ed|ing)\b/g, "label$1"],
  [/\boptimis(e|ed|es|ing|ation)\b/g, "optimiz$1"],
  [/\brecognis(e|ed|es|ing|able)\b/g, "recogniz$1"],
  [/\bpersonalis(e|ed|es|ing|ation)\b/g, "personaliz$1"],
  [/\bannualis(e|ed|es|ing|ation)\b/g, "annualiz$1"],
  [/\bitemis(e|ed|es|ing|ation)\b/g, "itemiz$1"],
  [/\bhonour(s?)\b/g, "honor$1"],
  [/\blabour\b/g, "labor"],
  [/\bfavour\b/g, "favor"],
  [/\bper cent\b/g, "percent"],
  [/\bjudgement\b/g, "judgment"],
  [/\binstalment(s?)\b/g, "installment$1"],
  [/\badvert(s?)\b/g, "ad$1"],
  [/\benquir(y|ies)\b/g, "inquir$1"],
  [/\bfortnight\b/g, "two weeks"],
  [/\bdependant(s?)\b/g, "dependent$1"],
  [/\bspanner(s?)\b/g, "wrench$1"],
  [/\bthe tin\b/g, "the can"],
  [/\btowards\b/g, "toward"],
  [/\btrade marks\b/g, "trademarks"],
];

/** Whole values that need a different word, not a spelling. */
export const WHOLE = {
  "unit.weight.tonne": "Metric ton",
  "unit.weight.tonne.plural": "Metric tons",
  // The snippet suffix names the market, so en-US and en-GB results differ
  // even on pages whose wording is otherwise the same.
  "seo.descriptionSuffix": "Free and private, set up for US users by default.",
};

const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Applies every rule case-insensitively, keeping a leading capital ("Metres" -> "Meters"). */
export function americanise(value) {
  let out = value;
  for (const [pattern, replacement] of RULES) {
    out = out.replace(new RegExp(pattern.source, "gi"), (match) => {
      const converted = match.toLowerCase().replace(new RegExp(pattern.source), replacement);
      return match[0] === match[0].toUpperCase() ? capitalise(converted) : converted;
    });
  }
  return out;
}

/** The en-US overrides the current base dictionary calls for. */
export function buildEnUs() {
  const en = JSON.parse(readFileSync(BASE, "utf8"));
  const overrides = {};
  for (const [key, value] of Object.entries(en)) {
    if (key in WHOLE) {
      overrides[key] = WHOLE[key];
      continue;
    }
    const us = americanise(value);
    if (us !== value) overrides[key] = us;
  }
  return overrides;
}

// Run directly: write the file.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const overrides = buildEnUs();
  mkdirSync(dirname(EN_US_FILE), { recursive: true });
  writeFileSync(EN_US_FILE, JSON.stringify(overrides, null, 2) + "\n");
  console.log(`${Object.keys(overrides).length} en-US overrides written to ${EN_US_FILE}`);
}
