import {
  BarChart3,
  HeartPulse,
  Percent,
  RefreshCw,
  Sigma,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

/**
 * The landing hero's illustration: a tilted blue calculator with small tiles
 * floating around it and a handwritten tagline, after the design comp.
 *
 * Built from markup and CSS rather than shipped as an image, so it is sharp
 * at every size, themeable, and costs a few hundred bytes instead of a
 * hundred kilobytes. Purely decorative, so the whole thing is aria-hidden;
 * the words in it are passed in so they translate with the page.
 */
export function HeroArt({
  title,
  subtitle,
  scriptLines,
}: {
  title: string;
  subtitle: string;
  scriptLines: [string, string];
}) {
  return (
    <div aria-hidden className="relative mx-auto aspect-[10/9] w-full max-w-[520px] select-none">
      {/* Soft glow behind everything. */}
      <div className="animate-glow absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.35),transparent_65%)] blur-2xl" />

      {/* The calculator. */}
      <div
        className="animate-float-tilt absolute left-[26%] top-[4%] w-[52%]"
        style={{ "--tilt": "14deg" } as CSSProperties}
      >
        <div className="relative rounded-[34px] bg-gradient-to-br from-[#4f8dff] via-[#2563eb] to-[#1d3fbf] p-[7%] shadow-[0_40px_60px_-25px_rgba(29,63,191,0.75),inset_0_2px_0_rgba(255,255,255,0.35),inset_0_-10px_0_rgba(15,35,120,0.45)]">
          {/* Display */}
          <div className="rounded-2xl bg-gradient-to-br from-[#e0ecff] to-[#b9d3ff] px-[9%] py-[10%] shadow-[inset_0_2px_6px_rgba(29,63,191,0.25)]">
            <p className="text-right font-script text-[clamp(18px,3.2vw,30px)] font-semibold leading-none text-[#1d3fbf]">
              {title}
            </p>
            <p className="mt-1 text-right font-script text-[clamp(13px,2.1vw,20px)] font-semibold leading-tight text-[#1e40af]">
              {subtitle}
            </p>
          </div>
          {/* Keys */}
          <div className="mt-[9%] grid grid-cols-4 gap-[7%]">
            {Array.from({ length: 12 }, (_, index) => (
              <span
                key={index}
                className={`aspect-square rounded-[10px] shadow-[inset_0_-3px_0_rgba(15,35,120,0.35),0_2px_4px_rgba(15,35,120,0.3)] ${
                  index === 11
                    ? "bg-gradient-to-b from-[#fde68a] to-[#facc15]"
                    : index % 4 === 3
                      ? "bg-white/45"
                      : "bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <FloatingTile
        icon={BarChart3}
        className="left-[14%] top-[6%] bg-white text-primary"
        tilt={-10}
        delay={0}
      />
      <FloatingTile
        icon={Percent}
        className="left-[6%] top-[30%] bg-gradient-to-br from-[#fcd34d] to-[#f59e0b] text-white"
        tilt={-8}
        delay={900}
      />
      <FloatingTile
        icon={Sigma}
        className="left-[12%] top-[54%] bg-gradient-to-br from-[#60a5fa] to-[#2563eb] text-white"
        tilt={6}
        delay={1800}
        small
      />
      <FloatingTile
        icon={RefreshCw}
        className="right-[4%] top-[26%] bg-white text-primary"
        tilt={10}
        delay={600}
      />
      <FloatingTile
        icon={HeartPulse}
        className="right-[8%] top-[50%] bg-white text-rose-500"
        tilt={-6}
        delay={1400}
        small
      />

      {/* Handwritten tagline with an underline that draws itself in. */}
      <div className="absolute bottom-[3%] right-[2%] -rotate-6 text-right">
        <p className="font-script text-[clamp(22px,3.4vw,34px)] font-semibold leading-[1.05] text-heading">
          {scriptLines[0]}
          <br />
          {scriptLines[1]}
        </p>
        <svg viewBox="0 0 220 24" className="ms-auto mt-1 h-4 w-[82%]" fill="none">
          <path
            d="M4 16 C 60 4, 140 4, 216 12"
            stroke="#facc15"
            strokeWidth="5"
            strokeLinecap="round"
            className="animate-draw"
            style={{ "--dash": 240 } as CSSProperties}
          />
        </svg>
      </div>
    </div>
  );
}

function FloatingTile({
  icon: Icon,
  className,
  tilt,
  delay,
  small = false,
}: {
  icon: LucideIcon;
  className: string;
  tilt: number;
  delay: number;
  small?: boolean;
}) {
  return (
    <div
      className={`animate-float-tilt absolute grid place-items-center rounded-2xl shadow-[0_18px_30px_-14px_rgba(15,35,120,0.45)] ring-1 ring-black/5 ${
        small ? "h-[11%] w-[11%]" : "h-[14%] w-[14%]"
      } ${className}`}
      style={{ "--tilt": `${tilt}deg`, "--delay": `${delay}ms` } as CSSProperties}
    >
      <Icon className="h-1/2 w-1/2" strokeWidth={2.4} />
    </div>
  );
}
