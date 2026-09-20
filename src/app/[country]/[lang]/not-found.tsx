import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="text-5xl" aria-hidden>
        🔍
      </p>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-2 text-sm text-muted">
        The calculator you&apos;re looking for may have moved or isn&apos;t
        offered in this country.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-contrast hover:bg-primary-hover"
      >
        Go to all calculators
      </Link>
    </div>
  );
}
