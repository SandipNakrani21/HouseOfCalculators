/**
 * Whether advertising is configured at all, readable from server components.
 *
 * `AdSlot` already renders nothing without a publisher id. Layouts need to
 * know too, so a grid can give an ad rail's column back to the content
 * instead of leaving an empty gutter. The value comes from the same env var,
 * so the two can never disagree.
 */
export const ADS_ENABLED = Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT);
