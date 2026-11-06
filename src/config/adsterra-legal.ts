import { ADSTERRA_ENABLED } from "./adsterra";
import choices from "./adsterra-copy.json";
import legal from "./adsterra-legal-copy.json";

/** Replace exclusive Google/no-storage claims only while the native pilot is on. */
export function adsterraLegalText(key: string, language: string): string | undefined {
  if (!ADSTERRA_ENABLED) return undefined;
  const languageKey = language as keyof typeof legal;
  const c = legal[languageKey] ?? legal.en;
  const choice = choices[languageKey] ?? choices.en;
  switch (key) {
    case "legal.privacy.ads.1":
    case "legal.cookies.intro":
    case "legal.cookies.third.1": return c.providers;
    case "legal.privacy.stored.1":
    case "legal.cookies.own.2": return c.preference;
    case "legal.cookies.third.2":
    case "legal.cookies.noTracking.1":
    case "legal.cookies.noTracking.withAnalytics": return choice[4];
    case "legal.cookies.noTracking.title": return choice[1];
    default: return undefined;
  }
}
