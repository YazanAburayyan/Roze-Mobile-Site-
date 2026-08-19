import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label: string;
  description?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, description, error, required, className, id, options, placeholder, ...props },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id ?? `roze-select-${generatedId}`;
    const descId = description ? `${selectId}-description` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;
    const describedBy = [descId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-small font-medium text-ink">
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
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "h-11 w-full appearance-none rounded-sm border border-line bg-mist/40",
              "ps-3 pe-9 text-body text-ink outline-none transition-colors",
              "focus:border-teal-deep motion-reduce:transition-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-danger" : null,
              className
            )}
            {...props}
          >
            {placeholder ? (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          />
        </div>
        {error ? (
          <p id={errorId} className="text-small text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";
