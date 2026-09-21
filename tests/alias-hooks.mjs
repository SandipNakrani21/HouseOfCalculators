import { existsSync, statSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * Three things the app's bundler does that bare Node does not: resolve the
 * `@/` path alias, resolve extensionless imports, and import JSON without an
 * explicit import attribute.
 *
 * All three are handled here rather than by changing the source, because the
 * source should suit the app rather than the test runner.
 */
const ROOT = resolvePath(process.cwd(), "src");
const SUFFIXES = ["", ".ts", ".tsx", ".json", "/index.ts", "/index.tsx"];

/** First existing file for a bare path, trying the suffixes a bundler would. */
function findFile(base) {
  for (const suffix of SUFFIXES) {
    const candidate = `${base}${suffix}`;
    // A bare directory is not a module; `src/lib/i18n` has to become
    // `src/lib/i18n/index.ts`, which a later suffix supplies.
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  let target = null;

  if (specifier.startsWith("@/")) {
    target = findFile(resolvePath(ROOT, specifier.slice(2)));
  } else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const fromDirectory = dirname(fileURLToPath(context.parentURL));
    target = findFile(resolvePath(fromDirectory, specifier));
  }

  if (!target) return nextResolve(specifier, context);

  const isJson = target.endsWith(".json");
  return nextResolve(pathToFileURL(target).href, {
    ...context,
    importAttributes: isJson
      ? { ...context.importAttributes, type: "json" }
      : context.importAttributes,
  });
}

export async function load(url, context, nextLoad) {
  // The attribute has to be present when the module is loaded, not only when
  // it is resolved, so it is set again here.
  if (url.endsWith(".json")) {
    return nextLoad(url, {
      ...context,
      format: "json",
      importAttributes: { type: "json" },
    });
  }
  return nextLoad(url, context);
}
