/**
 * Dictionary coverage report.
 *
 *   node scripts/i18n-coverage.mjs
 *
 * Walks the source for every translation key it can see statically, checks the
 * English dictionary defines all of them, and reports how much of English each
 * other language covers. Missing keys fall back to English at runtime, so this
 * is a progress report rather than a build failure.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { EN_US_FILE, buildEnUs } from "./en-us-spelling.mjs";

const DICT_DIR = "src/lib/i18n/dictionaries";
const SOURCE_DIRS = ["src/app", "src/components", "src/config", "src/lib"];

const KEY_PATTERN =
  /["'`](app|common|gate|header|nav|home|section|category|calc|conv|unit|breakdown|actions|export|ads|a11y|units|country|tax|levy|field|option|result|table|footer|error)\.[A-Za-z0-9._-]+["'`]/g;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (/\.tsx?$/.test(path)) out.push(path);
  }
  return out;
}

const referenced = new Set();
for (const dir of SOURCE_DIRS) {
  for (const file of walk(dir)) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(KEY_PATTERN)) {
      referenced.add(match[0].slice(1, -1));
    }
  }
}

const english = JSON.parse(readFileSync(join(DICT_DIR, "en.json"), "utf8"));
const englishKeys = Object.keys(english);

// FAQ entries are referenced by their base key and rendered as `<key>.q` and
// `<key>.a`, and counted phrases as `<key>.one` / `<key>.other` (see
// `plural` in src/lib/i18n/core.ts), so either form counts as present.
const missingFromEnglish = [...referenced]
  .filter((key) => !(key in english) && !(`${key}.q` in english) && !(`${key}.other` in english))
  .sort();

console.log(`English defines ${englishKeys.length} keys.`);
console.log(`Source references ${referenced.size} static keys.`);

if (missingFromEnglish.length) {
  console.log(`\nMissing from en.json (${missingFromEnglish.length}):`);
  for (const key of missingFromEnglish) console.log(`  ${key}`);
} else {
  console.log("Every statically referenced key is defined in English.");
}

console.log("\nCoverage against English:");
for (const file of readdirSync(DICT_DIR).sort()) {
  if (!file.endsWith(".json") || file === "en.json") continue;
  const lang = file.replace(".json", "");
  const dict = JSON.parse(readFileSync(join(DICT_DIR, file), "utf8"));
  const translated = englishKeys.filter((key) => key in dict).length;
  const percent = Math.round((translated / englishKeys.length) * 100);
  const bar = "█".repeat(Math.round(percent / 5)).padEnd(20, "·");
  console.log(
    `  ${lang.padEnd(3)} ${bar} ${String(percent).padStart(3)}%  ${translated}/${englishKeys.length}`,
  );

  // A language may add plural categories English lacks (Russian `few` /
  // `many`, Arabic `zero` / `two`): valid wherever English has `<key>.other`.
  const stale = Object.keys(dict).filter((key) => {
    if (key in english) return false;
    const extra = key.match(/^(.*)\.(zero|two|few|many)$/);
    return !(extra && `${extra[1]}.other` in english);
  });
  if (stale.length) {
    console.log(`      ${stale.length} key(s) no longer in English: ${stale.slice(0, 5).join(", ")}${stale.length > 5 ? "…" : ""}`);
  }
}

// Regional overrides (en-US, en-GB, ...) reword keys for one market. A key
// English does not define would silently do nothing, so it fails the check,
// as does a placeholder the English version does not have.
const REGIONAL_DIR = join(DICT_DIR, "regional");
let regionalProblems = 0;
console.log("\nRegional overrides:");
for (const file of readdirSync(REGIONAL_DIR).sort()) {
  if (!file.endsWith(".json")) continue;
  const regional = JSON.parse(readFileSync(join(REGIONAL_DIR, file), "utf8"));
  const keys = Object.keys(regional);
  const unknown = keys.filter((key) => !(key in english));
  const slots = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
  const mismatched = keys.filter((key) => key in english && slots(regional[key]) !== slots(english[key]));
  console.log(`  ${file.replace(".json", "").padEnd(6)} ${keys.length} keys reworded`);
  for (const key of unknown) console.log(`      not in English: ${key}`);
  for (const key of mismatched) console.log(`      placeholders differ from English: ${key}`);
  regionalProblems += unknown.length + mismatched.length;
}

// en-US is derived from the British base (scripts/en-us-spelling.mjs). If
// English copy changed without regenerating it, US pages would show British
// spelling (or stale text), so the check fails until it is rerun.
const expectedUs = buildEnUs();
const actualUs = JSON.parse(readFileSync(EN_US_FILE, "utf8"));
const staleUs = [
  ...Object.keys(expectedUs).filter((key) => actualUs[key] !== expectedUs[key]),
  ...Object.keys(actualUs).filter((key) => !(key in expectedUs)),
];
if (staleUs.length) {
  console.log(`\nen-US overrides are out of date (${staleUs.length}): ${staleUs.slice(0, 5).join(", ")}${staleUs.length > 5 ? "…" : ""}`);
  console.log("  Run: npm run i18n:en-us");
}

if (missingFromEnglish.length || regionalProblems || staleUs.length) process.exitCode = 1;
