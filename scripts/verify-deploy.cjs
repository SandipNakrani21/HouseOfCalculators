/* eslint-disable @typescript-eslint/no-require-imports -- Verify the built Node runtime. */
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const buildId = fs.readFileSync(path.join(root, '.next/BUILD_ID'), 'utf8').trim();
if (!/^[\w-]+$/.test(buildId)) throw new Error('Invalid build ID');
const cwd = path.join(root, 'dist', `deploy-${buildId}-${process.platform}-${process.arch}`);
const port = 3102;
const server = spawn(process.execPath, ['server.js'], {
  cwd, env: { ...process.env, NODE_ENV: 'production', PORT: String(port), HOSTNAME: '127.0.0.1' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let log = '';
server.stdout.on('data', chunk => { log += chunk; });
server.stderr.on('data', chunk => { log += chunk; });
async function main() {
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { ready = (await fetch(base + '/.well-known/release.json')).ok; } catch {}
    if (ready) break;
    if (server.exitCode !== null) throw new Error(log);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'Standalone runtime starts');
  const locales = ['en-us', 'en-gb', 'de-de', 'fr-fr', 'es-es', 'pt-br', 'ru-ru', 'tr-tr', 'ja-jp', 'zh-cn', 'it-it', 'nl-nl'];
  let checked = 0;
  for (const locale of locales) {
    for (const route of ['', '/calculators/finance/mortgage', '/countries/us/salary', '/converters/length']) {
      const response = await fetch(base + '/' + locale + route, { redirect: 'manual' });
      assert.equal(response.status, 200, locale + route);
      const html = await response.text();
      assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`, 'i'), 'Correct document language');
      assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, 'Exactly one server-rendered heading');
      if (route.includes('mortgage') || route.includes('salary')) {
        assert.ok(html.includes('<fieldset') && html.includes('result-box'), 'Calculator inputs/results are server rendered');
      }
      assert.ok(!html.includes('"dictionary":{'), 'Dictionary is not repeated in the page payload');
      checked++;
    }
  }
  const html = await (await fetch(base + '/en-us/countries/us/salary')).text();
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]).filter(url => url.startsWith('/_next/'));
  for (const script of scripts) assert.equal((await fetch(base + script)).status, 200, script);
  const release = await (await fetch(base + '/.well-known/release.json')).json();
  console.log(JSON.stringify({ buildId, routes: checked, scripts: scripts.length, release, status: 'PASS' }, null, 2));
}
main().catch(error => { console.error(error, log); process.exitCode = 1; }).finally(() => server.kill());
