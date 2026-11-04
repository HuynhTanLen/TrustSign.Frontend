import * as React from "react";
import { cn } from "@/lib/cn";

export interface BarChartDatum {
  label: string;
  value: number;
  display?: string;
}

/** Biểu đồ cột tối giản, hiển thị trực quan số liệu trên từng cột. */
export function BarChart({
  data,
  height = 180,
  emptyText = "Chưa có dữ liệu thống kê.",
  className = "",
}: {
  data: readonly BarChartDatum[] | null | undefined;
  height?: number;
  emptyText?: string;
  className?: string;
}) {
  const safeData = React.useMemo(() => (Array.isArray(data) ? data : []), [data]);

  if (safeData.length === 0) {
    return (
      <div
        role="status"
        style={{ height }}
        className={cn(
          "flex items-center justify-center text-xs text-muted border border-dashed border-line rounded-md",
          className,
        )}
      >
        {emptyText}
      </div>
    );
  }

  const max = Math.max(
    1,
    ...safeData.map((d) => (Number.isFinite(d.value) && d.value > 0 ? d.value : 0)),
  );

  return (
    <div className={className} role="img" aria-label="Biểu đồ thống kê">
      <div className="flex items-end gap-2.5 border-b border-line" style={{ height }}>
        {safeData.map((d, i) => {
          const safeVal = Number.isFinite(d.value) && d.value > 0 ? d.value : 0;
          return (
            <div
              key={d.label}
              className="flex-1 h-full flex flex-col items-center justify-end gap-1.5 min-w-0"
            >
              <span className="text-xs font-semibold text-fg tabular-nums truncate max-w-full">
                {d.display ?? safeVal}
              </span>
              <div
                className="w-full max-w-11 rounded-t-md bg-primary origin-bottom motion-safe:animate-[grow-y_600ms_var(--ease-out-soft)_both]"
                style={{
                  height: `${Math.max(4, (safeVal / max) * 85)}%`,
                  animationDelay: `${i * 40}ms`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2.5 pt-2.5">
        {safeData.map((d) => (
          <span
            key={d.label}
            title={d.label}
            className="flex-1 text-center text-xs font-medium text-muted truncate"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Thanh tiến độ hạn mức hiện đại. */
export function Progress({
  value,
  max = 100,
  tone = "primary",
  label,
  className = "",
}: {
  value: number;
  max?: number;
  tone?: "primary" | "success" | "warning" | "danger" | "muted";
  label?: string;
  className?: string;
}) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeVal = Number.isFinite(value) ? Math.max(0, value) : 0;
  const pct = Math.min(100, Math.max(0, Math.round((safeVal / safeMax) * 100)));

  const fill = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    muted: "bg-muted",
  }[tone];

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.min(safeVal, safeMax)}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-label={label}
      className={cn(
        "h-2.5 rounded-full bg-selected/80 border border-primary/10 overflow-hidden",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full origin-left motion-safe:animate-grow-x", fill)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
