"use client";

import * as React from "react";
import { CircleCheck, CircleAlert, Info } from "lucide-react";

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

  const toast = React.useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col items-end gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className="pointer-events-auto w-full sm:w-[360px] flex items-start gap-2 px-4 py-3 rounded-md border border-line bg-surface shadow-menu text-sm text-fg motion-safe:animate-slide-in"
          >
            {t.type === "error" ? (
              <CircleAlert className="w-4 h-4 mt-0.5 text-danger shrink-0" aria-hidden="true" />
            ) : t.type === "info" ? (
              <Info className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
            ) : (
              <CircleCheck className="w-4 h-4 mt-0.5 text-success shrink-0" aria-hidden="true" />
            )}
            <span>{t.message}</span>
          </div>
        ))}
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
