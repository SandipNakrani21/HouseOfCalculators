/**
 * Advertising switches, shared by AdSlot and by server layouts.
 *
 *   ADS_LIVE      a publisher id is configured: real AdSense units render.
 *   ADS_ENABLED   slots take up space: live ads, or labelled placeholders.
 *
 * Placeholders show in development, so layouts can be designed around the ad
 * positions, and in production only with NEXT_PUBLIC_AD_PLACEHOLDERS=1 (for a
 * staging review). A public page never shows an empty "Ad" box.
 *
 * Layouts read ADS_ENABLED to give an ad rail's column back to the content
 * when there is nothing to show, instead of leaving an empty gutter.
 */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

export const ADS_LIVE = Boolean(ADSENSE_CLIENT);

export type AdPlacement = "leaderboard" | "rectangle" | "rail";

/**
 * One AdSense display unit per shape, created in AdSense (Ads → By ad unit)
 * and set as environment variables. Every slot of a shape uses its unit; a
 * shape without a unit renders nothing rather than an empty box. Written out
 * one by one because Next.js only inlines literal process.env.NEXT_PUBLIC_*.
 */
export const AD_UNITS: Record<AdPlacement, string> = {
  leaderboard: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD ?? "",
  rectangle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE ?? "",
  rail: process.env.NEXT_PUBLIC_ADSENSE_SLOT_RAIL ?? "",
};

const ANY_UNIT = Object.values(AD_UNITS).some((id) => /^\d+$/.test(id));

export const AD_PLACEHOLDERS =
  !ADS_LIVE &&
  (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_AD_PLACEHOLDERS === "1");

/** Slots take up space: live units exist, or labelled placeholders are on. */
export const ADS_ENABLED = (ADS_LIVE && ANY_UNIT) || AD_PLACEHOLDERS;
