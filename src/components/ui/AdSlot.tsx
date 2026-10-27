"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { isAdEligiblePath } from "@/config/ad-inventory";

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
 * The slot reserves a minimum height before an ad arrives to reduce layout
 * movement without limiting a responsive creative's height. It is
 * labelled and set apart from calculator controls; without a publisher id it renders a labelled placeholder in
 * development and nothing at all in production (see lib/ads.ts).
 */

type Placement = AdPlacement;

const SIZE_LABEL: Record<Placement, string> = {
  leaderboard: "728 × 90",
  rectangle: "300 × 250",
  rail: "300 × 600",
};

declare global {
  interface Window {
    adsbygoogle?: unknown[] & { pauseAdRequests?: number; requestNonPersonalizedAds?: number };
  }
}

type AdSlotProps = {
  slot: string;
  placement?: Placement;
  className?: string;
  preview?: boolean;
};

export function AdSlot(props: AdSlotProps) {
  const pathname = usePathname();
  // A new page owns new ad nodes; never reuse a filled node across routes.
  return <AdPosition key={pathname} {...props} pathname={pathname} />;
}

function AdPosition({
  slot,
  placement = "rectangle",
  className = "",
  preview = false,
  pathname,
}: AdSlotProps & { pathname: string | null }) {
  const { t } = useLocale();
  const pushed = useRef(false);
  const slotRef = useRef<HTMLDivElement>(null);
  const [requestWidth, setRequestWidth] = useState(0);
  const [active, setActive] = useState(false);
  const positionId = `ad_${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const unit = AD_UNITS[placement];
  const live = !preview && isAdEligiblePath(pathname) && ADS_LIVE && /^\d+$/.test(unit);

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
      const usable = document.visibilityState !== "hidden" && el.offsetWidth >= 250;
      setActive(usable);
      // Keep the original request's available width. A later smaller layout
      // must hide the whole position, not squeeze/crop a retained creative.
      // clientWidth rounds fractional layout widths up (704.67px becomes
      // 705px). That threshold would hide the creative in its original slot.
      // Use whole pixels that actually fit in this borderless container.
      if (usable) setRequestWidth(previous => previous || Math.floor(el.getBoundingClientRect().width));
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    document.addEventListener("visibilitychange", check);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", check); };
  }, [live]);

  // With the <ins> now in the page, this request can only fill it.
  useEffect(() => {
    if (!live || !requestWidth || !active || pushed.current || document.visibilityState === "hidden") return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // A blocked or failed ad script must never break the page.
    }
  }, [requestWidth, live, active]);

  if (!preview && (!isAdEligiblePath(pathname) || (!live && !AD_PLACEHOLDERS))) return null;

  return (
    <aside id={positionId} aria-label={t("ads.label")} className={`ad-wrap my-8 flex w-full flex-col items-center gap-1 ${className}`}>
      {/* Hide the entire retained position when its original width no longer
          fits. Keep reserved space, the same node and the single request. */}
      {live && requestWidth > 0 ? <style>{`@container ad-space (width < ${requestWidth}px) { #${positionId} > .ad-slot > .ad-creative { display: none; } }`}</style> : null}
      <span className="ad-label text-[0.625rem] font-semibold uppercase tracking-widest text-subtle">{t("ads.label")}</span>
      {live ? (
        <div ref={slotRef} className={`ad-slot ad-${placement}`} style={{ containerType: "inline-size", containerName: "ad-space" }}>
          {requestWidth > 0 ? (
            <div className="ad-creative">
              <ins
                className="adsbygoogle block w-full"
                style={{ display: "block", width: "100%", minWidth: 0, maxWidth: "100%" }}
                data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={unit}
                // Let Google's responsive code own the creative's dimensions.
                // The surrounding flow reserves space but never caps its height.
                data-ad-format={placement === "leaderboard" ? "horizontal" : placement === "rail" ? "vertical" : "rectangle"}
                data-full-width-responsive="false"
              />
            </div>
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
  // Google's published consent message is delivered by this tag, including
  // on policy pages. Slots are separately gated; exclude these pages in Auto ads too.
  if (!ADS_LIVE) return null;
  return (
    <script
      async
      // React hoists async scripts unless a load handler opts out. Preserve
      // document order: ConsentScript must execute before this tag can run.
      onLoad={() => { /* Intentionally retain this script's document position. */ }}
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
