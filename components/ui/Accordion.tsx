"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./cn";

export interface AccordionItemData {
  value: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItemData[];
  /** Allow more than one panel open at a time. Defaults to single-open. */
  multiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({ items, multiple = false, defaultOpen = [], className }: AccordionProps) {
  const [openValues, setOpenValues] = React.useState<Set<string>>(new Set(defaultOpen));

  function toggle(itemValue: string) {
    setOpenValues((prev) => {
      const next = multiple ? new Set(prev) : new Set<string>();
      if (prev.has(itemValue)) {
        next.delete(itemValue);
      } else {
        next.add(itemValue);
      }
      return next;
    });
  }

  return (
    <div className={cn("flex flex-col divide-y divide-line border-y border-line", className)}>
      {items.map((item) => {
        const open = openValues.has(item.value);
        const headerId = `accordion-header-${item.value}`;
        const panelId = `accordion-panel-${item.value}`;

        return (
          <div key={item.value}>
            <h3 className="text-body">
              <button
                type="button"
                id={headerId}
                aria-expanded={open}
                aria-controls={panelId}
                disabled={item.disabled}
                onClick={() => toggle(item.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggle(item.value);
                  }
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-4 py-4 text-start font-medium text-ink",
                  "transition-colors motion-reduce:transition-none",
                  "disabled:pointer-events-none disabled:opacity-50"
                )}
              >
                <span>{item.title}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-5 shrink-0 text-muted transition-transform motion-reduce:transition-none",
                    open ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!open}
              className="pb-4 text-body text-muted"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
