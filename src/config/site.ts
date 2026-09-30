/**
 * Site-level switches for features that depend on outside accounts.
 *
 * Each one stays off until it is configured, so the site never shows a link
 * to a profile that does not exist or a form that goes nowhere.
 */

/**
 * The site's one public address. Canonical links, the sitemap, hreflang and
 * structured data use it, and the production deployment's *.vercel.app alias
 * redirects to it (proxy.ts). NEXT_PUBLIC_SITE_URL overrides it, e.g. for a
 * staging copy.
 */
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://thecalculatorshouse.com").replace(/\/$/, "");

export type SocialNetwork = "x" | "facebook" | "instagram" | "linkedin" | "youtube";

/**
 * Official profiles, shown as icons in the footer. Empty until the accounts
 * exist: add `{ network: "x", url: "https://x.com/..." }` entries here.
 */
export const SOCIAL_LINKS: { network: SocialNetwork; url: string }[] = [];

/**
 * Where the footer's newsletter form posts (a mailing-list provider's
 * subscribe URL). Unset means no newsletter form.
 *
 * Before setting it, update the privacy policy: it currently says the site
 * has no forms and collects no personal data.
 */
export const NEWSLETTER_ACTION = httpsOnly(process.env.NEXT_PUBLIC_NEWSLETTER_ACTION);

/** A form may only ever post over https; anything else means no form. */
function httpsOnly(value: string | undefined): string {
  if (!value) return "";
  try {
    return new URL(value).protocol === "https:" ? value : "";
  } catch {
    return "";
  }
}
