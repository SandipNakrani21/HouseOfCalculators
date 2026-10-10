import inventory from "./ad-inventory.json";
/** Exact known content paths. Country-rule models require explicit source coverage. */
export const AD_INVENTORY_REVIEW = { date: inventory.reviewed, revision: inventory.revision };
const paths = new Set(inventory.paths);
const locales = new Set(inventory.locales);
export function isAdEligiblePath(pathname: string | null): boolean {
  if (!pathname) return false;
  const parts = pathname.split("/").filter(Boolean);
  return locales.has(parts[0]) && paths.has(`/${parts.slice(1).join("/")}`);
}
