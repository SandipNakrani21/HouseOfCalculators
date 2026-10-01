import { sitemapIndexXml } from "@/lib/sitemap";

/**
 * /sitemap.xml: a sitemap index pointing at one sitemap per language
 * (/sitemaps/en-us.xml, ...). One file listing every page in every language
 * with all its alternates came to 7.7 MB; per-language files stay small and
 * let Search Console report indexing per language.
 */
export const dynamic = "force-static";

export function GET() {
  return new Response(sitemapIndexXml(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
