import * as React from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-latin font-medium " +
  "transition-colors disabled:pointer-events-none disabled:opacity-50 " +
  "motion-reduce:transition-none";

const variantClasses: Record<ButtonVariant, string> = {
  // Teal as a FILL — large surface, not small text. Ink text stays AA-safe on it.
  primary: "bg-teal text-ink hover:bg-teal-deep hover:text-paper",
  secondary: "bg-ink text-paper hover:bg-ink/90",
  outline: "bg-transparent text-ink border border-line hover:bg-mist",
  ghost: "bg-transparent text-teal-deep hover:bg-mist",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-small",
  md: "h-11 px-4 text-body",
  lg: "h-13 px-6 text-h3",
};

/** Build button classes without rendering a <button>, so a <Link> can wear
 * button styling directly instead of nesting a real button in an anchor. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
  disabled,
}: ButtonClassOptions = {}): string {
  return cn(
    base,
    variantClasses[variant],
    sizeClasses[size],
    disabled ? "pointer-events-none opacity-50" : null,
    className
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-4 animate-spin motion-reduce:animate-none", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"
      />
    </svg>
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Icon rendered before the label. */
  iconStart?: React.ReactNode;
  /** Icon rendered after the label. */
  iconEnd?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      iconStart,
      iconEnd,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={buttonClasses({ variant, size, className, disabled: isDisabled })}
        {...props}
      >
        {loading ? <Spinner /> : iconStart}
        {children}
        {!loading ? iconEnd : null}
      </button>
    );
  }
);
Button.displayName = "Button";
