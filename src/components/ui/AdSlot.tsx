"use client";

import { useEffect, useRef, useState } from "react";

import { ADSENSE_CLIENT, ADS_LIVE, AD_PLACEHOLDERS, AD_UNITS, type AdPlacement } from "@/lib/ads";
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

type Placement = AdPlacement;

/**
 * The shape AdSense may fill each position with. "auto" lets it put a
 * near-square 728×280 in a banner position; naming the shape keeps banners
 * wide and the rail tall.
 */
const AD_FORMAT: Record<Placement, string> = {
  leaderboard: "horizontal",
  rectangle: "rectangle",
  rail: "vertical",
};

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
  /** Where on the site this is (shown on placeholders). The AdSense unit comes from the placement. */
  slot: string;
  placement?: Placement;
  className?: string;
}) {
  const { t } = useLocale();
  const pushed = useRef(false);
  const slotRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const unit = AD_UNITS[placement];
  const live = ADS_LIVE && /^\d+$/.test(unit);

  // Some positions are for one screen size only (the sidebar on desktop, the
  // rectangle under a calculator on phones). adsbygoogle.push() fills the
  // first unfilled <ins> in the page, not a particular one, so a hidden <ins>
  // would swallow another position's request and fail with "No slot size for
  // availableWidth=0". The <ins> is therefore only rendered once its position
  // has a width; the observer catches a position that appears later.
  useEffect(() => {
    const el = slotRef.current;
    if (!live || !el) return;
    const check = () => {
      if (el.offsetWidth > 0) setVisible(true);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [live]);

  // With the <ins> now in the page, this request can only fill it.
  useEffect(() => {
    if (!visible || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // A blocked or failed ad script must never break the page.
    }
  }, [visible]);

  if (!live && !AD_PLACEHOLDERS) return null;

  return (
    <aside aria-label={t("ads.label")} className={`ad-wrap my-8 flex flex-col items-center gap-1 ${className}`}>
      <span className="text-[0.625rem] font-semibold uppercase tracking-widest text-subtle">{t("ads.label")}</span>
      {live ? (
        <div ref={slotRef} className={`ad-slot ad-${placement}`}>
          {visible ? (
          <ins
            className="adsbygoogle block w-full"
            style={{ display: "block" }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={unit}
            data-ad-format={AD_FORMAT[placement]}
            // Full-width mode would stretch a phone banner into a 390×390 square;
            // only the rectangle may grow to the screen width.
            data-full-width-responsive={placement === "rectangle" ? "true" : "false"}
          />
          ) : null}
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
