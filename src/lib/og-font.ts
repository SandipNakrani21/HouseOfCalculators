import type { LanguageCode } from "@/config/languages";

/**
 * A font for generated share images (next/og). Its built-in font covers Latin
 * only, so Cyrillic, Japanese and Chinese titles would render as empty boxes.
 * This fetches Noto Sans from Google Fonts at build time, subset to exactly
 * the characters on the image (`text=`), which keeps even the CJK fonts to a
 * few kilobytes. Without a User-Agent Google serves TrueType, which next/og
 * reads (it cannot read woff2).
 *
 * Resolves to null if the font cannot be fetched; callers then draw an image
 * without the text that needed it, so a network hiccup never fails a build.
 */
const FAMILY: Partial<Record<LanguageCode, string>> = {
  ja: "Noto Sans JP",
  zh: "Noto Sans SC",
};

export async function ogFont(language: LanguageCode, text: string): Promise<{ name: string; data: ArrayBuffer } | null> {
  const family = FAMILY[language] ?? "Noto Sans";
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@700&text=${encodeURIComponent(text)}`,
        { cache: "force-cache" },
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) return null;
    return { name: family, data: await response.arrayBuffer() };
  } catch {
    return null;
  }
}
