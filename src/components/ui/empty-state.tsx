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
      className={`flex flex-col items-center justify-center px-6 py-12 text-center rounded-lg border border-dashed border-line-strong bg-surface ${className}`}
    >
      {icon && (
        <div className="mb-3.5 inline-flex items-center justify-center w-12 h-12 rounded-full bg-selected text-primary border border-primary/10 [&_svg]:w-5 [&_svg]:h-5">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-fg mb-1">{title}</h3>
      <p className="max-w-[420px] text-sm text-muted mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
