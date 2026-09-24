import { Search } from "lucide-react";

import { LogoMark } from "@/components/layout/Logo";

/**
 * A laptop and a phone showing the site, for the "why choose" section. Drawn
 * in markup rather than as a screenshot so it never goes stale when the real
 * pages change, and so it follows the theme. Decorative; aria-hidden.
 */
export function DeviceMockup({
  appName,
  titleLines,
  searchLabel,
  fields,
  buttonLabel,
}: {
  appName: string;
  titleLines: [string, string];
  searchLabel: string;
  fields: [string, string, string];
  buttonLabel: string;
}) {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[560px] select-none px-[5%] pb-6">
      {/* Laptop */}
      <div className="animate-float" style={{ "--delay": "300ms" } as React.CSSProperties}>
        <div className="rounded-t-[18px] border-[10px] border-b-[14px] border-navy bg-navy shadow-[0_30px_60px_-30px_rgba(11,23,51,0.7)]">
          <div className="overflow-hidden rounded-md bg-surface">
            {/* Mini header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="flex items-center gap-1.5">
                <LogoMark className="h-5 w-5" />
                <span className="text-[9px] font-extrabold leading-tight text-heading">
                  {appName}
                </span>
              </span>
              <span className="flex gap-1.5">
                {[0, 1, 2, 3].map((dot) => (
                  <span key={dot} className="h-1.5 w-6 rounded-full bg-surface-muted" />
                ))}
              </span>
            </div>
            {/* Mini hero */}
            <div className="bg-[radial-gradient(80%_100%_at_50%_0%,var(--primary-soft),transparent)] px-6 pb-8 pt-7 text-center">
              <p className="text-lg font-extrabold leading-tight text-heading sm:text-xl">
                {titleLines[0]}
                <span className="block text-primary">{titleLines[1]}</span>
              </p>
              <div className="mx-auto mt-4 flex max-w-[70%] items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-start shadow-[var(--shadow-card)]">
                <Search className="h-3 w-3 text-muted" />
                <span className="text-[9px] text-muted">{searchLabel}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Laptop base */}
        <div className="-mx-[5%] h-3 rounded-b-2xl bg-gradient-to-b from-[#cbd5e1] to-[#94a3b8] shadow-[0_12px_20px_-12px_rgba(11,23,51,0.6)]" />
      </div>

      {/* Phone */}
      <div
        className="animate-float absolute bottom-0 end-0 w-[34%] rounded-[26px] border-[6px] border-navy bg-surface shadow-[0_30px_50px_-20px_rgba(11,23,51,0.7)]"
        style={{ "--delay": "1200ms" } as React.CSSProperties}
      >
        <div className="mx-auto mt-1.5 h-1.5 w-10 rounded-full bg-navy" />
        <div className="px-3 pb-4 pt-2.5">
          <span className="flex items-center gap-1">
            <LogoMark className="h-4 w-4" />
            <span className="text-[7px] font-extrabold leading-tight text-heading">{appName}</span>
          </span>
          <div className="mt-3 space-y-2">
            {fields.map((label) => (
              <div key={label}>
                <p className="text-[7px] font-semibold text-muted">{label}</p>
                <div className="mt-0.5 h-3.5 rounded-md border border-border bg-surface-muted" />
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-md bg-primary py-1.5 text-center text-[8px] font-bold text-white">
            {buttonLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
