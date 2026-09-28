import { jsonLd } from "@/lib/seo";

/**
 * One block of structured data. Server rendered, so crawlers and answer
 * engines read it in the HTML; `jsonLd` escapes `<` so data cannot close the
 * script element early.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}
