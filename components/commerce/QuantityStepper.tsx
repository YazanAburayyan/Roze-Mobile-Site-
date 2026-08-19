"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui";

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  /** Inclusive upper bound, e.g. remaining stock. */
  max: number;
  min?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * −/+ buttons with a clamped number input. Value never leaves [min, max].
 */
export function QuantityStepper({
  value,
  onChange,
  max,
  min = 1,
  disabled = false,
  className,
}: QuantityStepperProps) {
  const t = useTranslations("a11y");
  const tProduct = useTranslations("product");

  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const parsed = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(parsed)) return;
    onChange(clamp(parsed));
  }

  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <div
      className={cn(
        "inline-flex h-11 items-center rounded-sm border border-line bg-mist/40",
        disabled ? "opacity-50" : null,
        className
      )}
    >
      <button
        type="button"
        aria-label={t("decreaseQuantity")}
        disabled={!canDecrease}
        onClick={() => onChange(clamp(value - 1))}
        className="flex h-full w-9 items-center justify-center text-ink transition-colors hover:bg-mist disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={tProduct("quantity")}
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={handleInputChange}
        className="h-full w-12 border-x border-line bg-transparent text-center font-mono text-body tabular-nums text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label={t("increaseQuantity")}
        disabled={!canIncrease}
        onClick={() => onChange(clamp(value + 1))}
        className="flex h-full w-9 items-center justify-center text-ink transition-colors hover:bg-mist disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
