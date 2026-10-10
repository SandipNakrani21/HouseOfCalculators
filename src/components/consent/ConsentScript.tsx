import { ADSENSE_PUBLISHER_ID } from "@/config/adsense";
import { ANALYTICS_ON } from "@/config/analytics";

const CLIENT_ID = ADSENSE_PUBLISHER_ID;

/**
 * Google Consent Mode v2 defaults, set before the advertising script loads.
 *
 * This has to be an inline, synchronous script rather than a React effect.
 * The ads script is loaded async in the same document, and if it starts before
 * the default state is set it may store an advertising cookie the visitor has
 * not agreed to. Running here, in document order ahead of it, closes that gap.
 *
 * Stored preferences never grant consent here. The CMP or a verified
 * outside-TCF choice must resolve the visitor's current context first.
 *
 * Renders nothing when neither advertising nor analytics is configured: then
 * there are no such cookies, and nothing to consent to.
 */
export function ConsentScript() {
  if (!CLIENT_ID && !ANALYTICS_ON) return null;

  const source = `
(function () {
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  // Denied until the visitor says otherwise. Defaulting the other way would
  // be the whole point of a consent banner missed.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

})();
`.trim();

  return <script dangerouslySetInnerHTML={{ __html: source }} />;
}
