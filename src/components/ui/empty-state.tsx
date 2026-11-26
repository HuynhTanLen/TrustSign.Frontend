import * as React from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  /** Cho phép truyền nút hoặc liên kết tùy chỉnh thay vì chỉ `actionLabel`. */
  action?: React.ReactNode;
  /** Nút thao tác phụ (ví dụ: Xem hướng dẫn, Xóa bộ lọc). */
  secondaryAction?: React.ReactNode;
  /** Chế độ thu gọn khi đặt bên trong thẻ nhỏ hoặc khung hẹp. */
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  secondaryAction,
  compact = false,
  className = "",
}: EmptyStateProps) {
  const hasActions = Boolean((actionLabel && onAction) || action || secondaryAction);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "group flex flex-col items-center justify-center text-center rounded-md border border-dashed border-[#D2CFC4] bg-[#F5F4EF]/60 hover:bg-[#F5F4EF] transition-colors",
        compact ? "px-4 py-8" : "px-6 py-12",
        className,
      )}
    >
      {icon && (
        <div
          aria-hidden="true"
          className={cn(
            "mb-4 inline-flex items-center justify-center rounded-sm bg-white text-[#1B4332] border border-[#C9DEB0] shadow-xs transition-transform duration-300 group-hover:-translate-y-0.5 shrink-0",
            compact ? "w-11 h-11 [&_svg]:w-5 [&_svg]:h-5" : "w-14 h-14 [&_svg]:w-6 [&_svg]:h-6",
          )}
        >
          {icon}
        </div>
      )}
      <h3 className={cn("font-extrabold text-fg", compact ? "text-sm" : "text-base")}>{title}</h3>
      {description && (
        <p className={cn("max-w-[420px] text-sm text-muted mt-1 leading-relaxed", hasActions ? "mb-5" : "")}>
          {description}
        </p>
      )}
      {hasActions && (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {action ?? (
            actionLabel &&
            onAction && (
              <Button variant="accent" glow size={compact ? "sm" : "md"} onClick={onAction}>
                {actionLabel}
              </Button>
            )
          )}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
