// Validate retained browser records against the configured journeys. No browser starts here.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = path.dirname(fileURLToPath(import.meta.url));
const parent = path.dirname(root);
const manifest = JSON.parse(fs.readFileSync(path.join(parent, 'responsive-live-2026-10-24-manifest.json'), 'utf8'));
const metadata = JSON.parse(fs.readFileSync('src/config/calculators/metadata.json', 'utf8'));
for (const f of manifest.routes) {
  const calculator = metadata.find(c => c.slug === f.slug);
  const home = manifest.contexts[f.locale].country;
  const requested = f.route.match(/\/countries\/([a-z]{2})\//)?.[1] ?? home;
  const country = calculator.countries.includes(requested) ? requested : calculator.countries[0];
  assert.equal(f.homeCountry, home, f.route);
  assert.equal(f.country, country, f.route);
}
const sizes = manifest.sizes;
const key = r => [r.locale, r.route, r.viewport.width, r.viewport.height].join('|');
const journeys = manifest.routes.flatMap(f => sizes.map(viewport => ({ ...f, viewport })));
const expected = new Map(journeys.map(f => [key(f), f]));
assert.equal(expected.size, 2880, 'Manifest must contain 2,880 distinct journeys');
function lines(file) {
  // Raw ledgers intentionally remain local. Never replace versioned coverage
  // with a partial/empty summary when a checkout lacks those evidence files.
  assert.ok(fs.existsSync(file), 'Required local raw ledger is missing: ' + file);
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);
}
function validState(s, r, f) {
  const alias = f.slug === 'salary' && ['tr', 'br', 'cn', 'mx'].includes(f.country)
    ? f.route.replace(/\/salary$/, '/income-tax') : f.route;
  return s.origin === 'http://127.0.0.1:3001' && s.lang.toLowerCase() === f.locale.toLowerCase()
    && s.width === r.viewport.width && s.height === r.viewport.height && s.formReady
    && (s.url === f.route || s.url === alias);
}
function validGeometry(r) {
  const f = expected.get(key(r));
  return f && r.country === f.country && r.homeCountry === f.homeCountry && r.contextValid
    && validState(r.state, r, f) && r.state.controls?.some(c =>
      c.label?.endsWith(': ' + manifest.contexts[f.locale].countryName));
}
function validInteraction(r) {
  const f = expected.get(key(r));
  return f && r.country === f.country && r.homeCountry === f.homeCountry && r.completed && !r.error
    && r.countryControl?.endsWith(': ' + manifest.contexts[f.locale].countryName)
    && r.states?.length > 1 && r.states.every(s => validState(s, r, f));
}
const oldRows = lines(path.join(parent, 'final-pending-2026-10-24', 'responsive-local-2026-10-24.jsonl'));
const newRows = lines(path.join(root, 'responsive-local-2026-10-24.jsonl'));
const inherited = new Map(oldRows.filter(validInteraction).map(r => [key(r), r]));
const current = new Map(newRows.filter(validInteraction).map(r => [key(r), r]));
// The inherited search-copy change only alters en-US/us loan text among
// these 720 journeys. Recheck its four sizes; keep other evidence applicable.
const affected = r => r.locale === 'en-US' && r.slug === 'loan' && r.country === 'us';
const carried = new Map([...inherited].filter(([, r]) => !affected(r)));
const combined = new Map([...carried, ...current]);
const geometryRows = lines(path.join(root, 'geometry.jsonl'));
const geometry = new Map(geometryRows.filter(validGeometry).map(r => [key(r), r]));
const inheritedGeometryRows = lines(path.join(parent, 'final-pending-2026-10-24', 'geometry.jsonl'));
const inheritedGeometry = new Map(inheritedGeometryRows.filter(r => {
  return !affected(r) && validGeometry(r);
}).map(r => [key(r), r]));
const applicableGeometry = new Map([...inheritedGeometry, ...geometry]);
const next = journeys.find(r => !combined.has(key(r))) ?? null;
const nextCursor = next ? {
  route: manifest.routes.findIndex(f => f.locale === next.locale && f.route === next.route),
  size: sizes.findIndex(s => s.width === next.viewport.width && s.height === next.viewport.height),
} : { route: manifest.routes.length, size: 0 };
const summary = {
  at: new Date().toISOString(), target: expected.size,
  manifestCountryMappingsValidated: manifest.routes.length,
  inheritedInteractions: inherited.size,
  carriedUnaffectedInteractions: carried.size,
  currentBuildInteractions: current.size,
  uniqueCombinedInteractions: combined.size,
  passingCombinedInteractions: [...combined.values()].filter(r => r.automatedPass && !r.candidates.length).length,
  remainingInteractions: expected.size - combined.size,
  interactionCandidates: [...combined.values()].filter(r => r.candidates.length || !r.automatedPass)
    .map(r => ({ key: key(r), candidates: r.candidates, interactions: r.interactions.filter(i => !i.pass) })),
  currentBuildGeometry: geometry.size,
  carriedUnaffectedGeometry: inheritedGeometry.size,
  applicableCombinedGeometry: applicableGeometry.size,
  remainingApplicableGeometry: expected.size - applicableGeometry.size,
  geometryCandidates: [...applicableGeometry.values()].filter(r => r.candidate).map(r => ({ key: key(r), state: r.state })),
  incompleteCurrentAttempts: newRows.filter(r => !validInteraction(r)).map(r => ({ key: key(r), error: r.error })),
  next,
  nextCursor,
};
fs.writeFileSync(path.join(root, 'matrix-summary.json'), JSON.stringify(summary, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'interaction-cursor.json'), JSON.stringify(nextCursor) + '\n');
const quote = v => '"' + String(v ?? '').replaceAll('"', '""') + '"';
const csv = [['locale', 'route', 'country', 'width', 'height', 'inheritedInteraction', 'currentInteraction', 'combinedPass', 'currentGeometry', 'applicableGeometry', 'geometryCandidate'],
  ...journeys.map(r => [r.locale, r.route, r.country, r.viewport.width, r.viewport.height,
    inherited.has(key(r)), current.has(key(r)), combined.get(key(r))?.automatedPass ?? '',
    geometry.has(key(r)), applicableGeometry.has(key(r)), applicableGeometry.get(key(r))?.candidate ?? ''])];
fs.writeFileSync(path.join(root, 'coverage.csv'), csv.map(row => row.map(quote).join(',')).join('\n') + '\n');
console.log(JSON.stringify(summary));
