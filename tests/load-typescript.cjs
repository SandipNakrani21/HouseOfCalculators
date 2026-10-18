// The tests execute the project's pure TypeScript modules with the installed compiler.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) {
  let resolved = request.startsWith('@/') ? path.join(root, 'src', request.slice(2)) : request;
  // Match Next's TS-first alias resolution when a generated JSON sibling exists.
  if (request.startsWith('@/') && !path.extname(resolved)) {
    const source = ['.ts', '.tsx'].map(extension => resolved + extension).find(filename => fs.existsSync(filename));
    if (source) resolved = source;
  }
  return originalResolve.call(this, resolved, ...args);
};
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
};
