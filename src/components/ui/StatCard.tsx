import type { ReactNode } from "react";

import { CountUp } from "@/components/motion/CountUp";
import { IconTile } from "@/components/ui/Icon";
import { PackIcon, type PackIconName } from "@/components/ui/PackIcon";
import type { IconName, Tone } from "@/lib/visuals";

export type Stat = {
  icon: IconName;
  /** An icon from the landing icon pack, shown instead of the tile. */
  pack?: PackIconName;
  tone: Tone;
  /** A real, computed figure. Never a marketing number. */
  value: number;
  suffix?: string;
  label: string;
};

/** Icon, a big number that counts up when first seen, and a label. */
export function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="group flex flex-col items-center gap-2 px-4 py-6 text-center">
      {stat.pack ? (
        <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-light transition-transform duration-300 group-hover:scale-110">
          <PackIcon name={stat.pack} size={34} />
        </span>
      ) : (
        <IconTile visual={{ icon: stat.icon, tone: stat.tone }} size="md" shape="rounded" className="group-hover:scale-110" />
      )}
      <CountUp value={stat.value} suffix={stat.suffix} className="text-2xl font-extrabold text-heading sm:text-[1.625rem]" />
      <span className="text-sm font-medium text-muted">{stat.label}</span>
    </div>
  );
}

/** A row of StatCards in one card, divided: 2 columns on phones, 4 from lg. */
export function StatsStrip({ stats, label }: { stats: Stat[]; label: string }): ReactNode {
  return (
    <section
      data-reveal="up"
      aria-label={label}
      className="card grid grid-cols-2 divide-border lg:grid-cols-4 lg:divide-x rtl:lg:divide-x-reverse"
    >
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </section>
  );
}
