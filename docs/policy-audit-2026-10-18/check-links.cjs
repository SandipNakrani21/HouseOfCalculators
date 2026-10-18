/* eslint-disable @typescript-eslint/no-require-imports -- Offline full-build link audit. */
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../../.next/server/app');
const publicRoot = path.resolve(__dirname, '../../public');
const pages = new Map();
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith('.html')) {
      const route = '/' + path.relative(root, file).replaceAll('\\','/').replace(/\.html$/, '').replace(/\/index$/, '');
      pages.set(route, fs.readFileSync(file,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''));
    }
  }
}
walk(root);
const issues = [], links = new Map();
let localizedPages = 0, linkOccurrences = 0;
for (const [route, markup] of pages) {
  if (!/^\/[a-z]{2}-[a-z]{2}(?:\/|$)/.test(route)) continue;
  localizedPages++;
  for (const match of markup.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const raw = match[1].replaceAll('&amp;', '&');
    if (/^(?:mailto:|tel:|data:|https?:\/\/)/.test(raw) && !raw.startsWith('https://thecalculatorshouse.com/')) continue;
    const target = new URL(raw, 'https://thecalculatorshouse.com' + route);
    const pathname = decodeURIComponent(target.pathname).replace(/\/$/, '') || '/';
    if (pathname.startsWith('/_next/')) continue;
    linkOccurrences++;
    if (!links.has(pathname)) links.set(pathname, route);
    if (target.hash && pathname === route && !markup.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`)) {
      issues.push({route, issue:'missing same-page anchor', target:raw});
    }
  }
}
for (const [target, source] of links) {
  if (target === '/' || pages.has(target) || fs.existsSync(path.join(publicRoot,target)) || fs.existsSync(path.join(root,target+'.body'))) continue;
  issues.push({route:source, issue:'unresolved internal destination', target});
}
const result = {localizedPages, uniqueInternalDestinations:links.size, linkOccurrences, issues};
fs.writeFileSync(path.join(__dirname,'link-check.json'), JSON.stringify(result,null,2));
console.log(JSON.stringify({...result,issues:issues.slice(0,30)},null,2));
if (issues.length) process.exitCode = 1;
