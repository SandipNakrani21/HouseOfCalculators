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
import { ADSENSE_PUBLISHER_ID, ADSENSE_UNITS } from "@/config/adsense";

export const ADSENSE_CLIENT = ADSENSE_PUBLISHER_ID;

export const ADS_LIVE = Boolean(ADSENSE_CLIENT);

export type AdPlacement = "leaderboard" | "rectangle" | "rail";

/** The AdSense unit for each shape (config/adsense.ts). A shape without a numeric unit renders nothing. */
export const AD_UNITS: Record<AdPlacement, string> = ADSENSE_UNITS;

const ANY_UNIT = Object.values(AD_UNITS).some((id) => /^\d+$/.test(id));

export const AD_PLACEHOLDERS =
  !ADS_LIVE &&
  (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_AD_PLACEHOLDERS === "1");

/** Slots take up space: live units exist, or labelled placeholders are on. */
export const ADS_ENABLED = (ADS_LIVE && ANY_UNIT) || AD_PLACEHOLDERS;
