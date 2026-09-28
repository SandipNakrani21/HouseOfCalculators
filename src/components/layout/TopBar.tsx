"use client";

import { CountrySelector } from "@/components/navigation/CountrySelector";
import { LocaleSelector } from "@/components/navigation/LocaleSelector";
import type { LocaleCode } from "@/config/locales";
import { useLocale } from "@/lib/locale-context";

/**
 * The thin navy strip above the header: the site's disclaimer, marked with a
 * red asterisk fixed at the start edge, floating across the full width as a
 * continuous line, and at the end the language and country pickers. It pauses under the
 * pointer and stands still (wrapping instead) under reduced motion.
 *
 * The text is in the track twice so the loop is seamless; the copy is hidden
 * from assistive technology, which reads it once.
 */
export function TopBar({ ready }: { ready: LocaleCode[] }) {
  const { t } = useLocale();
  const text = t("footer.disclaimer", { app: t("app.name") });

  const line = (copy: boolean) => (
    <span aria-hidden={copy ? true : undefined} className="shrink-0 whitespace-nowrap pe-24 motion-reduce:whitespace-normal">
      {text}
    </span>
  );

  return (
    <div className="bg-navy text-white">
      {/* The header's own container, so the pickers' right edge lines up
          with the header's search field at every width. */}
      <div className="container-page flex items-center [--container:var(--container-xwide)]">
        {/* The asterisk stays put at the start edge while the line scrolls past it. */}
        <span aria-hidden className="relative z-10 shrink-0 bg-navy pe-2 text-base font-bold leading-none text-alert-on-navy">
          *
        </span>
        <div className="marquee min-w-0 flex-1 py-2 text-[0.75rem] font-semibold leading-snug sm:text-[0.8125rem]">
          <p className="marquee-track">
            {line(false)}
            {line(true)}
          </p>
        </div>
        {/* Language, then country: white dropdowns on the navy bar. */}
        <div className="relative z-10 flex shrink-0 items-center gap-2 bg-navy py-2 ps-3 sm:gap-3 sm:py-2.5">
          <LocaleSelector ready={ready} size="sm" />
          <CountrySelector flagOnly size="sm" />
        </div>
      </div>
    </div>
  );
}
