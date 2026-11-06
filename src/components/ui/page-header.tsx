import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
  className?: string;
}

/** Hàng tiêu đề trang chuẩn SaaS: đường dẫn quay lại tùy chọn, tiêu đề sắc nét, mô tả và cụm nút bên phải. */
export function PageHeader({
  title,
  description,
  actions,
  back,
  className = "",
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-line",
        className,
      )}
    >
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="group inline-flex items-center gap-1 mb-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" aria-hidden="true" />
            <span>{back.label}</span>
          </Link>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg break-words">{title}</h1>
        {description && <p className="mt-1 text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
    </header>
  );
}
