import { SECTIONS, sectionKey } from "@/config/categories";
import { COUNTRIES } from "@/config/countries";
import { LOCALES, type LocaleCode } from "@/config/locales";
import { allContent } from "@/lib/content";
import { createFormatter } from "@/lib/format";
import { createTranslator } from "@/lib/i18n";
import { absoluteUrl, localeHome, sectionPath } from "@/lib/routes";
import { SITE_NAME, readyLocales } from "@/lib/seo";

/**
 * llms.txt (llmstxt.org): a plain Markdown map of the site for AI answer
 * engines, listing every calculator, converter, tool, table and guide with a
 * one-line description.
 *
 * One per locale, in that locale's language and spelling and for its default
 * country, so an engine answering in British English quotes "Maths" and
 * "Metres" and links the en-GB pages. Generated at build time from the same
 * registries as the pages, so it can never list something that does not exist.
 */
export function llmsText(locale: LocaleCode, { root = false } = {}): string {
  const { language, defaultCountry: country } = LOCALES[locale];
  const t = createTranslator(language, locale);
  const items = allContent({
    locale,
    country,
    t,
    calcContext: { countryCode: country, country: COUNTRIES[country], t, fmt: createFormatter(country, language, t) },
  });

  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${t("footer.brandBlurb")} ${t("llms.summary")}`,
    "",
    t("llms.scope", { count: Object.keys(COUNTRIES).length, country: t(`country.${country}`) }),
    "",
  ];

  for (const section of SECTIONS) {
    const entries = items.filter((item) => item.section === section);
    if (!entries.length) continue;
    const name = t(sectionKey(section));
    lines.push(`## ${name}`, "", `- [${t("llms.all", { section: name })}](${absoluteUrl(sectionPath(locale, section))})`);
    for (const item of entries) {
      const description = item.description ? `: ${item.description}` : "";
      lines.push(`- [${item.title}](${absoluteUrl(item.href)})${description}`);
    }
    lines.push("");
  }

  // The other language versions, so an engine can pick the reader's.
  const others = readyLocales().filter((code) => code !== locale);
  if (others.length || root) {
    lines.push(`## ${t("llms.languages")}`, "");
    for (const code of readyLocales()) {
      lines.push(`- [${LOCALES[code].native}](${absoluteUrl(`${localeHome(code)}/llms.txt`)})`);
    }
    lines.push("");
  }

  lines.push(
    `## ${t("llms.optional")}`,
    "",
    `- [${t("llms.sitemap")}](${absoluteUrl("/sitemap.xml")})`,
    `- [${t("legal.privacy.title")}](${absoluteUrl(`${localeHome(locale)}/privacy`)})`,
    `- [${t("legal.about.title")}](${absoluteUrl(`${localeHome(locale)}/about`)})`,
    "",
  );
  return lines.join("\n");
}

export function llmsResponse(body: string): Response {
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
