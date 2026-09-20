import Link from "next/link";

/** The one card used by every grid on the site, so sections look like one product. */
export function ContentCard({
  href,
  icon,
  title,
  description,
  meta,
}: {
  href: string;
  icon: string;
  title: string;
  description?: string;
  /** Small line above the title, e.g. a category name. */
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-card)]"
    >
      <span aria-hidden className="text-2xl">
        {icon}
      </span>
      {meta ? (
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
          {meta}
        </span>
      ) : null}
      <span className="text-base font-semibold text-heading group-hover:text-primary">
        {title}
      </span>
      {description ? (
        <span className="text-sm leading-relaxed text-muted">{description}</span>
      ) : null}
    </Link>
  );
}

export function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
