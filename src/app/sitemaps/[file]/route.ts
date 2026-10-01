import { LOCALES } from "@/config/locales";
import { localeSitemapPath, localeSitemapXml } from "@/lib/sitemap";
import { readyLocales } from "@/lib/seo";

/** /sitemaps/{locale}.xml: every page of one language (see /sitemap.xml). */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return readyLocales().map((locale) => ({ file: localeSitemapPath(locale).split("/").pop()! }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const locale = readyLocales().find((code) => `${LOCALES[code].path}.xml` === file);
  if (!locale) return new Response("Not found", { status: 404 });
  return new Response(localeSitemapXml(locale), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
