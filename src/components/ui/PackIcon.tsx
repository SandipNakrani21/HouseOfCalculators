import Image from "next/image";


/**
 * Icons and flags from the The Calculators House icon pack (public/landing),
 * the artwork the landing page is designed around. Each icon SVG carries its
 * own pastel circle and colour, so it is shown as-is.
 *
 *   <PackIcon name="coins" size={56} />
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
