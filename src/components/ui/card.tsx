import * as React from "react";
import type { LucideIcon } from "lucide-react";

interface CardProps {
  /** Tiêu đề phần đầu thẻ; bỏ qua để tạo khung nội dung phẳng. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  /** Các nút thao tác hoặc nhãn bên phải tiêu đề. */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Ghi đè khoảng đệm thân thẻ (ví dụ "p-0" cho bảng). */
  bodyClassName?: string;
}

export function Card({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className = "",
  bodyClassName = "p-5",
}: CardProps) {
  return (
    <section
      className={`bg-surface border border-line rounded-lg shadow-card overflow-hidden ${className}`}
    >
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-strip/75 border-b border-line">
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
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** Thẻ KPI trên trang tổng quan: nhãn, chỉ số nổi bật, biểu tượng màu và dòng ngữ cảnh. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger";
}) {
  const iconTone = {
    primary: "bg-selected text-primary border-primary/15",
    success: "bg-badge-completed-bg text-badge-completed-fg border-success/15",
    warning: "bg-badge-pending-bg text-badge-pending-fg border-warning/15",
    danger: "bg-badge-declined-bg text-badge-declined-fg border-danger/15",
  }[tone];

  return (
    <div className="group relative bg-surface border border-line rounded-lg p-5 shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
          <div className="mt-2.5 text-2xl font-bold tracking-tight text-fg tabular-nums">
            {value}
          </div>
        </div>
        {Icon && (
          <span
            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border shrink-0 ${iconTone}`}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
          </span>
        )}
      </div>
      {hint && <div className="mt-2.5 text-xs text-muted">{hint}</div>}
    </div>
  );
}
