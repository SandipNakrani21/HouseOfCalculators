"use client";

import Link from "next/link";
import { useCallback, useState, useSyncExternalStore } from "react";

import { useLocale } from "@/lib/locale-context";
import { readConsent, storeConsent, type ConsentChoice } from "@/lib/preferences";

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** The cookie only changes when this component writes it, so nothing to subscribe to. */
const subscribe = () => () => {};

/**
 * The advertising consent banner.
 *
 * It asks about advertising cookies only. The two preference cookies are
 * strictly functional - they remember the language and country you chose and
 * identify nobody - so gating them behind consent would be asking permission
 * for something that needs none, and would make the banner look like theatre.
 *
 * Shown only when advertising is actually configured. With no publisher id
 * there are no advertising cookies, so there is nothing to ask about and a
 * banner would be a lie.
 */
export function ConsentBanner() {
  const { t, base } = useLocale();

  // The cookie is read through an external store rather than an effect, the
  // same way the country preference is, so the pages stay static and the
  // banner never flashes up for someone who already answered. The server
  // snapshot says "answered" so nothing renders in the HTML.
  const stored = useSyncExternalStore(
    subscribe,
    () => readConsent() !== null,
    () => true,
  );
  const [answered, setAnswered] = useState(false);

  const choose = useCallback((choice: ConsentChoice) => {
    storeConsent(choice);
    const state = choice === "granted" ? "granted" : "denied";
    window.gtag?.("consent", "update", {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
      analytics_storage: state,
    });
    setAnswered(true);
  }, []);

  if (!CLIENT_ID || stored || answered) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface shadow-lg"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 id="consent-title" className="text-sm font-semibold text-heading">
            {t("consent.title")}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {t("consent.body")}{" "}
            <Link href={`${base}/cookies`} className="text-primary underline underline-offset-2">
              {t("consent.learnMore")}
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {/* Reject comes first and carries equal visual weight. A banner
              where refusing is harder than accepting is a dark pattern. */}
          <button
            type="button"
            onClick={() => choose("denied")}
            className="btn btn-outline btn-md"
          >
            {t("consent.reject")}
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="btn btn-primary btn-md"
          >
            {t("consent.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
