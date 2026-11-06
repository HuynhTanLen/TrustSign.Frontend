import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Skeleton } from "./skeleton";

export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  interactive?: boolean;
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/70 border-b border-slate-100",
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
    <div className={cn("p-5 sm:p-6", className)} {...props}>
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
        "flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-50/50 border-t border-slate-100 text-xs text-muted",
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
  interactive = false,
  children,
  className = "",
  bodyClassName = "p-5 sm:p-6",
  ...props
}: CardProps) {
  return (
    <section
      aria-busy={loading || undefined}
      className={cn(
        "group relative bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden transition-all duration-200",
        interactive && "hover:-translate-y-0.5 hover:shadow-card-hover hover:border-slate-300",
        className,
      )}
      {...props}
    >
      {title && (
        <CardHeader>
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                <Icon className="w-4 h-4" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold text-slate-900 tracking-tight truncate">{title}</h2>
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

/** Thẻ KPI phong cách Enterprise FinTech sạch sẽ, sang trọng (không màu neon). */
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
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
  }[tone];

  if (loading) {
    return (
      <div
        aria-busy="true"
        className={cn(
          "bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col gap-3",
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
        "group relative bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-slate-300",
        "overflow-hidden cursor-default",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted truncate">
            {label}
          </p>
          <div className="mt-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums truncate">
            {value}
          </div>
        </div>
        {Icon && (
          <span
            className={cn(
              "inline-flex items-center justify-center w-11 h-11 rounded-xl border shrink-0 transition-transform duration-200 group-hover:scale-105",
              iconTone,
            )}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
          </span>
        )}
      </div>
      {hint && <div className="mt-3 text-xs text-muted flex items-center gap-1.5 font-medium">{hint}</div>}
    </div>
  );
}
