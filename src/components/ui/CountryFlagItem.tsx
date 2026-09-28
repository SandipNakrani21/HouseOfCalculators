import Link from "next/link";
import type { ReactNode } from "react";

import { CountryBadge } from "@/components/ui/CountryBadge";
import type { CountryCode } from "@/config/countries";

/**
 * A round flag with the country's name under it, lifting on hover: one item
 * of the countries row. Pass `media` instead of `code` for the "more" item.
 */
export function CountryFlagItem({
  href,
  label,
  code,
  media,
}: {
  href: string;
  label: string;
  code?: CountryCode;
  media?: ReactNode;
}) {
  return (
    <Link href={href} className="group flex flex-col items-center gap-2 rounded-md p-1 text-center">
      <span className="rounded-sm transition-transform duration-300 ease-premium group-hover:-translate-y-1 group-hover:scale-110">
        {code ? <CountryBadge code={code} size="xl" /> : media}
      </span>
      <span className="text-[0.8125rem] font-semibold leading-snug text-heading transition-colors group-hover:text-primary">
        {label}
      </span>
    </Link>
  );
}
