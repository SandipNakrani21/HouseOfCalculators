"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { isAdEligiblePath } from "@/config/ad-inventory";
import { ADSTERRA_COOKIE, ADSTERRA_ENABLED, ADSTERRA_LIFETIME, parseAdsterraChoice } from "@/config/adsterra";
import copy from "@/config/adsterra-copy.json";
import { useLocale } from "@/lib/locale-context";

function readChoice() {
  const raw = document.cookie.split("; ").find(c => c.startsWith(`${ADSTERRA_COOKIE}=`))?.slice(ADSTERRA_COOKIE.length + 1);
  return parseAdsterraChoice(raw);
}

function stopFrame(frame: HTMLIFrameElement | null) {
  try {
    (frame?.contentWindow as (Window & { hocStopNative?: () => void }) | null)?.hocStopNative?.();
  } catch { /* A failed/blocked navigation may have no accessible document. */ }
}

/** Also present on privacy/cookie pages, where there is never an ad. */
export function AdsterraChoices() {
  const { language, t } = useLocale();
  const c = copy[language.code as keyof typeof copy] ?? copy.en;
  const [choice, setChoice] = useState<string | null>(null);
  useEffect(() => {
    const refresh = () => setChoice(readChoice());
    refresh();
    window.addEventListener("hoc:adsterra", refresh);
    return () => window.removeEventListener("hoc:adsterra", refresh);
  }, []);
  if (!ADSTERRA_ENABLED) return null;
  const choose = (next: string) => {
    document.cookie = `${ADSTERRA_COOKIE}=${encodeURIComponent(JSON.stringify({ vendor: "adsterra-v1", choice: next, at: Date.now() }))}; path=/; max-age=${ADSTERRA_LIFETIME / 1000}; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
    // Cookie failure must fail closed.
    window.dispatchEvent(new Event("hoc:adsterra"));
  };
  return <details className="container-page my-8 text-sm text-muted">
    <summary className="cursor-pointer underline">{c[1]}</summary>
    <p className="my-3 max-w-4xl">{c[4]} <a className="underline" href="https://adsterra.com/privacy-policy/" target="_blank" rel="noopener noreferrer">Adsterra: {t("legal.privacy.title")}</a></p>
    <div className="flex flex-wrap gap-3">
      <button className="btn btn-outline btn-md" aria-pressed={choice === "denied"} onClick={() => choose("denied")}>{c[3]}</button>
      <button className="btn btn-outline btn-md" aria-pressed={choice === "granted"} onClick={() => choose("granted")}>{c[2]}</button>
    </div>
  </details>;
}

export function AdsterraBanner() {
  const pathname = usePathname();
  return ADSTERRA_ENABLED && isAdEligiblePath(pathname) ? <Placement key={pathname} /> : null;
}
function Placement() {
  const { language } = useLocale();
  const c = copy[language.code as keyof typeof copy] ?? copy.en;
  const host = useRef<HTMLElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const attachFrame = useCallback((element: HTMLIFrameElement | null) => {
    frame.current = element;
    // Start only after this committed frame survives ref/lifecycle replay.
    // Cancelled mounts must never start an advertising document.
    const start = window.setTimeout(() => {
      if (element?.isConnected && readChoice() === "granted") element.src = "/api/adsterra-native";
    }, 0);
    // React 19 ref cleanup runs before the document is detached.
    return () => { clearTimeout(start); stopFrame(element); frame.current = null; };
  }, []);
  const [allowed, setAllowed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [height, setHeight] = useState(0);
  const [frameVersion, setFrameVersion] = useState(0);
  useEffect(() => {
    const refresh = () => {
      const granted = readChoice() === "granted";
      if (!granted) stopFrame(frame.current);
      setAllowed(granted);
    };
    refresh();
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener("hoc:adsterra", refresh);
    window.addEventListener("focus", refresh);
    const hide = () => stopFrame(frame.current);
    const show = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setFrameVersion(value => value + 1);
        refresh();
      }
    };
    window.addEventListener("pagehide", hide);
    window.addEventListener("pageshow", show);
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { setVisible(true); observer.disconnect(); }
    });
    if (host.current) observer.observe(host.current);
    const resize = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow || event.data?.type !== "hoc:native-size") return;
      const size = event.data.height;
      if (Number.isFinite(size) && size >= 0 && size <= 10000) setHeight(size);
    };
    window.addEventListener("message", resize);
    return () => {
      clearInterval(timer); observer.disconnect();
      window.removeEventListener("hoc:adsterra", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("pageshow", show);
      window.removeEventListener("message", resize);
    };
  }, []);
  return <aside ref={host} aria-label={c[0]} className="container-page my-12 border-t border-border pt-8">
    <p className="mb-3 text-center text-xs text-muted">{c[0]}</p>
    {allowed && visible ? <iframe key={frameVersion} ref={attachFrame} onLoad={event => {
      const element = event.currentTarget;
      try {
        const doc = element.contentDocument;
        // Non-sensitive delivery state also distinguishes an empty consent response
        // from a blocked vendor script when inspecting a collapsed placement.
        if (!element.dataset.adsterraState || element.dataset.adsterraState === "loading") {
          element.dataset.adsterraState = doc?.body?.dataset.adsterraState ?? "loading";
        }
        if (readChoice() !== "granted") { stopFrame(element); return; }
        if (doc?.querySelector('a')) setHeight(Math.ceil(doc.body.getBoundingClientRect().height));
      } catch { element.dataset.adsterraState = "unavailable"; }
    }} title={c[0]} sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin" className="w-full border-0" style={{ height, minHeight: 1 }} /> : null}
  </aside>;
}
