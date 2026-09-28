"use client";

import { ArrowRight, SearchX } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { useLocale } from "@/lib/locale-context";

/**
 * Locale-scoped 404. It cannot read params, but it renders inside the locale
 * layout, so the page's own dictionary is available through `useLocale` and
 * the copy is in the visitor's language. The link goes to that locale's home.
 */
export default function NotFound() {
  const { t, base } = useLocale();
  return (
    <div className="container-prose py-24 text-center">
      <span aria-hidden className="tile tone-blue animate-pop mx-auto h-20 w-20 rounded-full">
        <SearchX className="h-9 w-9" />
      </span>
      <h1 className="animate-rise mt-6 text-h1">{t("error.notFound")}</h1>
      <p className="animate-fade-up mx-auto mt-3 max-w-md text-muted">{t("error.notFoundBody")}</p>
      <ButtonLink href={base} variant="primary" size="lg" iconEnd={<ArrowRight />} className="mt-8">
        {t("nav.home")}
      </ButtonLink>
    </div>
  );
}
