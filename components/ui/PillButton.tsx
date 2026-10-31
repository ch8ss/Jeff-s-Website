import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Arrow } from "./Arrow";

type Variant = "accent" | "outline" | "ghost-light";

const styles: Record<Variant, string> = {
  accent: "bg-accent text-ink hover:bg-accent-hover",
  outline: "border border-current hover:bg-current/10",
  "ghost-light": "border border-white/30 text-text-light hover:bg-white/10",
};

export function pillClass(variant: Variant = "accent", extra = "") {
  return `label inline-flex items-center gap-2 rounded-full px-5 py-3 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${styles[variant]} ${extra}`;
}

export function PillLink({
  variant = "accent",
  children,
  arrow = true,
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; arrow?: boolean; children: ReactNode }) {
  return (
    <Link {...props} className={pillClass(variant, className)}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}
