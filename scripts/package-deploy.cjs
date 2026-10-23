/* eslint-disable @typescript-eslint/no-require-imports -- Standalone deployment packaging runs in Node. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const buildId = fs.readFileSync(path.join(root, '.next/BUILD_ID'), 'utf8').trim();
if (!/^[\w-]+$/.test(buildId)) throw new Error('Invalid build ID');
const standalone = path.join(root, '.next/standalone');
if (!fs.existsSync(path.join(standalone, 'server.js'))) throw new Error('Run npm run build first.');
const platform = process.platform + '-' + process.arch;
const destination = path.join(root, 'dist', `deploy-${buildId}-${platform}`);
const allowedSourceDirectories = new Set([
  'src', 'src/config', 'src/config/calculators',
  'src/lib', 'src/lib/i18n', 'src/lib/i18n/dictionaries', 'src/lib/i18n/dictionaries/regional',
]);
// Resume validation of an incomplete package from this build; keep valid releases.
if (fs.existsSync(destination)) {
  if (fs.existsSync(path.join(destination, 'release-manifest.json'))) throw new Error('Release folder already exists: ' + destination);
  const distRoot = path.resolve(root, 'dist') + path.sep;
  if (!path.resolve(destination).startsWith(distRoot)) throw new Error('Refusing to clean a path outside dist.');
}
if (!fs.existsSync(destination)) {
  fs.mkdirSync(destination, { recursive: true });
  fs.cpSync(standalone, destination, { recursive: true, dereference: true });
  fs.cpSync(path.join(root, '.next/static'), path.join(destination, '.next/static'), { recursive: true });
  fs.cpSync(path.join(root, 'public'), path.join(destination, 'public'), { recursive: true });
}
// The release needs no install/build step, dev dependencies, tests or source.
fs.writeFileSync(path.join(destination, 'package.json'), JSON.stringify({
  name: 'calculator-hub-release', private: true,
  scripts: { start: 'node server.js' }, engines: { node: '>=20.9.0' },
}, null, 2) + '\n');
let bytes = 0;
let files = 0;
function inspect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    const relative = path.relative(destination, file).split(path.sep).join('/');
    if (entry.isSymbolicLink()) throw new Error('Release must be portable: ' + relative);
    if (/^(?:docs|tests|scripts|\.git)(?:\/|$)|^\.next\/(?:cache|dev)(?:\/|$)|(?:^|\/)\.env(?:\.|$)/.test(relative)) {
      throw new Error('Development or private file in release: ' + relative);
    }
    if (entry.isDirectory()) {
      if (relative.startsWith('src/') && !allowedSourceDirectories.has(relative)) {
        throw new Error('Unexpected source directory in runtime package: ' + relative);
      }
      inspect(file);
    } else {
      if (relative.startsWith('src/')) {
        const runtimeData = /^src\/(?:config\/calculators\/(?:metadata|tax-metadata|review-metadata)\.json|lib\/i18n\/dictionaries\/(?:[a-z-]+|regional\/[a-z-]+)\.json)$/i.test(relative);
        if (!runtimeData) throw new Error('Unexpected source file in runtime package: ' + relative);
      }
      bytes += fs.statSync(file).size;
      files++;
    }
  }
}
inspect(destination);
const report = { buildId, platform: process.platform, arch: process.arch, bytes, files, destination };
fs.writeFileSync(path.join(destination, 'release-manifest.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
