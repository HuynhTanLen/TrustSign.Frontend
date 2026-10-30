import * as React from "react";
import { CircleAlert, RefreshCw } from "lucide-react";
import { ApiError } from "@/lib/api";
import { Button } from "./button";

/** Khung thông báo lỗi thân thiện kèm mã theo dõi (Correlation ID) để tra cứu log. */
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
      ? "Tài khoản của bạn không có quyền xem nội dung này."
      : api
      ? api.message
      : "Không kết nối được máy chủ API. Vui lòng kiểm tra kết nối rồi thử lại.";

  return (
    <div
      role="alert"
      className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-lg border border-danger/25 bg-surface shadow-card motion-safe:animate-fade-in"
    >
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-badge-declined-bg text-danger shrink-0">
        <CircleAlert className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-fg">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{message}</p>
        {api?.correlationId && (
          <p className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-sm bg-strip border border-line font-mono text-xs text-muted">
            Mã theo dõi: {api.correlationId}
          </p>
        )}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="self-start sm:self-center">
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          Thử lại
        </Button>
      )}
    </div>
  );
}
