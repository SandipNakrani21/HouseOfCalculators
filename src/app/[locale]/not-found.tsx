import Link from "next/link";

/**
 * Locale-scoped 404. It cannot read params, so the copy is English; the links
 * go to the site root and let the proxy send the visitor to their own locale.
 */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="text-5xl" aria-hidden>
        🔍
      </p>
      <h1 className="mt-4 text-xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-sm text-muted">
        The page you&apos;re looking for may have moved, or isn&apos;t offered in
        this country.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block btn-primary px-4 py-2.5 text-sm font-medium text-primary-contrast hover:bg-primary-hover"
      >
        Go to the home page
      </Link>
    </div>
  );
}
