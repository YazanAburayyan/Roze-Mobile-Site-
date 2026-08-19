import * as React from "react";
import { cn } from "./cn";

export type BadgeVariant = "neutral" | "teal" | "gold" | "danger";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

// Gold is the "genuine / warranty" badge. Per the brand's 60/30/10 rule gold
// stays under 5% of any screen and is never a background fill elsewhere —
// reserve this variant for warranty/authenticity claims, not general use.
const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-mist/60 text-ink border border-line",
  teal: "bg-teal-deep text-paper border border-teal-deep",
  gold: "bg-transparent text-ink border border-gold",
  danger: "bg-danger/10 text-danger border border-danger/30",
};

export function Badge({ variant = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-small font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
