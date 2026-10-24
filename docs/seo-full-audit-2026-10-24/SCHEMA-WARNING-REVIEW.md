# Loan structured-data warning review

Reviewed 25 October 2026 (Asia/Calcutta). **Investigated, no appropriate schema-property change.**

- Tested URL: https://thecalculatorshouse.com/en-us/calculators/finance/loan
- Google test: https://search.google.com/test/rich-results/result/r%2Fsoftware-apps?id=2bEueScTEijIFizoYUkgPA
- Google fetch: 25 October 2026, 00:15:51 IST, smartphone inspection tool.
- Result: Breadcrumbs: one valid item. Software Apps: one valid item with one non-critical issue.
- Exact expanded issue: **`Missing field "aggregateRating" (optional)`**.

## Applicability and decision

The detected item is a `WebApplication`, named Loan Calculator, with FinanceApplication category, Any operating system, JavaScript requirement, and a zero-price USD offer. The tested live description still says “for any loan”; the previously prepared local Loan override corrects this to the implemented fixed-rate, monthly-payment, no-fee scope.

No genuine rating collection, rating count or published review supporting an aggregate rating was found in the Loan page/source reviewed. A calculated sample result, a review date, or an editorial quality judgment is not a user rating. Therefore no aggregateRating or substitute review was invented, and the application type was retained.

Google's [software-app documentation](https://developers.google.com/search/docs/appearance/structured-data/software-app) describes aggregateRating as the average review score and refers to the [review-snippet guidelines](https://developers.google.com/search/docs/appearance/structured-data/review-snippet). An AggregateRating requires an actual rating value and rating/review count. Relevant ratings must be represented truthfully in visible content.

There is a distinction between the tool and documentation: this test labels the absent aggregateRating optional/non-critical, while the software-app feature documentation lists a rating or review among its rich-result requirements. Neither the tool's “valid” label nor retaining valid schema guarantees the software-app rich result will display. The warning is **not fixed**; leaving it is appropriate for the available content.

## Consistency and validation

`DetailPage.tsx` uses the same header title/description for visible content and WebApplication JSON-LD. Its FAQ JSON-LD also uses the visible FAQ items. Content corrections therefore flow into both rather than creating separate unsupported schema copy. No schema helper or schema type was changed; there is no new shared-schema template requiring a site-wide test.

Local rendered syntax/content checks and their exact outcomes are recorded in `pending-rendered-checks.json` and `CONTENT-REVIEW.md`. The Google result above tested the live site, not the unpublished local content. No validation request, indexing request, commit, push or deployment was made.
