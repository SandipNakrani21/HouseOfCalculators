/* eslint-disable @next/next/no-img-element -- the small standalone mark is served as supplied */

import Image from "next/image";

/**
 * The brand logo: the owner's artwork (a house whose body is a calculator,
 * in a blue swoosh, beside "The Calculators House"), prepared in public/brand
 * with a transparent background:
 *
 *   logo.webp          for light backgrounds
 *   logo-on-dark.webp  the same with white lettering, for the navy footer
 *   mark.png           the house and calculator alone, for small spots
 *
 * Responsive image candidates retain sharpness on high-density screens without
 * sending the full artwork to every device. Dimensions reserve the same ratio.
 */

const LOGO = { width: 836, height: 240 };

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return <img src="/brand/mark.png" alt="" width={96} height={96} className={`shrink-0 ${className}`} />;
}

export function Logo({
  name,
  onDark = false,
  large = false,
  priority = false,
  className = "",
}: {
  /** The site name, used as the image's text alternative. */
  name: string;
  onDark?: boolean;
  /** The header's and footer's bigger lock-up. */
  large?: boolean;
  /** Above the fold: load it first instead of lazily. */
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={onDark ? "/brand/logo-on-dark.webp" : "/brand/logo.webp"}
      alt={name}
      width={LOGO.width}
      height={LOGO.height}
      sizes={large ? "(min-width: 640px) 14.805rem, 10.45rem" : "8.71rem"}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={`block aspect-[836/240] w-auto ${large ? "h-12 sm:h-[4.25rem]" : "h-10"} ${className}`}
    />
  );
}
