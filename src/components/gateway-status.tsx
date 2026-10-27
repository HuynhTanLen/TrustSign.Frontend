"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

type Status = "checking" | "up" | "down";

const LABELS: Record<Status, string> = {
  checking: "Đang kiểm tra backend…",
  up: "Backend đang chạy",
  down: "Không kết nối được backend",
};

const DOT_COLORS: Record<Status, string> = {
  checking: "bg-muted",
  up: "bg-success",
  down: "bg-danger",
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
    <p className="flex items-center gap-2 text-xs text-muted">
      <span className={`w-2 h-2 rounded-full ${DOT_COLORS[status]}`} />
      {LABELS[status]}
      <code className="font-mono text-xs">{API_URL}</code>
    </p>
  );
}
