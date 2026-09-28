import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/routes";

/**
 * Crawling is allowed everywhere that produces a real page. The disallowed
 * paths are internal states rather than content: there is no API to index,
 * and query-string URLs are a visitor's own shared inputs (their canonical is
 * the clean page).
 *
 * Answer engines are named explicitly as well as covered by `*`: the site is
 * built to be quoted (answer-first copy, FAQ markup, /llms.txt), so the policy
 * says so in terms each crawler reads. A crawler that finds a group with its
 * own name ignores `*`, so each group repeats the same rules.
 */
const DISALLOW = ["/api/", "/*?*"];

const ANSWER_ENGINES = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: ANSWER_ENGINES, allow: "/", disallow: DISALLOW },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
