import Image from "next/image";

import type { CountryCode } from "@/config/countries";

/**
 * Icons and flags from the The Calculators House icon pack (public/landing),
 * the artwork the landing page is designed around. Each icon SVG carries its
 * own pastel circle and colour, so it is shown as-is.
 *
 *   <PackIcon name="coins" size={56} />
 *   <PackFlag code="in" width={48} />
 *
 * Decorative: every use sits beside text that says the same thing.
 */

export type PackIconName =
  | "analytics" | "bolt" | "calculator" | "calendar" | "chart" | "coins"
  | "currency_exchange" | "facebook" | "gear" | "globe" | "graduation" | "gst"
  | "health_heart" | "heart" | "home" | "instagram" | "language_globe"
  | "linkedin" | "logo_house" | "math" | "percent" | "phone" | "search"
  | "shield_check" | "sync" | "users" | "x" | "youtube";

export function PackIcon({
  name,
  size = 48,
  className = "",
}: {
  name: PackIconName;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={`/landing/icons/${name}.svg`}
      alt=""
      aria-hidden
      width={size}
      height={size}
      // Vector already: nothing for the optimiser to do.
      unoptimized
      className={`inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** The countries the pack has flags for: the landing page's world row. */
export const PACK_FLAGS = ["in", "us", "gb", "ca", "au", "ae", "de", "fr", "es", "br", "jp"] as const satisfies readonly CountryCode[];

/** A rounded-rectangle flag from the pack (3:2). */
export function PackFlag({
  code,
  width = 48,
  className = "",
}: {
  code: (typeof PACK_FLAGS)[number];
  width?: number;
  className?: string;
}) {
  const height = Math.round((width * 2) / 3);
  return (
    <Image
      src={`/landing/flags/${code}.svg`}
      alt=""
      aria-hidden
      width={width}
      height={height}
      unoptimized
      className={`inline-block shrink-0 rounded-sm shadow-[0_2px_6px_rgba(15,23,42,0.18)] ${className}`}
      style={{ width, height }}
    />
  );
}
