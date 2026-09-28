import type { Instrumentation } from "next";

/**
 * Server error logging.
 *
 * Every error Next captures on the server (rendering, route handlers, the
 * proxy) is written as one JSON line to stderr, which any host collects into
 * its log stream; point that stream at an alerting service to monitor it.
 *
 * Deliberately left out: request headers (cookies), the query string (a share
 * link carries a visitor's own figures) and the stack trace beyond its first
 * frames. The `digest` is the same reference the error page shows a visitor,
 * so a report can be matched to its log line.
 */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  const err = error instanceof Error ? error : new Error(String(error));
  const digest =
    typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : undefined;

  console.error(
    JSON.stringify({
      level: "error",
      time: new Date().toISOString(),
      digest,
      message: err.message.slice(0, 500),
      stack: err.stack?.split("\n").slice(0, 6).join("\n"),
      method: request.method,
      path: request.path.split("?")[0],
      route: context.routePath,
      type: context.routeType,
    }),
  );
};
