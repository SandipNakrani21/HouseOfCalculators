"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { ADSENSE_PUBLISHER_ID } from "@/config/adsense";
import { useLocale } from "@/lib/locale-context";
import { readConsent, storeConsent, type ConsentChoice } from "@/lib/preferences";

const CLIENT_ID = ADSENSE_PUBLISHER_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    /** IAB TCF v2 API, installed by Google's consent message (AdSense Privacy & messaging). */
    __tcfapi?: (
      command: string,
      version: number,
      callback: (data: { gdprApplies?: boolean } | null, success: boolean) => void,
    ) => void;
  }
}

/** How long to wait for Google's consent tool before deciding it is not there. */
const TCF_WAIT_MS = 4000;

/**
 * Whether Google's certified consent message covers this visitor. Google
 * shows it to visitors in the EEA, the UK and Switzerland and reports that
 * through the TCF API as gdprApplies. "pending" until it answers.
 */
function useGoogleConsentApplies(enabled: boolean): "pending" | boolean {
  // Always starts pending: during hydration `enabled` is still false (the
  // consent cookie is only read on the client), and starting at false would
  // flash the banner up before Google has answered.
  const [applies, setApplies] = useState<"pending" | boolean>("pending");

  useEffect(() => {
    if (!enabled) return;
    let done = false;
    const settle = (value: boolean) => {
      if (done) return;
      done = true;
      setApplies(value);
    };
    const ask = () => {
      window.__tcfapi?.("ping", 2, (data) => {
        if (typeof data?.gdprApplies === "boolean") settle(data.gdprApplies);
      });
    };
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (done) return window.clearInterval(timer);
      if (window.__tcfapi) ask();
      // No consent tool (ad blocker, script not loaded): our banner is the fallback.
      if (Date.now() - started > TCF_WAIT_MS) settle(false);
    }, 250);
    return () => {
      done = true;
      window.clearInterval(timer);
    };
  }, [enabled]);

  return applies;
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
 *
 * Not shown where Google's certified consent message applies (EEA, UK,
 * Switzerland): Google asks there, as its ad policy requires, and this banner
 * covers everyone else.
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
  // Visitors covered by Google's certified message (EEA, UK, Switzerland)
  // answer there; showing this banner too would ask them twice.
  const googleApplies = useGoogleConsentApplies(Boolean(CLIENT_ID) && !stored);

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

  if (!CLIENT_ID || stored || answered || googleApplies !== false) return null;

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
