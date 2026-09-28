import Image from "next/image";

import type { CountryCode } from "@/config/countries";

const SIZES = {
  sm: 20,
  md: 28,
  lg: 36,
  xl: 48,
} as const;

/**
 * A round flag. Flag emoji were the obvious choice, but Windows has no glyphs
 * for regional-indicator pairs and shows bare letters instead, so the flags
 * are small local SVGs (see public/flags/LICENSE.txt) rather than characters.
 *
 * Decorative: every use sits beside the country's name, so the image itself
 * carries no alt text.
 */
export function CountryBadge({
  code,
  size = "sm",
  className = "",
}: {
  code: CountryCode;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const pixels = SIZES[size];
  return (
    <Image
      src={`/flags/${code}.svg`}
      alt=""
      aria-hidden
      width={pixels}
      height={pixels}
      // SVGs are already vector; there is nothing for the optimiser to do.
      unoptimized
      className={`inline-block shrink-0 rounded-full object-cover shadow-[0_0_0_1px_rgba(15,23,42,0.08)] ${className}`}
      style={{ width: pixels, height: pixels }}
    />
  );
}
