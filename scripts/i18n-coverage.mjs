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

const DICT_DIR = "src/lib/i18n/dictionaries";
const SOURCE_DIRS = ["src/app", "src/components", "src/config", "src/lib"];

const KEY_PATTERN =
  /["'`](app|common|gate|header|home|category|calc|units|country|tax|levy|field|option|result|table|footer|error)\.[A-Za-z0-9._-]+["'`]/g;

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
// `<key>.a`, so a base with a question defined counts as present.
const missingFromEnglish = [...referenced]
  .filter((key) => !(key in english) && !(`${key}.q` in english))
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

  const stale = Object.keys(dict).filter((key) => !(key in english));
  if (stale.length) {
    console.log(`      ${stale.length} key(s) no longer in English: ${stale.slice(0, 5).join(", ")}${stale.length > 5 ? "…" : ""}`);
  }
}

if (missingFromEnglish.length) process.exitCode = 1;
