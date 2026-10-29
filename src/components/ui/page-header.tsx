import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Page title row: optional back link, 20px title, one line of description, actions on the right. */
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
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="inline-flex items-center gap-1 mb-1 text-sm text-primary underline underline-offset-2">
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            {back.label}
          </Link>
        )}
        <h1 className="text-xl font-semibold text-fg">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
