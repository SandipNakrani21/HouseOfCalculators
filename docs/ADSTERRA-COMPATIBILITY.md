# Adsterra compatibility — 6 November 2026

## Result

The Next.js site can host Adsterra JavaScript banners. Adsterra is not integrated or active. Approval, a site-specific Get Code snippet, and vendor-appropriate consent configuration are required before activation. A successful build does not demonstrate ad delivery or revenue.

Official installation reference: https://help-publishers.adsterra.com/en/articles/5210780-adding-ads-to-a-static-html-site

## Source review

| Area | Finding | Required activation work |
| --- | --- | --- |
| Rendering | Pages render HTML and hydrate client components. Third-party JavaScript is supported. | Mount the supplied banner code in a client component, following its actual initialization contract. |
| Ad loader | `src/components/ui/AdSlot.tsx` creates AdSense `ins` elements and uses Google's request queue. It cannot render an Adsterra placement. | Implement a separate provider component. Do not put Adsterra IDs into Google slot fields. |
| Security policy | `next.config.ts` restricts scripts, frames, images and connections to existing providers. The layout also emits its policy in HTML because the host may replace response headers. | Inspect the actual placement and resulting requests; allow only required HTTPS origins in the relevant directives. Verify both effective header and HTML policies. No wildcard-wide relaxation. |
| Consent | `src/lib/consent-state.ts` and `ConsentBanner.tsx` resolve Google purposes and a local choice. This does not establish an Adsterra vendor grant. | Provide accurate vendor disclosure and an applicable explicit choice before any Adsterra request. Denial, unknown state and revocation must prevent future requests. Do not reuse an old Google grant as new-vendor permission. |
| Layout | Existing slots are labelled, reserve space and track available width. Google responsive sizes differ from fixed Adsterra banners. | Start with one 300×250 banner; load only when it fits and is visible. Reserve dimensions before loading. Verify narrow/mobile layouts and resize behavior; do not hide a loaded creative solely to generate impressions. |
| Navigation | App Router transitions can retain components. Ad slots currently key by pathname. | Initialize once per visible placement; remove owned elements/listeners on unmount and test navigation/back/revocation. Do not duplicate global initialization or refresh ads without provider support. |
| Content eligibility | `src/config/ad-inventory.ts` restricts placements to known public content paths. | Preserve eligibility; no banners on privacy, consent, error or internal pages. Keep ads away from calculator inputs/results/actions. |
| ads.txt | Existing route declares the Google seller. Adsterra's installation guide says its advertisers do not require ads.txt. | Preserve the Google record. Add a seller only if Adsterra supplies an authoritative record. |
| Privacy | Existing disclosures describe current services. | Update each public language accurately for the actual integration and data behavior before enabling it. No premature statement that Adsterra is already used. |
| Failure behavior | Existing calculators run independently of ad delivery. | Blocked scripts, failed auctions, no-fill and slow ads must leave calculators functional. |

## Needed from the approved publisher dashboard

In Websites, expand thecalculatorshouse.com after approval. Add a Banner unit, select 300×250, and copy the complete public Get Code snippet. The placement key and script URL are required; no password, OTP, API credential, bank information or identity document is needed in the repository or chat.

Do not enable Popunder, Social Bar, interstitials or Smartlinks on calculator controls as part of the initial banner pilot.

## Validation before activation

1. Verify exact code, provider instructions and origin list; add a disabled-by-default provider configuration with an immediate off switch.
2. Test zero provider requests before a valid choice, on denial and after revocation; test that an existing Google-only choice does not authorize Adsterra.
3. Test approved and ineligible routes, App Router navigation/back, repeated mount/unmount and no duplicate placement initialization.
4. Check real banner delivery at phone/tablet/desktop widths and layout changes; test blocked/slow/no-fill behavior and calculator input/reset/share interactions.
5. Run project checks and production build, review scoped changes, push main, verify CI and Hostinger deployment, then inspect live output and actual publisher Statistics.

## This review's publication scope

This document records confirmed integration gaps and the exact dependency on the approved ad code. No Adsterra runtime, security-policy or consent change has been made without that code. Existing runtime behavior is preserved. Full ad compatibility remains unverified until an approved placement can be tested end to end.
