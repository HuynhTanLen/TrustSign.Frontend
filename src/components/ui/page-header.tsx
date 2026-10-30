import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Hàng tiêu đề trang chuẩn SaaS: đường dẫn quay lại tùy chọn, tiêu đề sắc nét, mô tả và cụm nút bên phải. */
export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="inline-flex items-center gap-1 mb-1.5 text-xs font-semibold text-primary hover:text-primary-hover"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-fg">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
