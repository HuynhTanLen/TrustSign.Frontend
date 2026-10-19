"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

type Status = "checking" | "up" | "down";

const LABELS: Record<Status, string> = {
  checking: "Đang kiểm tra gateway…",
  up: "Gateway đang chạy",
  down: "Không kết nối được gateway",
};

const DOT_COLORS: Record<Status, string> = {
  checking: "bg-zinc-400",
  up: "bg-emerald-500",
  down: "bg-red-500",
};

/** Trang tạm để biết frontend đã gọi được gateway. Thay bằng trang đăng nhập khi làm F01. */
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
    <p className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      <span className={`size-2 rounded-full ${DOT_COLORS[status]}`} />
      {LABELS[status]}
      <code className="font-mono text-xs">{API_URL}</code>
    </p>
  );
}
