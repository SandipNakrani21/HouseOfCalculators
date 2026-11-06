import { ADSTERRA_COOKIE, ADSTERRA_ENABLED } from "./adsterra";
import choices from "./adsterra-copy.json";

/** Reuse the localized vendor disclosure shown in Privacy choices. */
export function adsterraLegalText(key: string, language: string): string | undefined {
  if (!ADSTERRA_ENABLED) return undefined;
  const choice = choices[language as keyof typeof choices] ?? choices.en;
  switch (key) {
    case "legal.privacy.ads.1": return choice[4];
    case "legal.cookies.third.1": return `${choice[4]} (${ADSTERRA_COOKIE})`;
    case "legal.link.adsterra": return "Adsterra";
    default: return undefined;
  }
}
