import * as React from "react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-line bg-surface shadow-xs ${className}`}
    >
      {icon && (
        <div className="mb-3 p-2.5 rounded-full bg-slate-100 text-slate-600">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-fg mb-1">{title}</h3>
      <p className="max-w-md text-xs text-muted mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
