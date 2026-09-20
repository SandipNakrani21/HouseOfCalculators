"use client";

import { useEffect, useRef } from "react";

import { useLocale } from "@/lib/locale-context";

/**
 * A single advertising placement.
 *
 * Three things matter here and all three are structural rather than cosmetic:
 * the slot reserves its height before an ad arrives so filling it cannot shift
 * the page; it is visually separated and labelled so it can never be mistaken
 * for a calculator control; and it renders nothing at all until a publisher id
 * is configured, so development and previews are not asking for impressions.
 */

const CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

type Placement = "leaderboard" | "inline" | "rail";

/** Reserved heights, matched to the responsive unit each placement uses. */
const MIN_HEIGHT: Record<Placement, string> = {
  leaderboard: "min-h-[100px] sm:min-h-[90px]",
  inline: "min-h-[250px]",
  rail: "min-h-[600px]",
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({
  slot,
  placement = "inline",
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
    if (!CLIENT_ID || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // A blocked or failed ad script must never break the page.
    }
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <aside
      aria-label={t("ads.label")}
      className={`my-8 flex flex-col items-center gap-1 ${className}`}
    >
      <span className="text-[10px] uppercase tracking-widest text-muted">
        {t("ads.label")}
      </span>
      <div
        className={`ad-slot rounded-lg bg-surface-muted ${MIN_HEIGHT[placement]}`}
      >
        <ins
          className="adsbygoogle block w-full"
          style={{ display: "block" }}
          data-ad-client={CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}

/**
 * The AdSense loader. Rendered once in the layout, after interactive content,
 * so the calculator is usable before any advertising script is fetched.
 */
export function AdScript() {
  if (!CLIENT_ID) return null;
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT_ID}`}
      crossOrigin="anonymous"
    />
  );
}
