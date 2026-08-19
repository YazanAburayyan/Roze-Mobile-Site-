"use client";

import * as React from "react";
import { cn } from "./cn";

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

/**
 * Arrow-key navigation reads the tablist's resolved direction from the DOM
 * (`getComputedStyle(...).direction`) rather than assuming LTR, so in RTL
 * ArrowLeft moves to the next tab and ArrowRight moves to the previous one —
 * the opposite of LTR — automatically, without a locale prop.
 */
export function Tabs({ items, defaultValue, value, onValueChange, className }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(
    defaultValue ?? items[0]?.value ?? ""
  );
  const activeValue = value ?? internalValue;
  const listRef = React.useRef<HTMLDivElement>(null);
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());

  function selectTab(next: string) {
    setInternalValue(next);
    onValueChange?.(next);
  }

  function focusTab(itemValue: string) {
    tabRefs.current.get(itemValue)?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const enabled = items.filter((item) => !item.disabled);
    if (enabled.length === 0) return;

    const currentIndex = enabled.findIndex((item) => item.value === activeValue);
    const rtl = listRef.current
      ? getComputedStyle(listRef.current).direction === "rtl"
      : false;

    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = rtl ? currentIndex - 1 : currentIndex + 1;
    } else if (event.key === "ArrowLeft") {
      nextIndex = rtl ? currentIndex + 1 : currentIndex - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = enabled.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();

    const wrapped = ((nextIndex % enabled.length) + enabled.length) % enabled.length;
    const next = enabled[wrapped]!;
    selectTab(next.value);
    focusTab(next.value);
  }

  return (
    <div className={className}>
      <div
        ref={listRef}
        role="tablist"
        onKeyDown={handleKeyDown}
        className="flex items-center gap-1 border-b border-line"
      >
        {items.map((item) => {
          const selected = item.value === activeValue;
          return (
            <button
              key={item.value}
              ref={(el) => {
                if (el) tabRefs.current.set(item.value, el);
                else tabRefs.current.delete(item.value);
              }}
              type="button"
              role="tab"
              id={`tab-${item.value}`}
              aria-selected={selected}
              aria-controls={`tabpanel-${item.value}`}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => selectTab(item.value)}
              className={cn(
                "border-b-2 px-4 py-2.5 text-body font-medium transition-colors motion-reduce:transition-none",
                "disabled:pointer-events-none disabled:opacity-50",
                selected
                  ? "border-teal-deep text-teal-deep"
                  : "border-transparent text-muted hover:text-ink"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.value}
          role="tabpanel"
          id={`tabpanel-${item.value}`}
          aria-labelledby={`tab-${item.value}`}
          hidden={item.value !== activeValue}
          className="pt-4"
        >
          {item.value === activeValue ? item.content : null}
        </div>
      ))}
    </div>
  );
}
