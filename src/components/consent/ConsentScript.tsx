import { ANALYTICS_ON } from "@/config/analytics";

/**
 * Google Consent Mode v2 defaults, set before the advertising script loads.
 *
 * Set the defaults before the optional Analytics loader runs.
 */
export function ConsentScript() {
  if (!ANALYTICS_ON) return null;

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
