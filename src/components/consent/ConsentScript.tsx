import { ADSENSE_PUBLISHER_ID } from "@/config/adsense";
import { CONSENT_COOKIE } from "@/lib/preferences";

const CLIENT_ID = ADSENSE_PUBLISHER_ID;

/**
 * Google Consent Mode v2 defaults, set before the advertising script loads.
 *
 * This has to be an inline, synchronous script rather than a React effect.
 * The ads script is loaded async in the same document, and if it starts before
 * the default state is set it may store an advertising cookie the visitor has
 * not agreed to. Running here, in document order ahead of it, closes that gap.
 *
 * Every page is statically generated, so the stored choice cannot be read on
 * the server without making the whole site dynamic. The script therefore reads
 * the cookie itself, which it can do synchronously.
 *
 * Renders nothing when there is no publisher id: with no advertising there are
 * no advertising cookies, and nothing to consent to.
 */
export function ConsentScript() {
  if (!CLIENT_ID) return null;

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

  try {
    var match = document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=([^;]*)/);
    if (match && decodeURIComponent(match[1]) === 'granted') {
      gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted'
      });
    }
  } catch (error) {
    // Blocked cookies leave the denied default in place, which is correct.
  }
})();
`.trim();

  return <script dangerouslySetInnerHTML={{ __html: source }} />;
}
