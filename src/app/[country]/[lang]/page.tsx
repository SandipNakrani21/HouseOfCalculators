import { CalculatorGrid } from "@/components/CalculatorGrid";
import { calculatorsFor } from "@/config/calculators";
import { isCountryCode } from "@/config/countries";
import { isLanguageCode } from "@/config/languages";
import { countryParams, createTranslator } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ country: string; lang: string }>;
}) {
  const { country, lang } = await params;
  if (!isCountryCode(country) || !isLanguageCode(lang)) notFound();

  const t = createTranslator(lang);
  const count = calculatorsFor(country).length;
  const names = countryParams(t, country);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("home.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          {t("home.subtitle", { count, ...names })}
        </p>
      </header>

      <CalculatorGrid />
    </div>
  );
}
