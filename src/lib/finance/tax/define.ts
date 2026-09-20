import { applySlabs, marginalRate, type Slab, type SlabPortion } from "./slabs";

export type IncomeTaxInput = {
  grossIncome: number;
  /** Country-specific regime or filing status, e.g. "new" | "single". */
  regime?: string;
  /** Deductions the user claims, where the country allows them. */
  deductions?: number;
};

export type Levy = { labelKey: string; amount: number };

export type IncomeTaxResult = {
  grossIncome: number;
  /** Allowance or standard deduction the country grants automatically. */
  standardDeduction: number;
  otherDeductions: number;
  taxableIncome: number;
  /** Tax from the slabs or formula, before credits and add-ons. */
  baseTax: number;
  /** Credits and rebates subtracted from the base tax. */
  credit: number;
  /** Surtaxes charged on the tax itself: cess, solidarity, surcharge. */
  surtaxes: Levy[];
  /** Contributions charged on income: FICA, NI, ZUS, INPS, SGK. */
  social: Levy[];
  /** Income tax after credits and surtaxes, excluding social contributions. */
  incomeTax: number;
  /** Everything withheld: income tax plus social contributions. */
  totalTax: number;
  netIncome: number;
  effectiveRate: number;
  marginalRate: number;
  portions: SlabPortion[];
  taxYear: string;
  /** Dictionary key for the caveat shown under the result. */
  noteKey: string;
};

export type RegimeOption = { value: string; labelKey: string };

export type IncomeTaxRules = {
  taxYear: string;
  /** The tax year this rule set was written against, for the audit trail. */
  verifiedFor: string;
  regimes: RegimeOption[];
  defaultRegime: string;
  allowsDeductions: (regime: string) => boolean;
  compute: (input: IncomeTaxInput) => IncomeTaxResult;
};

type Ctx = {
  gross: number;
  taxable: number;
  tax: number;
  regime: string;
};

/**
 * Declarative description of one country's personal income tax.
 *
 * The shape covers every system the site models: flat allowances (UK), standard
 * deductions (US), zero-rate first slabs (AU), credits that phase out (NL),
 * surtaxes on the tax itself (IN cess, DE solidarity), payroll contributions
 * charged separately from income tax (almost everywhere), and closed-form
 * formulas instead of slabs (DE). A country only fills in what applies to it.
 */
export type RuleSpec = {
  taxYear: string;
  verifiedFor: string;
  /** Dictionary key for the note shown beneath the result. */
  noteKey: string;
  regimes?: RegimeOption[];
  defaultRegime?: string;
  /** Whether the form offers a deductions input. Defaults to true. */
  deductions?: boolean | ((regime: string) => boolean);
  /** Granted automatically and subtracted before the slabs. */
  allowance?: number | ((gross: number, regime: string) => number);
  /** Progressive bands measured on income after the allowance. */
  slabs?: Slab[] | ((regime: string) => Slab[]);
  /** Replaces the slab engine for formula-based systems such as Germany. */
  formula?: (taxable: number, regime: string) => number;
  /** Non-refundable credits subtracted from the computed tax. */
  credit?: (ctx: Ctx) => number;
  /** Levies charged on the tax itself. */
  surtax?: (ctx: Ctx) => Levy[];
  /** Contributions charged on gross income. */
  social?: (ctx: { gross: number; regime: string }) => Levy[];
};

const EMPTY_SLABS: Slab[] = [{ from: 0, rate: 0 }];

export function defineRules(spec: RuleSpec): IncomeTaxRules {
  const regimes = spec.regimes ?? [];
  const defaultRegime = spec.defaultRegime ?? regimes[0]?.value ?? "default";

  const allowsDeductions: (regime: string) => boolean =
    typeof spec.deductions === "function"
      ? spec.deductions
      : () => spec.deductions !== false;

  return {
    taxYear: spec.taxYear,
    verifiedFor: spec.verifiedFor,
    regimes,
    defaultRegime,
    allowsDeductions,
    compute: ({ grossIncome, regime = defaultRegime, deductions = 0 }) => {
      const gross = Math.max(grossIncome, 0);

      const allowance = Math.min(
        typeof spec.allowance === "function"
          ? spec.allowance(gross, regime)
          : (spec.allowance ?? 0),
        gross,
      );

      const room = Math.max(gross - allowance, 0);
      const claimed = allowsDeductions(regime) ? Math.min(deductions, room) : 0;
      const taxable = Math.max(room - claimed, 0);

      const slabs =
        typeof spec.slabs === "function"
          ? spec.slabs(regime)
          : (spec.slabs ?? EMPTY_SLABS);

      const banded = applySlabs(taxable, slabs);
      const baseTax = spec.formula ? spec.formula(taxable, regime) : banded.tax;

      const ctx: Ctx = { gross, taxable, tax: baseTax, regime };
      const credit = Math.min(spec.credit?.(ctx) ?? 0, baseTax);
      const afterCredit = Math.max(baseTax - credit, 0);

      const surtaxes = (spec.surtax?.({ ...ctx, tax: afterCredit }) ?? []).filter(
        (levy) => levy.amount > 0,
      );
      const social = (spec.social?.({ gross, regime }) ?? []).filter(
        (levy) => levy.amount > 0,
      );

      const incomeTax =
        afterCredit + surtaxes.reduce((sum, levy) => sum + levy.amount, 0);
      const totalTax =
        incomeTax + social.reduce((sum, levy) => sum + levy.amount, 0);

      return {
        grossIncome: gross,
        standardDeduction: allowance,
        otherDeductions: claimed,
        taxableIncome: taxable,
        baseTax,
        credit,
        surtaxes,
        social,
        incomeTax,
        totalTax,
        netIncome: gross - totalTax,
        effectiveRate: gross > 0 ? (totalTax / gross) * 100 : 0,
        marginalRate: spec.formula
          ? formulaMarginalRate(spec.formula, taxable, regime)
          : marginalRate(taxable, slabs),
        portions: spec.formula ? [] : banded.portions,
        taxYear: spec.taxYear,
        noteKey: spec.noteKey,
      };
    },
  };
}

/** Numerical marginal rate, for systems whose schedule is a curve not a table. */
function formulaMarginalRate(
  formula: (taxable: number, regime: string) => number,
  taxable: number,
  regime: string,
): number {
  const step = 100;
  return ((formula(taxable + step, regime) - formula(taxable, regime)) / step) * 100;
}

/** Contribution charged at `rate` on earnings between `floor` and `ceiling`. */
export function contribution(
  gross: number,
  rate: number,
  { floor = 0, ceiling = Infinity }: { floor?: number; ceiling?: number } = {},
): number {
  const base = Math.max(Math.min(gross, ceiling) - floor, 0);
  return (base * rate) / 100;
}
