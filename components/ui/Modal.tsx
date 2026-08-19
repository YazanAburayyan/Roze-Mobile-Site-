"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "./cn";
import { useDialogBehavior } from "./dialog-utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  /** Accessible label for the close button. Pass a localized string. */
  closeLabel?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  closeLabel = "Close",
}: ModalProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  useDialogBehavior(panelRef, open, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full max-w-md rounded-md border border-line bg-paper text-ink shadow-roze",
          "outline-none",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="text-h3">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="text-small text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="rounded-sm p-1 text-muted transition-colors hover:bg-mist hover:text-ink motion-reduce:transition-none"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 pb-5">{children}</div>
      </div>
    </div>
  );
}
