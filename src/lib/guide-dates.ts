import type { GuideDefinition } from "@/config/guides/definitions";
import { pageLearning } from "@/config/page-learning";

/** Share actual editorial dates across visible copy, metadata and sitemaps. */
export function guideDates(guide: Pick<GuideDefinition, "published" | "reviewed">, path: string) {
  return {
    published: guide.published ?? guide.reviewed,
    modified: pageLearning(path)?.reviewed ?? guide.reviewed,
  };
}
