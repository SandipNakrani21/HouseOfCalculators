import { DEFAULT_LOCALE } from "@/config/locales";
import { llmsResponse, llmsText } from "@/lib/llms";

/*
 * /llms.txt: the default locale's map, which also lists every language
 * version (/{locale}/llms.txt) so an answer engine can use the reader's.
 */
export const dynamic = "force-static";

export function GET(): Response {
  return llmsResponse(llmsText(DEFAULT_LOCALE, { root: true }));
}
