# Statutory figures to verify

Every number below is hard-coded in the repo and changes at least once a year.
None of it has been checked against a primary source — it was written from
general knowledge and needs confirming against the tax authority before the
site goes live. Each rule set carries a `verifiedFor` field naming the tax year
it was written against; update that field as you confirm each one.

All income tax rules live in [`src/lib/finance/tax/rules.ts`](../src/lib/finance/tax/rules.ts).
Consumption tax rates live in [`src/config/countries.ts`](../src/config/countries.ts).

## Priority: countries where the model is knowingly incomplete

| Country | What is missing | Effect |
|---|---|---|
| 🇨🇭 Switzerland | Cantonal and communal tax | Federal direct tax alone is a small share of the real bill — often under a third. The page says so, but the number is not usable on its own. |
| 🇺🇸 United States | State and local income tax | Nine states charge none; California tops 13%. |
| 🇨🇦 Canada | Provincial income tax | Roughly doubles the federal figure in most provinces. |
| 🇩🇪 Germany | Social contributions as Vorsorgeaufwendungen | Contributions are not deducted before the tax schedule, so taxable income is overstated and tax comes out high. |
| 🇫🇷 France | Quotient familial | Single share only; couples and dependants pay materially less. |
| 🇧🇷 Brazil | ICMS/ISS/PIS/COFINS structure | Modelled as a single VAT-style rate, which Brazil does not have. |
| 🇪🇸 Spain | Autonomous community scales | The regional half of the scale varies by community. |
| 🇮🇹 Italy | Regional and municipal addizionali | Indicative averages; real rates are set per comune. |

## Income tax figures, by country

- **🇮🇳 India** — FY 2025-26 new-regime bands (₹4L/8L/12L/16L/20L/24L), old-regime bands, standard deduction ₹75,000 / ₹50,000, §87A rebate ceiling ₹12L and cap ₹60,000, surcharge thresholds and the 25% new-regime cap, 4% cess.
- **🇺🇸 United States** — 2025 federal brackets for single / joint / head of household, standard deductions $15,750 / $31,500 / $23,625, Social Security wage base $176,100 at 6.2%, Medicare 1.45% plus the 0.9% surtax above $200,000.
- **🇬🇧 United Kingdom** — 2025/26 personal allowance £12,570 and its £100,000 taper, basic/higher/additional thresholds, Class 1 NI at 8% and 2%, Class 4 at 6%.
- **🇨🇦 Canada** — 2025 federal brackets, basic personal amount $16,129, CPP 5.95% between $3,500 and $71,300, CPP2 4% to $81,200, EI 1.64% to $65,700.
- **🇦🇺 Australia** — 2025-26 resident rates (the $18,200 / $45,000 / $135,000 / $190,000 steps), Medicare levy 2% and its low-income threshold.
- **🇩🇪 Germany** — §32a constants for 2025: Grundfreibetrag €12,096, zone boundaries €17,443 / €68,480 / €277,825 and the polynomial coefficients; Arbeitnehmer-Pauschbetrag €1,230; solidarity surcharge exemption limit; contribution rates and the €96,600 / €66,150 ceilings.
- **🇦🇹 Austria** — 2025 bracket floors and the 18.07% social insurance rate with its €90,300 ceiling.
- **🇨🇭 Switzerland** — federal direct tax schedule for a single taxpayer; AHV 5.3%; ALV 1.1% to CHF 148,200.
- **🇫🇷 France** — 2025 barème thresholds, the 10% abattement floor €504 and cap €14,426, social contribution and CSG/CRDS rates.
- **🇧🇪 Belgium** — 2025 bracket floors, tax-free allowance €10,570, 13.07% social security, the indicative 7% communal surcharge.
- **🇳🇱 Netherlands** — 2025 box 1 rates 35.82% / 37.48% / 49.50% and their thresholds; algemene heffingskorting and arbeidskorting maxima and taper rates.
- **🇯🇵 Japan** — national brackets, 給与所得控除 schedule, ¥480,000 basic deduction, 2.1% reconstruction surtax, flat 10% resident tax, the 15% social insurance approximation.
- **🇪🇸 Spain** — combined state and regional scale, mínimo personal €5,550, 6.48% social security to the €58,908 base cap.
- **🇲🇽 Mexico** — 2025 annual ISR tariff thresholds and rates; the IMSS approximation; whether subsidio para el empleo should be modelled.
- **🇮🇹 Italy** — 2025 IRPEF bands, INPS 9.19% to €120,607, regional and municipal surcharge assumptions.
- **🇵🇹 Portugal** — 2025 IRS bands, dedução específica €4,462, solidarity surcharge thresholds, 11% social security.
- **🇧🇷 Brazil** — IRPF bands annualised from the monthly table, the 20% simplified deduction and its cap, the INSS bands.
- **🇵🇱 Poland** — 12%/32% scale, kwota wolna €30,000 equivalent (PLN 30,000), ZUS 13.71%, the 9% health contribution base, 4% solidarity levy above PLN 1,000,000.
- **🇹🇷 Türkiye** — 2025 tariff thresholds, SGK 14% and unemployment 1% with the earnings ceiling, and whether the minimum-wage exemption should be applied.
- **🇦🇪 UAE** — confirm there is still no personal income tax on salaries.

## Other statutory figures

- **Consumption tax rates and labels** for all 20 countries, in `src/config/countries.ts`.
- **Capital gains** rules in `src/config/calculators/definitions/tax.ts`: US long-term thresholds, UK £3,000 annual exempt amount and 24% rate, Canadian and Australian inclusion rates, German €1,000 Sparer-Pauschbetrag, French PFU, Spanish savings scale, Italian 26%, Indian ₹1.25 lakh exemption.
- **UK SDLT** bands from April 2025, first-time buyer relief and its £500,000 cap, the 5% additional-property surcharge.
- **US 401(k)** elective deferral limit ($23,500 for 2025) and whether catch-up contributions should be modelled.
- **US Social Security** 2025 PIA bend points ($1,226 and $7,391) and the claiming adjustment percentages.
- **Australian superannuation** guarantee rate (12% from 1 July 2025) and the 15% contributions tax.
- **Australian HECS-HELP** marginal repayment system and the $67,000 threshold.
- **Netherlands 30% ruling** salary cap (€246,000) and the scheduled reduction to 27%.
- **Türkiye severance** ceiling per year of service and the 0.759% stamp duty rate.
- **Employer social charge averages** used by the payroll calculator, in `src/config/calculators/definitions/income.ts`.
