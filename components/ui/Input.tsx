import * as React from "react";
import { cn } from "./cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, description, error, required, className, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? `roze-input-${generatedId}`;
    const descId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [descId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="flex min-w-0 flex-col gap-1.5">
        <label htmlFor={inputId} className="text-small font-medium text-ink">
          {label}
          {required ? (
            <span className="text-danger" aria-hidden="true">
              {" "}
              *
            </span>
          ) : null}
        </label>
        {description ? (
          <p id={descId} className="text-small text-muted">
            {description}
          </p>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-11 w-full min-w-0 rounded-sm border border-line bg-mist/40 px-3 text-body text-ink",
            "placeholder:text-muted outline-none transition-colors",
            "focus:border-teal-deep motion-reduce:transition-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-danger" : null,
            className
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} className="text-small text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
