/**
 * Progressive-slab engine shared by every country's income tax rules.
 * A slab runs from `from` (inclusive) up to the next slab's `from`.
 */
export type Slab = { from: number; rate: number };

export type SlabPortion = {
  from: number;
  to: number | null;
  rate: number;
  taxableInSlab: number;
  tax: number;
};

export function applySlabs(
  taxableIncome: number,
  slabs: Slab[],
): { tax: number; portions: SlabPortion[] } {
  const ordered = [...slabs].sort((a, b) => a.from - b.from);
  const portions: SlabPortion[] = [];
  let tax = 0;

  ordered.forEach((slab, index) => {
    const ceiling = ordered[index + 1]?.from ?? null;
    const upper = ceiling === null ? taxableIncome : Math.min(taxableIncome, ceiling);
    const taxableInSlab = Math.max(upper - slab.from, 0);
    const slabTax = (taxableInSlab * slab.rate) / 100;
    tax += slabTax;
    portions.push({
      from: slab.from,
      to: ceiling,
      rate: slab.rate,
      taxableInSlab,
      tax: slabTax,
    });
  });

  return { tax, portions };
}

/** Marginal rate that applies to the next unit of income. */
export function marginalRate(taxableIncome: number, slabs: Slab[]): number {
  const ordered = [...slabs].sort((a, b) => a.from - b.from);
  let rate = 0;
  for (const slab of ordered) {
    if (taxableIncome > slab.from) rate = slab.rate;
  }
  return rate;
}
