"use client";

import * as React from "react";
import { CircleCheck, CircleAlert, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const MAX_TOASTS = 5;
const TOAST_DURATION_MS = 4200;

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const clearTimer = React.useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const dismiss = React.useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((prev) => prev.filter((t) => t.id !== id));
    },
    [clearTimer],
  );

  const scheduleDismiss = React.useCallback(
    (id: string, delay = TOAST_DURATION_MS) => {
      clearTimer(id);
      const timer = setTimeout(() => {
        timersRef.current.delete(id);
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, delay);
      timersRef.current.set(id, timer);
    },
    [clearTimer],
  );

  React.useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const toast = React.useCallback(
    (message: string, type: ToastType = "success") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => {
        const next = [...prev, { id, message, type }];
        if (next.length > MAX_TOASTS) {
          const removed = next.shift();
          if (removed) clearTimer(removed.id);
        }
        return next;
      });
      scheduleDismiss(id);
    },
    [clearTimer, scheduleDismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions text"
        className="fixed bottom-5 right-5 left-5 sm:left-auto z-50 flex flex-col items-end gap-2.5 pointer-events-none"
      >
        {toasts.map((t) => {
          const iconWrap =
            t.type === "error"
              ? "bg-badge-declined-bg text-danger"
              : t.type === "info"
              ? "bg-selected text-primary"
              : "bg-badge-completed-bg text-success";

          return (
            <div
              key={t.id}
              role={t.type === "error" ? "alert" : "status"}
              onMouseEnter={() => clearTimer(t.id)}
              onMouseLeave={() => scheduleDismiss(t.id, 2000)}
              className={cn(
                "pointer-events-auto w-full sm:w-[390px] flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl border border-line bg-surface/95 backdrop-blur-md shadow-2xl shadow-slate-900/15 text-sm font-semibold text-fg motion-safe:animate-slide-in",
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center justify-center w-8 h-8 rounded-xl shrink-0 shadow-xs",
                  iconWrap,
                )}
              >
                {t.type === "error" ? (
                  <CircleAlert className="w-4.5 h-4.5" aria-hidden="true" />
                ) : t.type === "info" ? (
                  <Info className="w-4.5 h-4.5" aria-hidden="true" />
                ) : (
                  <CircleCheck className="w-4.5 h-4.5" aria-hidden="true" />
                )}
              </span>
              <span className="flex-1 min-w-0 leading-snug break-words">{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Đóng thông báo"
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-muted hover:text-fg hover:bg-slate-100 hover:rotate-90 transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
