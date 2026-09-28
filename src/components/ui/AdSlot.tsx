"use client";

import { useEffect, useRef } from "react";

import { ADSENSE_CLIENT, ADS_LIVE, AD_PLACEHOLDERS } from "@/lib/ads";
import { useLocale } from "@/lib/locale-context";

/**
 * One advertising position.
 *
 *   <AdSlot slot="calculator-mid" placement="rectangle" />
 *
 * Placements: `leaderboard` 728x90 (320x100 on phones), `rectangle` 300x250,
 * `rail` 300x600 for sidebars.
 *
 * Three things here are structural rather than cosmetic: the slot reserves its
 * height before an ad arrives, so filling it can never shift the page; it is
 * labelled and set apart, so it can never be mistaken for a calculator
 * control; and without a publisher id it renders a labelled placeholder in
 * development and nothing at all in production (see lib/ads.ts).
 */

type Placement = "leaderboard" | "rectangle" | "rail";

const SIZE_LABEL: Record<Placement, string> = {
  leaderboard: "728 × 90",
  rectangle: "300 × 250",
  rail: "300 × 600",
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({
  slot,
  placement = "rectangle",
  className = "",
}: {
  /** AdSense ad unit id. */
  slot: string;
  placement?: Placement;
  className?: string;
}) {
  const { t } = useLocale();
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADS_LIVE || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // A blocked or failed ad script must never break the page.
    }
  }, []);

  if (!ADS_LIVE && !AD_PLACEHOLDERS) return null;

  return (
    <aside aria-label={t("ads.label")} className={`my-8 flex flex-col items-center gap-1 ${className}`}>
      <span className="text-[0.625rem] font-semibold uppercase tracking-widest text-subtle">{t("ads.label")}</span>
      {ADS_LIVE ? (
        <div className={`ad-slot ad-${placement}`}>
          <ins
            className="adsbygoogle block w-full"
            style={{ display: "block" }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      ) : (
        <div className={`ad-slot ad-${placement} ad-placeholder`}>
          <span>
            Ad · {SIZE_LABEL[placement]} · {slot}
          </span>
        </div>
      )}
    </aside>
  );
}

/**
 * The AdSense loader. Rendered once in the layout, after interactive content,
 * so the calculator is usable before any advertising script is fetched.
 */
export function AdScript() {
  if (!ADS_LIVE) return null;
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
