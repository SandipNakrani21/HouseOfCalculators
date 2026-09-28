import type { ReactNode } from "react";

import type { Tone } from "@/lib/visuals";

/**
 * A small rounded label.
 *
 *   <Badge>New</Badge>                              soft blue
 *   <Badge tone="green" size="sm">Health</Badge>    category colours, uppercase
 *   <Badge variant="outline" icon={<Globe />}>...</Badge>   the hero badge
 */
export function Badge({
  children,
  tone,
  variant = tone ? "tone" : "soft",
  size = tone ? "sm" : "md",
  icon,
  className = "",
}: {
  children: ReactNode;
  /** Category colour. Implies variant "tone". */
  tone?: Tone;
  variant?: "soft" | "tone" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`badge badge-${variant} badge-${size} ${tone ? `tone-${tone}` : ""} ${className}`}
    >
      {icon ? <span aria-hidden className="inline-flex [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span> : null}
      {children}
    </span>
  );
}
