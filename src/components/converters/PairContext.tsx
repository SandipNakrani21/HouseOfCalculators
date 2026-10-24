import type { TranslateFn } from "@/lib/i18n/core";

const PAIRS: Record<string, string> = {
  "liters-to-us-gallons": "volume", "us-gallons-to-liters": "volume",
  "gigabytes-to-megabytes": "data", "megabytes-to-kilobytes": "data",
  "liters-per-100km-to-mpg-us": "fuel-economy", "mpg-us-to-liters-per-100km": "fuel-economy",
};
export function PairContext({ slug, category, t }: { slug: string; category: string; t: TranslateFn }) {
  if (PAIRS[slug] !== category) return null;
  return <p className="mt-4 text-sm leading-relaxed text-muted" data-pair-context={slug}>{t(`conv.${category}.explain.pairContext`)}</p>;
}
