"use client";

import { useLocale } from "@/lib/locale-context";

export function SiteFooter() {
  const { t } = useLocale();

  return (
    <footer className="mt-16 border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 sm:px-6">
        <p className="max-w-3xl text-xs leading-relaxed text-muted">
          {t("footer.disclaimer")}
        </p>
        <p className="text-xs text-muted">
          {t("footer.rights", {
            year: new Date().getFullYear(),
            app: t("app.name"),
          })}
        </p>
      </div>
    </footer>
  );
}
