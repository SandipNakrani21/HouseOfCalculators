/**
 * Random draws for the utility tools.
 *
 * Everything here uses the platform CSPRNG rather than `Math.random`. Not
 * because a dice roller is security-critical, but because people use these to
 * settle things, and a generator with a visible bias is worse than useless
 * for that.
 */

/** Uniform integer in [min, max]. */
export function randomInt(min: number, max: number): number {
  const span = max - min + 1;
  if (span <= 0) return min;

  // Rejection sampling: taking a modulus of a 32-bit draw would make the
  // lowest values very slightly more likely.
  const limit = Math.floor(0xffffffff / span) * span;
  const buffer = new Uint32Array(1);
  let draw = limit;
  while (draw >= limit) {
    crypto.getRandomValues(buffer);
    draw = buffer[0];
  }
  return min + (draw % span);
}

/**
 * Fisher-Yates, drawing each index from the CSPRNG.
 *
 * Returns a new array; shuffling in place would surprise a caller holding the
 * original list. The naive `sort(() => Math.random() - 0.5)` is not a shuffle
 * at all - it produces a badly skewed distribution.
 */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Splits a list into `teams` groups of as equal a size as possible.
 *
 * The remainder is spread one per team rather than piled onto the last one,
 * so eleven people across three teams gives 4/4/3 rather than 3/3/5.
 */
export function splitTeams<T>(items: readonly T[], teams: number): T[][] {
  const count = Math.max(Math.floor(teams), 1);
  const result: T[][] = Array.from({ length: count }, () => []);
  if (items.length === 0) return result;

  shuffle(items).forEach((item, index) => {
    result[index % count].push(item);
  });
  return result;
}

/** Parses the free-text list the pickers are given, one entry per line or comma. */
export function parseEntries(input: string): string[] {
  return input
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Rolls `count` dice of `sides` each. */
export function rollDice(count: number, sides: number): number[] {
  if (sides < 2 || count < 1) return [];
  return Array.from({ length: Math.min(count, 100) }, () => randomInt(1, sides));
}

/** Flips a coin `count` times, counting each side. */
export function flipCoins(count: number): {
  flips: ("heads" | "tails")[];
  heads: number;
  tails: number;
} {
  const flips = Array.from({ length: Math.max(Math.min(count, 1000), 1) }, () =>
    randomInt(0, 1) === 0 ? ("heads" as const) : ("tails" as const),
  );
  const heads = flips.filter((flip) => flip === "heads").length;
  return { flips, heads, tails: flips.length - heads };
}
