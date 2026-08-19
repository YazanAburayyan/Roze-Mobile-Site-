"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "./cn";

export type ToastVariant = "neutral" | "success" | "danger";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Milliseconds before auto-dismiss. Defaults to 5000. */
  duration?: number;
}

interface ToastRecord extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 5000;

const variantClasses: Record<ToastVariant, string> = {
  neutral: "border-line bg-paper text-ink",
  success: "border-teal-deep/30 bg-paper text-ink",
  danger: "border-danger/30 bg-paper text-ink",
};

const variantAccent: Record<ToastVariant, string> = {
  neutral: "bg-muted",
  success: "bg-teal-deep",
  danger: "bg-danger",
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastRecord;
  onDismiss: (id: string) => void;
}) {
  const duration = toast.duration ?? DEFAULT_DURATION;
  const remainingRef = React.useRef(duration);
  const startedAtRef = React.useRef<number>(Date.now());
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const start = React.useCallback(() => {
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => onDismiss(toast.id), remainingRef.current);
  }, [onDismiss, toast.id]);

  React.useEffect(() => {
    start();
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMouseEnter() {
    clear();
    remainingRef.current -= Date.now() - startedAtRef.current;
  }

  function handleMouseLeave() {
    start();
  }

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-md border p-4 shadow-roze",
        variantClasses[toast.variant ?? "neutral"]
      )}
    >
      <span
        aria-hidden="true"
        className={cn("mt-1 inline-block size-2 shrink-0 rounded-full", variantAccent[toast.variant ?? "neutral"])}
      />
      <div className="flex-1">
        <p className="text-small font-medium text-ink">{toast.title}</p>
        {toast.description ? (
          <p className="text-small text-muted">{toast.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="rounded-sm p-1 text-muted transition-colors hover:bg-mist hover:text-ink motion-reduce:transition-none"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = React.useCallback((options: ToastOptions) => {
    const id = `toast-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    setToasts((prev) => [...prev, { ...options, id }]);
    return id;
  }, []);

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed z-[100] flex flex-col gap-2 p-4"
        style={{ insetBlockEnd: 0, insetInlineEnd: 0 }}
      >
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastItem toast={item} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
