"use client";

import * as React from "react";
import { CircleCheck, CircleAlert, Info, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
}

interface ToastContextType {
  toast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 left-5 sm:left-auto z-50 flex flex-col items-end gap-2.5 pointer-events-none">
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
              className="pointer-events-auto w-full sm:w-[380px] flex items-center gap-3 px-4 py-3.5 rounded-lg border border-line bg-surface shadow-menu text-sm font-medium text-fg motion-safe:animate-slide-in"
            >
              <span
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0 ${iconWrap}`}
              >
                {t.type === "error" ? (
                  <CircleAlert className="w-4 h-4" aria-hidden="true" />
                ) : t.type === "info" ? (
                  <Info className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <CircleCheck className="w-4 h-4" aria-hidden="true" />
                )}
              </span>
              <span className="flex-1 min-w-0 leading-snug">{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Đóng thông báo"
                className="inline-flex items-center justify-center w-6 h-6 rounded-sm text-muted hover:text-fg hover:bg-strip cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
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
