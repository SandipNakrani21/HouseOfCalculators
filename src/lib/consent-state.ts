"use client";

import { useSyncExternalStore } from "react";

export type ConsentPurposes = {
  ad_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
  analytics_storage: "granted" | "denied";
};
const denied: ConsentPurposes = {
  ad_storage: "denied", ad_user_data: "denied",
  ad_personalization: "denied", analytics_storage: "denied",
};
const initial = { ready: false, purposes: denied };
let current = initial;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

/** A verified CMP response or an explicit outside-TCF choice, never a timeout. */
export function publishConsent(purposes: ConsentPurposes, ready = true) {
  if (current.ready === ready && Object.keys(denied).every(key =>
    current.purposes[key as keyof ConsentPurposes] === purposes[key as keyof ConsentPurposes])) return;
  current = { ready, purposes };
  listeners.forEach(listener => listener());
}

export function useConsentState() {
  return useSyncExternalStore(subscribe, () => current, () => initial);
}

/** Revocation removes only this site's GA cookies, including domain cookies. */
export function clearAnalyticsCookies() {
  const names = document.cookie.split(";").map(cookie => cookie.trim().split("=")[0])
    .filter(name => /^_ga(?:_|$)/.test(name));
  const host = window.location.hostname.split(".");
  for (const name of names) {
    document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
    for (let i = 0; i < host.length - 1; i++) {
      document.cookie = `${name}=; path=/; domain=${host.slice(i).join(".")}; max-age=0; samesite=lax`;
    }
  }
}
