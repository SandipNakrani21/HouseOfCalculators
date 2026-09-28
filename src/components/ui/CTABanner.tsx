import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";

/**
 * Full-width, rounded blue-gradient call to action: heading, a line of
 * subtext and a white button. Ends the homepage and every calculator page.
 */
export function CTABanner({
  title,
  body,
  cta,
  href,
  className = "",
}: {
  title: string;
  body: string;
  cta: string;
  href: string;
  className?: string;
}) {
  return (
    <section
      data-reveal="zoom"
      className={`bg-gradient-cta relative overflow-hidden rounded-xl px-6 py-10 text-white shadow-lift sm:px-12 ${className}`}
    >
      <div aria-hidden className="absolute -end-10 -top-16 h-56 w-56 rounded-full border-[28px] border-white/10" />
      <div aria-hidden className="absolute -bottom-20 end-40 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="text-h2 text-white">{title}</h2>
          <p className="mt-2 max-w-xl text-[0.8125rem] text-white/85 sm:text-sm">{body}</p>
        </div>
        <ButtonLink href={href} variant="white" size="lg" iconEnd={<ArrowRight />}>
          {cta}
        </ButtonLink>
      </div>
    </section>
  );
}
