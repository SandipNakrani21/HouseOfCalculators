# Three requested content fixes — 24 October 2026

## Implemented

1. **About:** public-language copy now accurately describes metadata, lint/type
   and dictionary checks. It explicitly identifies the numerical/component suite
   as retired and explains that same-engine worked examples are not independent
   arithmetic or statutory certification.
2. **Privacy / Contact:** distinguishes calculator use from voluntary support
   email. Describes sender name/address, message and attachments received by the
   publisher/email service to handle an enquiry; asks visitors to avoid sensitive
   information. Retention/deletion enquiries use the support address. No invented
   retention period, deletion guarantee or provider certification was added.
   Removed blanket no-email/no-third-party-processing assertions. The authorized
   `support@thecalculatorshouse.com` address replaces the personal address and is
   clickable in legal-page copy; organization metadata uses the same setting.
3. **Retirement calculator:** added current-savings and monthly-deposit future
   values as separate result rows, including their growth. The headline corpus,
   contributed principal, inflation adjustment and 4% arithmetic are unchanged.
   Added the formula, definitions, deposit timing, nominal/purchasing-power
   explanation, constant-rate/no-fees/no-tax scope and a clear warning that the
   4% row is not guaranteed or assessed sustainable income. A server-rendered
   comparison uses default worked-example inputs versus a two-percentage-point
   lower return and two-point higher inflation (within input limits). It is
   explicitly fixed content and does not claim to follow live edits. The
   Investor.gov compound-interest tool is linked as further reading, not as an
   endorsement or a source for a guaranteed withdrawal rate.

About, Privacy and Contact review dates updated to 24 October 2026. The copy is
provided in 11 language dictionaries covering the existing 12 public locales.
Generated regional/client dictionaries are refreshed. Nonpublic locale fallback
modules may regenerate, but no new locale or country model is published.

## Validation and limitations

- `npm run check`: PASS (metadata, lint, TypeScript and i18n). Repository lint
  retains three pre-existing warnings in archived documentation helper files;
  zero errors.
- Changed application files: separate lint invocation passed with zero warnings.
- Production build: PASS, all 4,067 generated pages; build ID
  `UjMDytDDdB87vCtEp-iV1`.
- Generated HTML inspection: 48/48 documents passed across the 12 public locales
  (About, Privacy, Contact and Retirement). The updated localized copy, support
  mailto links on Contact/Privacy, new retirement result labels and two fixed
  scenario rows were present. No personal email appeared in these documents.
- `git diff --check`: PASS.

These are production-artifact inspections, not a live interactive run or
independent numeric correctness certification.
No unit/component test files were added or run. The previously removed suite
remains removed. Browser access was last reported disabled in Work settings;
this report does not claim live visual/interactive or native-speaker acceptance.

These are local changes. No new commit, push, deployment or AdSense review
request has been performed. The pre-existing unrelated policy-status edit was
preserved. Completion is not a guarantee of AdSense approval.

Evidence: `check.log`, `build.log` and generated-artifact validation beside this
report. Source files: legal definitions/page, public language dictionaries,
retirement calculator definition, `RetirementComparison.tsx` and shared
`CalculatorPageBody.tsx`.
