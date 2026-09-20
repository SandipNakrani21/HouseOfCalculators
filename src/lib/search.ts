import type { ContentItem } from "@/lib/content";

/**
 * Small in-memory search over the content index. Deliberately not a library:
 * the corpus is a few hundred short titles, so a scan with sensible scoring is
 * both faster than shipping an index and easier to reason about.
 */

function normalise(text: string): string {
  return text
    .toLocaleLowerCase()
    .normalize("NFD")
    // Strip accents so "prêt" matches "pret".
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/**
 * Levenshtein distance, capped: once the edit distance passes `limit` the
 * exact value stops mattering, so the rows are abandoned early.
 */
function editDistance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let best = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      );
      current.push(value);
      best = Math.min(best, value);
    }
    if (best > limit) return limit + 1;
    previous = current;
  }
  return previous[b.length];
}

/** How much typing slack a word of this length gets. */
function tolerance(word: string): number {
  if (word.length <= 3) return 0;
  if (word.length <= 6) return 1;
  return 2;
}

function scoreItem(item: ContentItem, terms: string[]): number {
  const title = normalise(item.title);
  const haystack = normalise(
    `${item.title} ${item.description} ${item.slug} ${item.keywords}`,
  );
  const words = haystack.split(/[^a-z0-9]+/).filter(Boolean);

  let score = 0;

  for (const term of terms) {
    if (title === term) {
      score += 100;
      continue;
    }
    if (title.startsWith(term)) {
      score += 60;
      continue;
    }
    if (title.includes(term)) {
      score += 40;
      continue;
    }
    if (haystack.includes(term)) {
      score += 20;
      continue;
    }

    // Nothing matched outright, so allow for a typo.
    const limit = tolerance(term);
    if (limit === 0) return 0;
    const near = words.some(
      (word) =>
        Math.abs(word.length - term.length) <= limit &&
        editDistance(word, term, limit) <= limit,
    );
    if (!near) return 0;
    score += 10;
  }

  // Shorter titles are usually the more direct answer to a short query.
  return score - title.length * 0.05;
}

export type SearchResult = ContentItem & { score: number };

export function search(
  items: ContentItem[],
  query: string,
  limit = 24,
): SearchResult[] {
  const terms = normalise(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  const results: SearchResult[] = [];
  for (const item of items) {
    const score = scoreItem(item, terms);
    if (score > 0) results.push({ ...item, score });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
