import { CONSENT_COOKIE, COUNTRY_COOKIE, LOCALE_COOKIE } from "@/lib/preferences";

/**
 * The five pages an advertising-supported site needs, built the same way as
 * the guides: structure here, prose in the dictionary. Legal text is exactly
 * the kind of content that rots when it is pasted into a component, so it is
 * keyed and listed like everything else.
 *
 * Links are held as data rather than embedded as HTML inside dictionary
 * strings. A translator should never be handed markup to preserve, and a
 * dictionary value should never be rendered as HTML.
 */

export const LEGAL_SLUGS = [
  "privacy",
  "terms",
  "cookies",
  "contact",
  "about",
] as const;

export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export type LegalSection = {
  /** Dictionary key for the heading. */
  titleKey: string;
  /** Dictionary keys, one paragraph each. */
  body: string[];
  /** Dictionary keys rendered as a bulleted list beneath the paragraphs. */
  bullets?: string[];
  /** Outbound references, rendered as a short list under the section. */
  links?: { labelKey: string; href: string }[];
};

export type LegalPage = {
  slug: LegalSlug;
  icon: string;
  titleKey: string;
  descKey: string;
  introKey: string;
  sections: LegalSection[];
  /** Shown as "last updated" on the page. A real date, not a freshness badge. */
  updated: string;
};

/**
 * Details only the operator of the site can supply. They are deliberately
 * `null` rather than plausible-looking text: a placeholder that reads like a
 * real company is the kind of thing that ships by accident. While any of them
 * is missing the pages render a visible notice saying so.
 */
export const OPERATOR: {
  /** Legal entity or individual publishing the site. */
  entity: string | null;
  /** Address for privacy requests and general contact. */
  email: string | null;
  /** Country or state whose law governs the terms. */
  jurisdiction: string | null;
} = {
  entity: null,
  email: null,
  jurisdiction: null,
};

export function missingOperatorDetails(): (keyof typeof OPERATOR)[] {
  return (Object.keys(OPERATOR) as (keyof typeof OPERATOR)[]).filter(
    (field) => !OPERATOR[field],
  );
}

/**
 * Substitutions available to every legal string. The cookie names come from
 * the module that actually sets them, so the page cannot describe a cookie
 * the site does not use.
 */
export function legalParams(): Record<string, string> {
  return {
    localeCookie: LOCALE_COOKIE,
    countryCookie: COUNTRY_COOKIE,
    consentCookie: CONSENT_COOKIE,
    entity: OPERATOR.entity ?? "[ENTITY NAME]",
    email: OPERATOR.email ?? "[CONTACT EMAIL]",
    jurisdiction: OPERATOR.jurisdiction ?? "[JURISDICTION]",
  };
}

const GOOGLE_ADS_POLICY = "https://policies.google.com/technologies/ads";
const GOOGLE_PRIVACY = "https://policies.google.com/privacy";
const ADS_SETTINGS = "https://adssettings.google.com";
const ALL_ABOUT_COOKIES = "https://www.allaboutcookies.org";

const privacy: LegalPage = {
  slug: "privacy",
  icon: "🔒",
  titleKey: "legal.privacy.title",
  descKey: "legal.privacy.desc",
  introKey: "legal.privacy.intro",
  updated: "2026-09-21",
  sections: [
    {
      titleKey: "legal.privacy.summary.title",
      body: ["legal.privacy.summary.1"],
      bullets: [
        "legal.privacy.summary.b1",
        "legal.privacy.summary.b2",
        "legal.privacy.summary.b3",
        "legal.privacy.summary.b4",
      ],
    },
    {
      titleKey: "legal.privacy.stored.title",
      body: ["legal.privacy.stored.1", "legal.privacy.stored.2"],
      bullets: ["legal.privacy.stored.b1", "legal.privacy.stored.b2", "legal.privacy.stored.b3"],
    },
    {
      titleKey: "legal.privacy.notCollected.title",
      body: ["legal.privacy.notCollected.1"],
      bullets: [
        "legal.privacy.notCollected.b1",
        "legal.privacy.notCollected.b2",
        "legal.privacy.notCollected.b3",
        "legal.privacy.notCollected.b4",
      ],
    },
    {
      titleKey: "legal.privacy.ads.title",
      body: [
        "legal.privacy.ads.1",
        "legal.privacy.ads.2",
        "legal.privacy.ads.3",
      ],
      links: [
        { labelKey: "legal.link.googleAds", href: GOOGLE_ADS_POLICY },
        { labelKey: "legal.link.googlePrivacy", href: GOOGLE_PRIVACY },
        { labelKey: "legal.link.adsSettings", href: ADS_SETTINGS },
      ],
    },
    {
      titleKey: "legal.privacy.hosting.title",
      body: ["legal.privacy.hosting.1", "legal.privacy.hosting.2"],
    },
    {
      titleKey: "legal.privacy.rights.title",
      body: ["legal.privacy.rights.1", "legal.privacy.rights.2"],
      bullets: [
        "legal.privacy.rights.b1",
        "legal.privacy.rights.b2",
        "legal.privacy.rights.b3",
      ],
    },
    {
      titleKey: "legal.privacy.children.title",
      body: ["legal.privacy.children.1"],
    },
    {
      titleKey: "legal.privacy.changes.title",
      body: ["legal.privacy.changes.1"],
    },
    {
      titleKey: "legal.privacy.contact.title",
      body: ["legal.privacy.contact.1"],
    },
  ],
};

const cookies: LegalPage = {
  slug: "cookies",
  icon: "🍪",
  titleKey: "legal.cookies.title",
  descKey: "legal.cookies.desc",
  introKey: "legal.cookies.intro",
  updated: "2026-09-21",
  sections: [
    {
      titleKey: "legal.cookies.own.title",
      body: ["legal.cookies.own.1", "legal.cookies.own.2"],
      bullets: ["legal.cookies.own.b1", "legal.cookies.own.b2", "legal.cookies.own.b3"],
    },
    {
      titleKey: "legal.cookies.third.title",
      body: ["legal.cookies.third.1", "legal.cookies.third.2"],
      links: [
        { labelKey: "legal.link.googleAds", href: GOOGLE_ADS_POLICY },
        { labelKey: "legal.link.adsSettings", href: ADS_SETTINGS },
      ],
    },
    {
      titleKey: "legal.cookies.noTracking.title",
      body: ["legal.cookies.noTracking.1"],
    },
    {
      titleKey: "legal.cookies.control.title",
      body: ["legal.cookies.control.1", "legal.cookies.control.2"],
      links: [{ labelKey: "legal.link.allAboutCookies", href: ALL_ABOUT_COOKIES }],
    },
    {
      titleKey: "legal.cookies.changes.title",
      body: ["legal.cookies.changes.1"],
    },
  ],
};

const terms: LegalPage = {
  slug: "terms",
  icon: "📜",
  titleKey: "legal.terms.title",
  descKey: "legal.terms.desc",
  introKey: "legal.terms.intro",
  updated: "2026-09-21",
  sections: [
    {
      titleKey: "legal.terms.accept.title",
      body: ["legal.terms.accept.1"],
    },
    {
      titleKey: "legal.terms.notAdvice.title",
      body: [
        "legal.terms.notAdvice.1",
        "legal.terms.notAdvice.2",
        "legal.terms.notAdvice.3",
      ],
    },
    {
      titleKey: "legal.terms.accuracy.title",
      body: [
        "legal.terms.accuracy.1",
        "legal.terms.accuracy.2",
        "legal.terms.accuracy.3",
      ],
    },
    {
      titleKey: "legal.terms.use.title",
      body: ["legal.terms.use.1"],
      bullets: [
        "legal.terms.use.b1",
        "legal.terms.use.b2",
        "legal.terms.use.b3",
      ],
    },
    {
      titleKey: "legal.terms.ip.title",
      body: ["legal.terms.ip.1", "legal.terms.ip.2"],
    },
    {
      titleKey: "legal.terms.links.title",
      body: ["legal.terms.links.1"],
    },
    {
      titleKey: "legal.terms.availability.title",
      body: ["legal.terms.availability.1"],
    },
    {
      titleKey: "legal.terms.liability.title",
      body: ["legal.terms.liability.1", "legal.terms.liability.2"],
    },
    {
      titleKey: "legal.terms.law.title",
      body: ["legal.terms.law.1"],
    },
    {
      titleKey: "legal.terms.changes.title",
      body: ["legal.terms.changes.1"],
    },
  ],
};

const contact: LegalPage = {
  slug: "contact",
  icon: "✉️",
  titleKey: "legal.contact.title",
  descKey: "legal.contact.desc",
  introKey: "legal.contact.intro",
  updated: "2026-09-21",
  sections: [
    {
      titleKey: "legal.contact.reach.title",
      body: ["legal.contact.reach.1", "legal.contact.reach.2"],
    },
    {
      titleKey: "legal.contact.errors.title",
      body: ["legal.contact.errors.1"],
      bullets: [
        "legal.contact.errors.b1",
        "legal.contact.errors.b2",
        "legal.contact.errors.b3",
      ],
    },
    {
      titleKey: "legal.contact.cannot.title",
      body: ["legal.contact.cannot.1"],
    },
    {
      titleKey: "legal.contact.privacy.title",
      body: ["legal.contact.privacy.1"],
    },
  ],
};

const about: LegalPage = {
  slug: "about",
  icon: "🏛️",
  titleKey: "legal.about.title",
  descKey: "legal.about.desc",
  introKey: "legal.about.intro",
  updated: "2026-09-21",
  sections: [
    {
      titleKey: "legal.about.what.title",
      body: ["legal.about.what.1", "legal.about.what.2"],
    },
    {
      titleKey: "legal.about.built.title",
      body: ["legal.about.built.1", "legal.about.built.2"],
    },
    {
      titleKey: "legal.about.numbers.title",
      body: ["legal.about.numbers.1", "legal.about.numbers.2"],
    },
    {
      titleKey: "legal.about.languages.title",
      body: ["legal.about.languages.1", "legal.about.languages.2"],
    },
    {
      titleKey: "legal.about.funding.title",
      body: ["legal.about.funding.1", "legal.about.funding.2"],
    },
    {
      titleKey: "legal.about.not.title",
      body: ["legal.about.not.1"],
    },
  ],
};

export const LEGAL_PAGES: LegalPage[] = [privacy, terms, cookies, contact, about];

export function getLegalPage(slug: string): LegalPage | undefined {
  return LEGAL_PAGES.find((page) => page.slug === slug);
}
