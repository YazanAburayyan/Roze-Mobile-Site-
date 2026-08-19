"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "./cn";
import { useDialogBehavior } from "./dialog-utils";

export type DrawerSide = "inline-start" | "inline-end" | "block-end";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: DrawerSide;
  children?: React.ReactNode;
  className?: string;
  closeLabel?: string;
}

/**
 * Slides in from a logical edge. Positioning uses inset-inline-start /
 * inset-inline-end / inset-block-end directly — real logical CSS properties,
 * not a transform paired with an rtl:/ltr: className check — so `inline-start`
 * opens from the right in RTL and the left in LTR automatically, with no JS
 * locale branching anywhere in this file.
 */
export function Drawer({
  open,
  onClose,
  title,
  side = "inline-end",
  children,
  className,
  closeLabel = "Close",
}: DrawerProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  useDialogBehavior(panelRef, open, onClose);

  if (!open) return null;

  const isBlockEnd = side === "block-end";

  const panelPositionStyle: React.CSSProperties = isBlockEnd
    ? { insetInlineStart: 0, insetInlineEnd: 0, insetBlockEnd: 0 }
    : side === "inline-start"
      ? { insetBlockStart: 0, insetBlockEnd: 0, insetInlineStart: 0 }
      : { insetBlockStart: 0, insetBlockEnd: 0, insetInlineEnd: 0 };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-ink/60 motion-reduce:transition-none"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={panelPositionStyle}
        className={cn(
          "fixed flex flex-col border-line bg-paper text-ink shadow-roze outline-none",
          isBlockEnd
            ? "max-h-[85vh] w-full rounded-t-lg border-t"
            : side === "inline-start"
              ? "h-full w-full max-w-sm border-e"
              : "h-full w-full max-w-sm border-s",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <h2 id={titleId} className="text-h3">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="rounded-sm p-1 text-muted transition-colors hover:bg-mist hover:text-ink motion-reduce:transition-none"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
