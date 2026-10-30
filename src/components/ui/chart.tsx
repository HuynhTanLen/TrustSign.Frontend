import * as React from "react";

/** Biểu đồ cột tối giản, hiển thị trực quan số liệu trên từng cột. */
export function BarChart({
  data,
  height = 180,
}: {
  data: { label: string; value: number; display?: string }[];
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      <div className="flex items-end gap-2.5 border-b border-line" style={{ height }}>
        {data.map((d, i) => (
          <div key={d.label} className="flex-1 h-full flex flex-col items-center justify-end gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-fg tabular-nums">{d.display ?? d.value}</span>
            <div
              className="w-full max-w-11 rounded-t-md bg-primary origin-bottom motion-safe:animate-[grow-y_600ms_var(--ease-out-soft)_both]"
              style={{ height: `${Math.max(4, (d.value / max) * 85)}%`, animationDelay: `${i * 40}ms` }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2.5 pt-2.5">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-xs font-medium text-muted truncate">
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
}: {
  value: number;
  max?: number;
  tone?: "primary" | "success" | "warning" | "danger" | "muted";
  label?: string;
}) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
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
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className="h-2.5 rounded-full bg-selected/80 border border-primary/10 overflow-hidden"
    >
      <div
        className={`h-full rounded-full ${fill} origin-left motion-safe:animate-grow-x`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
