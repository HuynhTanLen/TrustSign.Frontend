import * as React from "react";
import type { LucideIcon } from "lucide-react";

interface CardProps {
  /** Shown in the title strip; omit for a plain bordered box. */
  title?: React.ReactNode;
  icon?: LucideIcon;
  /** Right side of the title strip: a link, a badge, a small button. */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Override body padding, e.g. "p-0" around a table. */
  bodyClassName?: string;
}

export function Card({ title, icon: Icon, actions, children, className = "", bodyClassName = "p-4" }: CardProps) {
  return (
    <section className={`bg-surface border border-line rounded-md overflow-hidden ${className}`}>
      {title && (
        <header className="flex items-center justify-between gap-3 px-4 h-11 bg-strip border-b border-line">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-fg min-w-0">
            {Icon && <Icon className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />}
            <span className="truncate">{title}</span>
          </h2>
          {actions && <div className="flex items-center gap-2 shrink-0 text-sm">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** A figure for dashboards: label, big number, one line of context. */
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
  const bar = { primary: "bg-primary", success: "bg-success", warning: "bg-warning", danger: "bg-danger" }[tone];
  return (
    <div className="relative bg-surface border border-line rounded-md p-4 overflow-hidden">
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-[3px] ${bar}`} />
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{label}</span>
        {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
      </div>
      <div className="mt-2 text-2xl font-semibold text-fg tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}
