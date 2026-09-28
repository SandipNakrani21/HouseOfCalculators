"use client";

import { ArrowRight, RotateCcw, TriangleAlert } from "lucide-react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { useLocale } from "@/lib/locale-context";

/**
 * What a visitor sees if a page throws. It never shows the error itself:
 * in production React replaces server error messages with a `digest`, and
 * that opaque reference is all this page repeats, so a report can be matched
 * to the server log (instrumentation.ts) without exposing anything.
 */
export default function PageError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { t, base } = useLocale();

  return (
    <div className="container-prose py-24 text-center">
      <span aria-hidden className="tile tone-rose animate-pop mx-auto h-20 w-20 rounded-full">
        <TriangleAlert className="h-9 w-9" />
      </span>
      <h1 className="animate-rise mt-6 text-h1">{t("error.title")}</h1>
      <p className="animate-fade-up mx-auto mt-3 max-w-md text-muted">{t("error.body")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="primary" size="lg" onClick={() => retry()} icon={<RotateCcw />}>
          {t("error.retry")}
        </Button>
        <ButtonLink href={base} variant="outline" size="lg" iconEnd={<ArrowRight />}>
          {t("nav.home")}
        </ButtonLink>
      </div>
      {error.digest ? (
        <p className="mt-6 text-xs text-subtle">{t("error.reference", { digest: error.digest })}</p>
      ) : null}
    </div>
  );
}
