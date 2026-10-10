"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ADSENSE_PUBLISHER_ID } from "@/config/adsense";
import { ANALYTICS_ON } from "@/config/analytics";
import { useLocale } from "@/lib/locale-context";
import { clearConsent, readConsent, storeConsent, type ConsentChoice } from "@/lib/preferences";
const CONFIGURED = Boolean(ADSENSE_PUBLISHER_ID) || ANALYTICS_ON;
const PRIVACY_EVENT = "hoc:privacy-choices";
const COPY = ANALYTICS_ON
  ? { title: "consent.titleWithStats", body: "consent.bodyWithStats", accept: "consent.acceptWithStats", reject: "consent.rejectWithStats" }
  : { title: "consent.title", body: "consent.body", accept: "consent.accept", reject: "consent.reject" };
type TCData = { gdprApplies?: boolean; listenerId?: number };
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __tcfapi?: (command: string, version: number, callback: (data: TCData | null, success: boolean) => void, parameter?: number) => void;
    googlefc?: { showRevocationMessage?: () => void };
  }
}
/** Unknown stays unknown: a missing or late CMP is never evidence of geography. */
export function useGoogleConsentApplies(enabled: boolean): "pending" | boolean {
  const [applies, setApplies] = useState<"pending" | boolean>("pending");
  useEffect(() => {
    if (!enabled) return;
    let stopped = false, registered = false;
    let listenerId: number | undefined;
    const register = () => {
      if (registered || !window.__tcfapi) return;
      registered = true;
      window.__tcfapi("addEventListener", 2, (data, success) => {
        if (stopped) return;
        listenerId = data?.listenerId;
        if (success && typeof data?.gdprApplies === "boolean") setApplies(data.gdprApplies);
      });
    };
    register();
    const timer = window.setInterval(register, 250);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      if (listenerId !== undefined) window.__tcfapi?.("removeEventListener", 2, () => {}, listenerId);
    };
  }, [enabled]);
  return applies;
}
function update(choice: ConsentChoice) {
  window.gtag?.("consent", "update", {
    ad_storage: choice, ad_user_data: choice, ad_personalization: choice, analytics_storage: choice,
  });
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
    const manage = () => {
      if (applies === true && window.googlefc?.showRevocationMessage) {
        window.googlefc.showRevocationMessage();
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
        <p className="mt-1 text-sm leading-relaxed text-muted">{t(applies !== false ? "consent.unavailable" : COPY.body)}{" "}<Link href={`${base}/cookies`} className="text-primary underline underline-offset-2">{t("consent.learnMore")}</Link></p>
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
