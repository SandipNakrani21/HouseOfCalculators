"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ADSENSE_PUBLISHER_ID } from "@/config/adsense";
import { ANALYTICS_ON } from "@/config/analytics";
import { useLocale } from "@/lib/locale-context";
import { clearConsent, readConsent, readConsentRecord, CONSENT_LIFETIME_MS, storeConsent, type ConsentChoice } from "@/lib/preferences";
import { clearAnalyticsCookies, publishConsent, type ConsentPurposes } from "@/lib/consent-state";
const CONFIGURED = Boolean(ADSENSE_PUBLISHER_ID) || ANALYTICS_ON;
const PRIVACY_EVENT = "hoc:privacy-choices";
const COPY = ANALYTICS_ON
  ? { title: "consent.titleWithStats", body: "consent.bodyWithStats", accept: "consent.acceptWithStats", reject: "consent.rejectWithStats" }
  : { title: "consent.title", body: "consent.body", accept: "consent.accept", reject: "consent.reject" };
type TCData = { gdprApplies?: boolean; listenerId?: number; eventStatus?: string };
type GoogleConsentValues = {
  adStoragePurposeConsentStatus?: number;
  adUserDataPurposeConsentStatus?: number;
  adPersonalizationPurposeConsentStatus?: number;
  analyticsStoragePurposeConsentStatus?: number;
};
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __tcfapi?: (command: string, version: number, callback: (data: TCData | null, success: boolean) => void, parameter?: number) => void;
    googlefc?: {
      callbackQueue?: { push: (entry: Record<string, () => void>) => unknown };
      showRevocationMessage?: () => void;
      getGoogleConsentModeValues?: () => GoogleConsentValues;
    };
  }
}
/** Unknown stays unknown: a missing or late CMP is never evidence of geography. */
export function useGoogleConsentApplies(enabled: boolean): "pending" | boolean {
  const [applies, setApplies] = useState<"pending" | boolean>("pending");
  useEffect(() => {
    if (!enabled) return;
    let stopped = false, registered = false;
    let listenerId: number | undefined;
    let timer: number | undefined;
    const syncPurposes = () => {
      if (stopped) return;
      let values: GoogleConsentValues | undefined;
      try { values = window.googlefc?.getGoogleConsentModeValues?.(); }
      catch { update("denied"); return; }
      if (!values) { update("denied"); return; }
      // Only explicit GRANTED(1)/DENIED(2) values are consent decisions.
      // UNKNOWN, NOT_APPLICABLE and NOT_CONFIGURED never imply a grant.
      const entries = [
        ["ad_storage", values.adStoragePurposeConsentStatus],
        ["ad_user_data", values.adUserDataPurposeConsentStatus],
        ["ad_personalization", values.adPersonalizationPurposeConsentStatus],
        ["analytics_storage", values.analyticsStoragePurposeConsentStatus],
      ] as const;
      if (!entries.some(([, value]) => value === 1 || value === 2)) {
        const denied: ConsentPurposes = { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" };
        window.gtag?.("consent", "update", denied);
        publishConsent(denied, false);
        clearAnalyticsCookies();
        return;
      }
      const purposes = Object.fromEntries(entries.map(([key, value]) =>
        [key, value === 1 ? "granted" : "denied"])) as ConsentPurposes;
      window.gtag?.("consent", "update", purposes);
      publishConsent(purposes);
      if (purposes.analytics_storage === "denied") clearAnalyticsCookies();
    };
    const register = () => {
      if (registered || !window.__tcfapi) return;
      registered = true;
      // The listener and callback queue handle later CMP changes. Poll only
      // while waiting for the API, rather than waking every 250 ms forever.
      window.clearInterval(timer);
      window.__tcfapi("addEventListener", 2, (data, success) => {
        if (stopped) return;
        listenerId = data?.listenerId;
        if (success && typeof data?.gdprApplies === "boolean") {
          setApplies(data.gdprApplies);
          if (data.gdprApplies) {
            clearConsent();
            // Consent Mode can update again after each TCF user action.
            window.googlefc?.callbackQueue?.push({ CONSENT_MODE_DATA_READY: syncPurposes });
            if (["tcloaded", "useractioncomplete"].includes(data.eventStatus ?? "")) {
              // AdSense itself interprets the TCF string for limited ads.
              // Analytics still requires its own explicit purpose grant.
              if (!window.googlefc?.getGoogleConsentModeValues) update("denied");
            }
          }
        }
      });
    };
    window.googlefc = window.googlefc ?? {};
    const queue = window.googlefc.callbackQueue ?? ([] as Record<string, () => void>[]);
    window.googlefc.callbackQueue = queue;
    queue.push({ CONSENT_API_READY: register });
    queue.push({ CONSENT_MODE_DATA_READY: syncPurposes });
    register();
    if (!registered) timer = window.setInterval(register, 250);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      if (listenerId !== undefined) window.__tcfapi?.("removeEventListener", 2, () => {}, listenerId);
    };
  }, [enabled]);
  return applies;
}
function update(choice: ConsentChoice) {
  const purposes: ConsentPurposes = {
    ad_storage: choice, ad_user_data: choice, ad_personalization: choice, analytics_storage: choice,
  };
  window.gtag?.("consent", "update", purposes);
  publishConsent(purposes);
  if (choice === "denied") clearAnalyticsCookies();
}
/** Only an authoritative outside-TCF response enables the local choice path. */
export function ConsentBanner() {
  const { t, base } = useLocale();
  const applies = useGoogleConsentApplies(CONFIGURED);
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  useEffect(() => {
    if (applies !== false) return;
    const stored = readConsent();
    if (stored) update(stored);
    // UI state follows an external CMP response and cookie snapshot.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoice(stored);
  }, [applies]);
  useEffect(() => {
    if (applies !== false) return;
    let timer: number | undefined;
    const refresh = () => {
      window.clearTimeout(timer);
      const record = readConsentRecord();
      if (!record) {
        update("denied");
        setChoice(null);
        return;
      }
      // Recheck at expiry even if the visitor leaves this tab open for days.
      // Browsers cap a single timeout at roughly 24 days.
      const remaining = record.at + CONSENT_LIFETIME_MS - Date.now() + 1;
      timer = window.setTimeout(refresh, Math.min(remaining, 2_147_483_647));
    };
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [applies, choice]);
  useEffect(() => {
    const manage = () => {
      if (applies === true && window.googlefc?.showRevocationMessage && window.googlefc.callbackQueue) {
        // Use Google's supported asynchronous API; keep a fallback if blocked.
        update("denied");
        window.googlefc.callbackQueue.push({ CONSENT_API_READY: () => window.googlefc?.showRevocationMessage?.() });
        return;
      }
      setOpen(true);
    };
    window.addEventListener(PRIVACY_EVENT, manage);
    return () => window.removeEventListener(PRIVACY_EVENT, manage);
  }, [applies]);
  if (!CONFIGURED || (!open && (applies !== false || choice !== null))) return null;
  const choose = (next: ConsentChoice) => {
    if (next === "granted" && applies !== false) return;
    update(next);
    if (applies === false) storeConsent(next); else clearConsent();
    setChoice(next);
    setOpen(false);
  };
  return <div role="dialog" aria-modal="false" aria-labelledby="consent-title" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface shadow-lg">
    <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
      <div><h2 id="consent-title" className="text-sm font-semibold text-heading">{t(COPY.title)}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{t(applies !== false ? "consent.unavailable" : COPY.body)}{" "}<Link href={`${base}/privacy`} className="text-primary underline underline-offset-2">{t("legal.privacy.title")}</Link>{" · "}<Link href={`${base}/cookies`} className="text-primary underline underline-offset-2">{t("consent.learnMore")}</Link>{" · "}<a href="https://business.safety.google/privacy/" className="text-primary underline underline-offset-2">{t("legal.link.googlePrivacy")}</a></p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => choose("denied")} className="btn btn-outline btn-md">{t(COPY.reject)}</button>
        {applies === false ? <button type="button" onClick={() => choose("granted")} className="btn btn-primary btn-md">{t(COPY.accept)}</button> : null}
        {open ? <button type="button" onClick={() => setOpen(false)} className="btn btn-outline btn-md">{t("common.close")}</button> : null}
      </div>
    </div>
  </div>;
}
export function PrivacyChoices({ className = "" }: { className?: string }) {
  const { t } = useLocale();
  if (!CONFIGURED) return null;
  return <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(PRIVACY_EVENT))}>{t("consent.manage")}</button>;
}
