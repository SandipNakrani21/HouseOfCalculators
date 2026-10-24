import type { TranslateFn } from "@/lib/i18n/core";

/** Centimetre density equations used by navyBodyFat, not an official fitness test. */
export function BodyFatMethod({ slug, t }: { slug: string; t: TranslateFn }) {
  if (slug !== "body-fat") return null;
  return <section className="space-y-3" data-body-fat-method>
    <h3 className="font-semibold">{t("calc.formula")}</h3>
    <dl className="space-y-2 text-sm">{[["H", "field.heightCm"], ["W", "field.waist"], ["N", "field.neck"], ["P", "field.hip"]].map(([symbol, key]) => <div className="flex gap-3" key={symbol}><dt className="font-semibold">{symbol}</dt><dd>{t(key)} · cm</dd></div>)}</dl>
    <div className="result-box space-y-3 text-sm [overflow-wrap:anywhere]">
      <p><strong>{t("option.male")}</strong><br />D = 1.0324 − 0.19077 × log₁₀(W − N) + 0.15456 × log₁₀(H)</p>
      <p><strong>{t("option.female")}</strong><br />D = 1.29579 − 0.35004 × log₁₀(W + P − N) + 0.22100 × log₁₀(H)</p>
      <p>{t("result.bodyFat")} (%) = 495 / D − 450</p>
    </div>
  </section>;
}
