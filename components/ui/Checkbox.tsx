import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "./cn";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, required, className, id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id ?? `roze-checkbox-${generatedId}`;
    const descId = description ? `${checkboxId}-description` : undefined;
    const errorId = error ? `${checkboxId}-error` : undefined;
    const describedBy = [descId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <div className="relative flex h-6 items-center">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              required={required}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              className={cn(
                "peer size-5 shrink-0 appearance-none rounded-[6px] border border-line bg-mist/40",
                "outline-none transition-colors motion-reduce:transition-none",
                "checked:bg-teal-deep checked:border-teal-deep",
                "disabled:cursor-not-allowed disabled:opacity-50",
                error ? "border-danger" : null,
                className
              )}
              {...props}
            />
            <Check
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden size-5 text-paper peer-checked:block"
              strokeWidth={3}
            />
          </div>
          <label htmlFor={checkboxId} className="text-body text-ink">
            {label}
            {required ? (
              <span className="text-danger" aria-hidden="true">
                {" "}
                *
              </span>
            ) : null}
          </label>
        </div>
        {description ? (
          <p id={descId} className="text-small text-muted ps-7">
            {description}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="text-small text-danger ps-7">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
