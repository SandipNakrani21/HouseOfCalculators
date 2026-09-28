import { LOCALES, localeFromPath } from "@/config/locales";
import { llmsResponse, llmsText } from "@/lib/llms";
import { readyLocales } from "@/lib/seo";

/*
 * /{locale}/llms.txt: the site map for answer engines, in this locale's
 * language and spelling and for its default country.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return readyLocales().map((code) => ({ locale: LOCALES[code].path }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }): Promise<Response> {
  const locale = localeFromPath((await params).locale);
  if (!locale) return new Response("Not found", { status: 404 });
  return llmsResponse(llmsText(locale.code));
}
