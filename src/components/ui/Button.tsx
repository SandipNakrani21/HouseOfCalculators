import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Buttons. One look for every action on the site:
 *
 *   <Button variant="primary" size="md" icon={<Search />}>Search</Button>
 *   <ButtonLink href="/calculators" variant="outline" iconEnd={<ArrowRight />}>View all</ButtonLink>
 *
 * Variants: primary (solid blue), outline (white, bordered), ghost (text
 * only), white (for use on blue or navy). Sizes: sm, md, lg. `square` makes
 * an icon-only button; give it an aria-label.
 *
 * Hover lift, press and the ripple come from the .btn classes and the
 * site-wide Interactions component, so this stays a server component.
 */

export type ButtonVariant = "primary" | "outline" | "ghost" | "white";
export type ButtonSize = "sm" | "md" | "lg";

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon before the label. */
  icon?: ReactNode;
  /** Icon after the label, e.g. an arrow. Flipped automatically in RTL. */
  iconEnd?: ReactNode;
  /** Icon-only: equal width and height. Needs an aria-label. */
  square?: boolean;
  className?: string;
  children?: ReactNode;
};

export function buttonClass({
  variant = "primary",
  size = "md",
  square = false,
  className = "",
}: Pick<Common, "variant" | "size" | "square" | "className"> = {}): string {
  return `group btn btn-${variant} btn-${size}${square ? " btn-square" : ""} ${className}`.trim();
}

function Content({ icon, iconEnd, children }: Pick<Common, "icon" | "iconEnd" | "children">) {
  return (
    <>
      {icon ? <span aria-hidden className="inline-flex shrink-0 [&>svg]:h-[1.1em] [&>svg]:w-[1.1em]">{icon}</span> : null}
      {children}
      {iconEnd ? (
        <span aria-hidden className="card-arrow inline-flex shrink-0 [&>svg]:h-[1.1em] [&>svg]:w-[1.1em]">
          {iconEnd}
        </span>
      ) : null}
    </>
  );
}

export function Button({
  variant,
  size,
  icon,
  iconEnd,
  square,
  className,
  children,
  type = "button",
  ...rest
}: Common & Omit<ComponentProps<"button">, "children" | "className">) {
  return (
    <button type={type} className={buttonClass({ variant, size, square, className })} {...rest}>
      <Content icon={icon} iconEnd={iconEnd}>{children}</Content>
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  icon,
  iconEnd,
  square,
  className,
  children,
  ...rest
}: Common & Omit<ComponentProps<typeof Link>, "children" | "className">) {
  return (
    <Link className={`${buttonClass({ variant, size, square, className })}`} {...rest}>
      <Content icon={icon} iconEnd={iconEnd}>{children}</Content>
    </Link>
  );
}
