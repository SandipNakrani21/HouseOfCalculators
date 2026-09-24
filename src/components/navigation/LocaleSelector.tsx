"use client";

import { usePathname, useRouter } from "next/navigation";

import { Globe } from "lucide-react";

import { Dropdown } from "@/components/shared/Dropdown";
import { LOCALES, type LocaleCode } from "@/config/locales";
import { useLocale } from "@/lib/locale-context";
import { storeLocale } from "@/lib/preferences";
import { swapLocale } from "@/lib/routes";

/**
 * Language selector. Deliberately separate from the country selector: reading
 * in English while calculating for Germany is a supported combination, so
 * collapsing the two into one control would misrepresent what they do.
 */
export function LocaleSelector({ ready }: { ready: LocaleCode[] }) {
  const { t, localeCode } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const launch = ready.filter((code) => LOCALES[code].launch);
  const additional = ready.filter((code) => !LOCALES[code].launch);

  const choose = (next: LocaleCode, close: () => void) => {
    storeLocale(next);
    close();
    // Same logical page, different locale prefix - a client navigation, so
    // the visitor keeps their scroll position and the app shell is not reloaded.
    router.push(swapLocale(pathname, next));
  };

  const option = (code: LocaleCode, close: () => void) => {
    const locale = LOCALES[code];
    const active = code === localeCode;
    return (
      <li key={code}>
        <button
          type="button"
          lang={locale.language}
          dir={locale.dir}
          onClick={() => choose(code, close)}
          aria-current={active ? "true" : undefined}
          className={`flex w-full flex-col rounded-lg px-3 py-2 text-start transition-colors ${
            active
              ? "bg-primary-soft text-primary"
              : "text-foreground hover:bg-surface-muted"
          }`}
        >
          <span className="text-sm font-medium">{locale.native}</span>
          <span className="text-xs text-muted" dir="ltr">
            {locale.code}
          </span>
        </button>
      </li>
    );
  };

  return (
    <Dropdown
      label={t("header.language")}
      trigger={
        <>
          <Globe aria-hidden className="h-4 w-4 text-primary" strokeWidth={2} />
          {/* Icon only on phones, where the name would wrap and push the
              menu button off-screen; the trigger's aria-label names it. */}
          <span className="hidden whitespace-nowrap font-medium text-foreground sm:inline">
            {LOCALES[localeCode].native}
          </span>
        </>
      }
    >
      {(close) => (
        <>
          <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted">
            {t("header.language")}
          </p>
          <ul>{launch.map((code) => option(code, close))}</ul>
          {additional.length ? (
            <>
              <p className="mt-1 border-t border-border px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted">
                {t("header.moreLanguages")}
              </p>
              <ul>{additional.map((code) => option(code, close))}</ul>
            </>
          ) : null}
        </>
      )}
    </Dropdown>
  );
}
