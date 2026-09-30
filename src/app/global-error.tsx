"use client";

import Link from "next/link";

/**
 * Last-resort error page, for a failure in the root layout itself. It
 * replaces the whole document and deliberately loads no stylesheet: importing
 * the site CSS here makes every page preload an unused second copy of it, for
 * a page that should never appear. So it is plain, readable HTML with layout
 * only (no colours outside the design tokens), in English, because the locale
 * and its dictionary live in the layout that just broke. Like the page-level
 * boundary, it shows only the opaque `digest`, never the error.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
        <title>Something went wrong | The Calculators House</title>
        <main style={{ maxWidth: 448 }}>
          <h1>Something went wrong</h1>
          <p>An unexpected problem stopped the site from loading. Nothing you entered has left your device.</p>
          <p style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={() => retry()}>
              Try again
            </button>
            <Link href="/">Home page</Link>
          </p>
          {error.digest ? <p><small>Reference: {error.digest}</small></p> : null}
        </main>
      </body>
    </html>
  );
}
