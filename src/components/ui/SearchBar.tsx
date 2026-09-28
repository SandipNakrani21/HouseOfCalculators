import Link from "next/link";

import { SearchBox } from "@/components/search/SearchBox";

/**
 * The large rounded search field with its blue Search button, and a row of
 * "Popular" quick-link chips under it.
 */
export function SearchBar({
  popularLabel,
  chips,
  centered = false,
}: {
  popularLabel: string;
  chips: { key: string; label: string; href: string }[];
  /** Centred in its column, chips included (the homepage hero). */
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl" : "max-w-xl"}>
      <SearchBox variant="hero" />
      {chips.length ? (
        <div className={`flex flex-wrap items-center gap-x-1 gap-y-2 ${centered ? "mt-5 justify-center" : "mt-4"}`}>
          <span className={`me-2 font-bold text-heading ${centered ? "text-sm sm:text-base lg:text-lg" : "text-sm"}`}>{popularLabel}</span>
          {chips.map((chip) => (
            <Link key={chip.key} href={chip.href} className={`chip ${centered ? "sm:text-base lg:text-lg" : ""}`}>
              {chip.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
