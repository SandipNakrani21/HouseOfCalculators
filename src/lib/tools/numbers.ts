/** Number utilities for the number and maths tools. */

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen",
];

const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty",
  "ninety",
];

const SCALES: [number, string][] = [
  [1_000_000_000_000, "trillion"],
  [1_000_000_000, "billion"],
  [1_000_000, "million"],
  [1_000, "thousand"],
];

function underThousand(value: number): string {
  if (value < 20) return ONES[value];
  if (value < 100) {
    const tens = TENS[Math.floor(value / 10)];
    const rest = value % 10;
    return rest ? `${tens}-${ONES[rest]}` : tens;
  }
  const hundreds = `${ONES[Math.floor(value / 100)]} hundred`;
  const rest = value % 100;
  return rest ? `${hundreds} and ${underThousand(rest)}` : hundreds;
}

/**
 * Spells a number in English words, the way an amount is written on a cheque.
 * Only English is supported: spelling numbers correctly in a language is a
 * language-specific problem, not a formatting one, and a wrong answer here
 * would be worse than no answer.
 */
export function numberToWords(value: number): string {
  if (!Number.isFinite(value)) return "";
  const negative = value < 0;
  const whole = Math.floor(Math.abs(value));
  const cents = Math.round((Math.abs(value) - whole) * 100);

  let remaining = whole;
  const parts: string[] = [];

  for (const [scale, name] of SCALES) {
    if (remaining >= scale) {
      parts.push(`${underThousand(Math.floor(remaining / scale))} ${name}`);
      remaining %= scale;
    }
  }
  if (remaining > 0 || parts.length === 0) {
    parts.push(
      parts.length && remaining < 100
        ? `and ${underThousand(remaining)}`
        : underThousand(remaining),
    );
  }

  const words = parts.join(" ");
  // The two decimal places are read as written, so a leading zero has to be
  // spoken: without it 12.05 and 12.5 both came out as "twelve point five".
  const decimal = cents
    ? ` point ${cents < 10 ? `zero ${ONES[cents]}` : underThousand(cents)}`
    : "";
  return `${negative ? "minus " : ""}${words}${decimal}`;
}

const ROMAN: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

/** Standard (subtractive) Roman numerals, which only reach 3999. */
export function toRoman(value: number): string {
  const whole = Math.floor(value);
  if (whole < 1 || whole > 3999) return "";

  let remaining = whole;
  let result = "";
  for (const [amount, numeral] of ROMAN) {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  }
  return result;
}

export function fromRoman(input: string): number | null {
  const text = input.trim().toUpperCase();
  if (!/^[MDCLXVI]+$/.test(text)) return null;

  const values: Record<string, number> = {
    I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
  };

  let total = 0;
  for (let i = 0; i < text.length; i += 1) {
    const current = values[text[i]];
    const next = values[text[i + 1]] ?? 0;
    // A smaller numeral before a larger one is subtracted: IX is 9.
    total += current < next ? -current : current;
  }

  // Round-tripping rejects malformed input such as IIII or IC.
  return toRoman(total) === text ? total : null;
}

export function isPrime(value: number): boolean {
  if (!Number.isInteger(value) || value < 2) return false;
  if (value % 2 === 0) return value === 2;
  for (let divisor = 3; divisor * divisor <= value; divisor += 2) {
    if (value % divisor === 0) return false;
  }
  return true;
}

export function primeFactors(value: number): number[] {
  let remaining = Math.floor(Math.abs(value));
  const factors: number[] = [];

  for (let divisor = 2; divisor * divisor <= remaining; divisor += 1) {
    while (remaining % divisor === 0) {
      factors.push(divisor);
      remaining /= divisor;
    }
  }
  if (remaining > 1) factors.push(remaining);
  return factors;
}

export function divisorsOf(value: number): number[] {
  const whole = Math.floor(Math.abs(value));
  if (whole < 1) return [];

  const divisors: number[] = [];
  for (let i = 1; i * i <= whole; i += 1) {
    if (whole % i === 0) {
      divisors.push(i);
      if (i !== whole / i) divisors.push(whole / i);
    }
  }
  return divisors.sort((a, b) => a - b);
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.floor(a));
  let y = Math.abs(Math.floor(b));
  while (y) [x, y] = [y, x % y];
  return x;
}

export function lcm(a: number, b: number): number {
  const divisor = gcd(a, b);
  return divisor === 0 ? 0 : Math.abs(a * b) / divisor;
}

export function simplifyFraction(
  numerator: number,
  denominator: number,
): { numerator: number; denominator: number; decimal: number } | null {
  if (!denominator) return null;
  const divisor = gcd(numerator, denominator) || 1;
  // Keep the sign on the numerator so -1/-2 simplifies to 1/2.
  const sign = denominator < 0 ? -1 : 1;
  return {
    numerator: (sign * numerator) / divisor,
    denominator: (sign * denominator) / divisor,
    decimal: numerator / denominator,
  };
}

/** The four questions a percentage tool is actually asked. */
export const percentage = {
  /** What is A% of B? */
  of: (percent: number, value: number) => (value * percent) / 100,
  /** A is what percent of B? */
  share: (part: number, whole: number) => (whole === 0 ? 0 : (part / whole) * 100),
  /** Percentage change from A to B. */
  change: (from: number, to: number) => (from === 0 ? 0 : ((to - from) / from) * 100),
  /** Increase or decrease a value by a percentage. */
  apply: (value: number, percent: number) => value * (1 + percent / 100),
};

const WORD_VALUES: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90,
};

/** Words that multiply what came before them rather than adding to it. */
const WORD_SCALES: Record<string, number> = {
  hundred: 100,
  thousand: 1_000,
  million: 1_000_000,
  billion: 1_000_000_000,
  trillion: 1_000_000_000_000,
};

/**
 * Reads an English number back out of words - the inverse of `numberToWords`.
 *
 * Returns null rather than a guess when the input is not a number in words.
 * A tool that silently turned "seventy dogs" into 70 would be worse than one
 * that said it did not understand.
 */
export function wordsToNumber(input: string): number | null {
  const words = input
    .toLowerCase()
    .replace(/[,]/g, " ")
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter((word) => word && word !== "and");

  if (words.length === 0) return null;

  let negative = false;
  if (words[0] === "minus" || words[0] === "negative") {
    negative = true;
    words.shift();
  }

  let total = 0;
  let current = 0;
  let seen = false;

  for (const word of words) {
    if (word in WORD_VALUES) {
      current += WORD_VALUES[word];
      seen = true;
      continue;
    }

    const scale = WORD_SCALES[word];
    if (scale === undefined) return null;

    if (scale === 100) {
      // "two hundred" multiplies the pending amount; "hundred" alone is 100.
      current = (current || 1) * 100;
    } else {
      // A thousand and above closes off the group before it.
      total += (current || 1) * scale;
      current = 0;
    }
    seen = true;
  }

  if (!seen) return null;
  const value = total + current;
  return negative ? -value : value;
}
