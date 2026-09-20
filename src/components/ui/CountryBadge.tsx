import type { CountryCode } from "@/config/countries";

/**
 * Two-letter country marker. Flag emoji were the obvious choice, but Windows
 * has no glyphs for regional indicator pairs and falls back to bare letters,
 * so the letters are drawn deliberately instead of by accident.
 */
export function CountryBadge({
  code,
  size = "sm",
}: {
  code: CountryCode;
  size?: "sm" | "lg";
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-md bg-surface-muted font-semibold uppercase tracking-wider text-muted ${
        size === "lg" ? "h-9 w-9 text-xs" : "h-5 w-6 text-[10px]"
      }`}
    >
      {code}
    </span>
  );
}
