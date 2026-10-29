import * as React from "react";
import { CircleAlert } from "lucide-react";
import { ApiError } from "@/lib/api";
import { Button } from "./button";

/** Friendly failure line plus the trace code people quote when reporting it. */
export function ErrorState({
  error,
  title = "Không tải được dữ liệu",
  onRetry,
}: {
  error: unknown;
  title?: string;
  onRetry?: () => void;
}) {
  const api = error instanceof ApiError ? error : null;
  const message =
    api?.status === 404
      ? "Chức năng này chưa có trên máy chủ hoặc dữ liệu không tồn tại."
      : api?.status === 403
      ? "Tài khoản không có quyền xem nội dung này."
      : api
      ? api.message
      : "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.";

  return (
    <div role="alert" className="flex items-start gap-3 p-4 rounded-md border border-line bg-surface motion-safe:animate-fade-in">
      <CircleAlert className="w-5 h-5 mt-0.5 text-danger shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-fg">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{message}</p>
        {api?.correlationId && (
          <p className="mt-1 font-mono text-xs text-muted">Mã theo dõi: {api.correlationId}</p>
        )}
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
