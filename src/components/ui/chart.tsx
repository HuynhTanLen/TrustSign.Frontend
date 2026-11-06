import * as React from "react";
import { cn } from "@/lib/cn";

export interface BarChartDatum {
  label: string;
  value: number;
  display?: string;
}

/** Biểu đồ cột hiện đại, hiển thị trực quan số liệu trên từng cột kèm hiệu ứng nảy nhẹ khi rê chuột. */
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
          "flex items-center justify-center text-xs text-muted border border-dashed border-line rounded-xl",
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
              className="group flex-1 h-full flex flex-col items-center justify-end gap-1.5 min-w-0"
            >
              <span className="text-xs font-bold text-fg tabular-nums truncate max-w-full transition-transform group-hover:-translate-y-0.5 group-hover:text-primary">
                {d.display ?? safeVal}
              </span>
              <div
                className="w-full max-w-11 rounded-t-lg bg-gradient-to-t from-[#122e54] to-blue-600 origin-bottom motion-safe:animate-[grow-y_600ms_var(--ease-out-soft)_both] transition-transform duration-200 group-hover:scale-x-105 group-hover:brightness-110 shadow-xs"
                style={{
                  height: `${Math.max(6, (safeVal / max) * 85)}%`,
                  animationDelay: `${i * 45}ms`,
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
            className="flex-1 text-center text-xs font-semibold text-muted truncate"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Thanh tiến độ hạn mức hiện đại với gradient và tia sáng phản xạ. */
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
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600",
    success: "bg-gradient-to-r from-emerald-500 to-teal-600",
    warning: "bg-gradient-to-r from-amber-500 to-orange-600",
    danger: "bg-gradient-to-r from-rose-500 to-red-600",
    muted: "bg-slate-400",
  }[tone];

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.min(safeVal, safeMax)}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-label={label}
      className={cn(
        "relative h-2.5 rounded-full bg-slate-100 border border-slate-200/80 overflow-hidden shadow-inner",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full origin-left motion-safe:animate-grow-x relative overflow-hidden", fill)}
        style={{ width: `${pct}%` }}
      >
        {/* Shimmer sweep effect inside progress bar */}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
        />
      </div>
    </div>
  );
}
