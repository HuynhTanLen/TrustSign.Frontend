"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

type Status = "checking" | "up" | "down";

const LABELS: Record<Status, string> = {
  checking: "Đang kiểm tra backend…",
  up: "Backend đang chạy",
  down: "Không kết nối được backend",
};

export function GatewayStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/health/live`, { signal: controller.signal })
      .then((response) => setStatus(response.ok ? "up" : "down"))
      .catch(() => {
        if (!controller.signal.aborted) {
          setStatus("down");
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-surface border border-line shadow-xs text-xs text-muted">
      <span className="relative flex h-2 w-2">
        {status === "up" && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            status === "up"
              ? "bg-emerald-500"
              : status === "down"
              ? "bg-rose-500"
              : "bg-slate-400"
          }`}
        />
      </span>
      <span className="font-semibold text-fg">{LABELS[status]}</span>
      <code className="font-mono text-[11px] text-muted/80 bg-slate-100 px-1.5 py-0.5 rounded">
        {API_URL}
      </code>
    </div>
  );
}
