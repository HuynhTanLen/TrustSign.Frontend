"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export type DialogSize = "sm" | "md" | "lg" | "xl";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: DialogSize;
  /** Chặn đóng hộp thoại khi đang xử lý tác vụ bất đồng bộ quan trọng. */
  preventClose?: boolean;
  className?: string;
}

const dialogSizes: Record<DialogSize, string> = {
  sm: "max-w-[400px]",
  md: "max-w-[500px]",
  lg: "max-w-[680px]",
  xl: "max-w-[880px]",
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  preventClose = false,
  className = "",
}: DialogProps) {
  const [mounted, setMounted] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();
  const onCloseRef = React.useRef(onClose);
  const preventCloseRef = React.useRef(preventClose);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    onCloseRef.current = onClose;
    preventCloseRef.current = preventClose;
  }, [onClose, preventClose]);

  React.useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const body = bodyRef.current;

    const SELECTOR =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusables = () =>
      panel ? Array.from(panel.querySelectorAll<HTMLElement>(SELECTOR)) : [];

    // Ưu tiên focus phần tử có [data-autofocus] hoặc trường nhập liệu trong thân hộp thoại thay vì nút Đóng (X)
    const autoFocusTarget =
      panel?.querySelector<HTMLElement>("[data-autofocus]:not([disabled])") ??
      body?.querySelector<HTMLElement>(SELECTOR) ??
      focusables()[0] ??
      panel;

    autoFocusTarget?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!preventCloseRef.current) {
          e.stopPropagation();
          onCloseRef.current();
        }
      } else if (e.key === "Tab") {
        const items = focusables();
        if (items.length === 0) {
          e.preventDefault();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open || !mounted) return null;

  const handleBackdropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node) && !preventClose) {
      onClose();
    }
  };

  const dialogContent = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-overlay backdrop-blur-[2px] motion-safe:animate-fade-in p-4 sm:p-6"
      onMouseDown={handleBackdropMouseDown}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          tabIndex={-1}
          onMouseDown={(e) => e.stopPropagation()}
          className={cn(
            "w-full my-auto flex flex-col rounded-xl bg-surface border border-line shadow-dialog overflow-hidden motion-safe:animate-pop-in focus:outline-none",
            "max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)]",
            dialogSizes[size],
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 px-6 py-4 bg-strip/80 border-b border-line shrink-0">
            <div className="min-w-0">
              <h2 id={titleId} className="text-base font-bold tracking-tight text-fg truncate">
                {title}
              </h2>
              {description && (
                <p id={descId} className="mt-0.5 text-xs text-muted">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={preventClose}
              onClick={() => !preventClose && onClose()}
              aria-label="Đóng hộp thoại"
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted hover:bg-selected/60 hover:text-fg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <div
            ref={bodyRef}
            className="px-6 py-5 overflow-y-auto min-h-0 flex-1 overscroll-contain"
          >
            {children}
          </div>
          {footer && (
            <div className="flex flex-wrap justify-end gap-2.5 px-6 py-4 bg-strip/60 border-t border-line shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
