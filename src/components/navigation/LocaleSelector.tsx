"use client";

import { Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Select, type SelectOption } from "@/components/ui/Select";
import { LOCALES, type LocaleCode } from "@/config/locales";
import { useLocale } from "@/lib/locale-context";
import { storeLocale } from "@/lib/preferences";
import { swapLocale } from "@/lib/routes";

/** Every ready language as a dropdown option, in its own script. */
export function localeOptions(ready: LocaleCode[]): SelectOption<LocaleCode>[] {
  return ready.map((code) => ({
    value: code,
    label: LOCALES[code].native,
    hint: LOCALES[code].code,
    lang: LOCALES[code].language,
    dir: LOCALES[code].dir,
  }));
}

/**
 * Language selector. Deliberately separate from the country selector: reading
 * in English while calculating for Germany is a supported combination, so
 * collapsing the two into one control would misrepresent what they do.
 */
export function LocaleSelector({
  ready,
  size = "md",
  compact = false,
}: {
  ready: LocaleCode[];
  size?: "sm" | "md" | "lg" | "xl";
  /** In the header: icon only from xl, where the sections share the row. */
  compact?: boolean;
}) {
  const { t, localeCode } = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const choose = (next: LocaleCode) => {
    if (next === localeCode) return;
    storeLocale(next);
    // Same logical page, different locale prefix - a client navigation, so
    // the visitor keeps their place and the app shell is not reloaded.
    router.push(swapLocale(pathname, next));
  };

  return (
    <Select
      variant="pill"
      size={size}
      align="end"
      menuWidth={220}
      label={t("header.language")}
      value={localeCode}
      onChange={choose}
      options={localeOptions(ready)}
      trigger={(selected) => (
        <>
          <Globe aria-hidden className={`h-4 w-4 shrink-0 text-primary ${size === "xl" ? "xl:h-5 xl:w-5" : ""}`} />
          {/* Icon only on phones, where the name would push the menu button
              off-screen; the trigger's aria-label names it. */}
          <span
            className={`hidden whitespace-nowrap font-semibold text-heading sm:inline ${compact ? "xl:hidden!" : ""}`}
          >
            {selected?.label}
          </span>
        </>
      )}
    />
  );
}
