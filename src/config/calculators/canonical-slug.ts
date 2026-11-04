/** Shared URL identity only; safe for routing without importing tax engines. */
export function canonicalCountryToolSlug(slug: string, country: string): string {
  return slug === "salary" && ["tr", "br", "cn", "mx"].includes(country) ? "income-tax" : slug;
}
