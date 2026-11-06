"use client";

import { useEffect, useState } from "react";
import { AdsterraChoices } from "@/components/consent/Adsterra";
import { Modal } from "@/components/ui/Modal";
import { ADSTERRA_ENABLED } from "@/config/adsterra";
import { ANALYTICS_ON } from "@/config/analytics";
import { clearAnalyticsCookies, publishConsent, useConsentState } from "@/lib/consent-state";
import { useLocale } from "@/lib/locale-context";
import { CONSENT_LIFETIME_MS, readConsentRecord, storeConsent, type ConsentChoice } from "@/lib/preferences";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const ANALYTICS_CHOICE_EVENT = "hoc:analytics-choice";

export function AnalyticsConsent() {
  useEffect(() => {
    if (!ANALYTICS_ON) return;
    let timer: number | undefined;
    const refresh = () => {
      window.clearTimeout(timer);
      const record = readConsentRecord();
      const analytics = record?.choice ?? "denied";
      const purposes = {
        ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: analytics,
      } as const;
      window.gtag?.("consent", "update", purposes);
      publishConsent(purposes, Boolean(record));
      if (analytics === "denied") clearAnalyticsCookies();
      if (record) {
        const remaining = record.at + CONSENT_LIFETIME_MS - Date.now() + 1;
        timer = window.setTimeout(refresh, Math.min(remaining, 2_147_483_647));
      }
    };
    refresh();
    window.addEventListener(ANALYTICS_CHOICE_EVENT, refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(ANALYTICS_CHOICE_EVENT, refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return null;
}

export function PrivacyChoices({ className = "" }: { className?: string }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const consent = useConsentState();
  const label = t("consent.manage");
  const chooseAnalytics = (choice: ConsentChoice) => {
    storeConsent(choice);
    window.dispatchEvent(new Event(ANALYTICS_CHOICE_EVENT));
  };
  if (!ANALYTICS_ON && !ADSTERRA_ENABLED) return null;
  return <>
    <button type="button" className={className} onClick={() => setOpen(true)}>{label}</button>
    <Modal open={open} onClose={() => setOpen(false)} label={label} title={label} closeLabel={t("common.close")}>
      <AdsterraChoices />
      {ANALYTICS_ON ? <section className="text-sm text-muted">
        <h3 className="font-semibold text-heading">{t("legal.cookies.analytics.title")}</h3>
        <p className="my-3">{t("legal.cookies.analytics.1")}</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-outline btn-md" aria-pressed={consent.ready && consent.purposes.analytics_storage === "denied"} onClick={() => chooseAnalytics("denied")}>{t("consent.rejectWithStats")}</button>
          <button type="button" className="btn btn-outline btn-md" aria-pressed={consent.ready && consent.purposes.analytics_storage === "granted"} onClick={() => chooseAnalytics("granted")}>{t("consent.acceptWithStats")}</button>
        </div>
      </section> : null}
    </Modal>
  </>;
}
