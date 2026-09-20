import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/routes";

/**
 * Crawling is allowed everywhere that produces a real page. The disallowed
 * paths are internal states rather than content: a search results page has
 * nothing of its own to index, and result URLs carry a visitor's own inputs.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/*?*"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
