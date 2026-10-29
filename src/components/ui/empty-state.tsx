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
      className={`flex flex-col items-center justify-center px-6 py-8 text-center rounded-md border border-dashed border-line-strong bg-surface ${className}`}
    >
      {icon && <div className="mb-3 text-muted [&_svg]:w-6 [&_svg]:h-6">{icon}</div>}
      <h3 className="text-base font-semibold text-fg mb-1">{title}</h3>
      <p className="max-w-[420px] text-sm text-muted mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
