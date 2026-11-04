import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Skeleton } from "./skeleton";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Tiêu đề phần đầu thẻ; bỏ qua để tạo khung nội dung phẳng. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  /** Các nút thao tác hoặc nhãn bên phải tiêu đề. */
  actions?: React.ReactNode;
  /** Chân thẻ tùy chọn (hiển thị phân cách phía dưới). */
  footer?: React.ReactNode;
  /** Hiển thị trạng thái Skeleton khi đang tải nội dung thẻ. */
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
  /** Ghi đè khoảng đệm thân thẻ (ví dụ "p-0" cho bảng). */
  bodyClassName?: string;
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-strip/75 border-b border-line",
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}

export function CardBody({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-strip/50 border-t border-line text-xs text-muted",
        className,
      )}
      {...props}
    >
      {children}
    </footer>
  );
}

export function Card({
  title,
  description,
  icon: Icon,
  actions,
  footer,
  loading = false,
  children,
  className = "",
  bodyClassName = "p-5",
  ...props
}: CardProps) {
  return (
    <section
      aria-busy={loading || undefined}
      className={cn(
        "bg-surface border border-line rounded-lg shadow-card overflow-hidden",
        className,
      )}
      {...props}
    >
      {title && (
        <CardHeader>
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-selected text-primary border border-primary/10 shrink-0">
                <Icon className="w-4 h-4" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-fg truncate">{title}</h2>
              {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0 text-sm">{actions}</div>}
        </CardHeader>
      )}
      <div className={bodyClassName}>
        {loading ? (
          <div className="p-5 flex flex-col gap-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          children
        )}
      </div>
      {footer && <CardFooter>{footer}</CardFooter>}
    </section>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger";
  loading?: boolean;
  className?: string;
}

/** Thẻ KPI trên trang tổng quan: nhãn, chỉ số nổi bật, biểu tượng màu và dòng ngữ cảnh. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  loading = false,
  className = "",
}: StatCardProps) {
  const iconTone = {
    primary: "bg-selected text-primary border-primary/15",
    success: "bg-badge-completed-bg text-badge-completed-fg border-success/15",
    warning: "bg-badge-pending-bg text-badge-pending-fg border-warning/15",
    danger: "bg-badge-declined-bg text-badge-declined-fg border-danger/15",
  }[tone];

  if (loading) {
    return (
      <div
        aria-busy="true"
        className={cn(
          "bg-surface border border-line rounded-lg p-5 shadow-card flex flex-col gap-3",
          className,
        )}
      >
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative bg-surface border border-line rounded-lg p-5 shadow-card hover:shadow-card-hover transition-shadow overflow-hidden",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted truncate">
            {label}
          </p>
          <div className="mt-2.5 text-2xl font-bold tracking-tight text-fg tabular-nums truncate">
            {value}
          </div>
        </div>
        {Icon && (
          <span
            className={cn(
              "inline-flex items-center justify-center w-10 h-10 rounded-lg border shrink-0",
              iconTone,
            )}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
          </span>
        )}
      </div>
      {hint && <div className="mt-2.5 text-xs text-muted">{hint}</div>}
    </div>
  );
}
