"use client";

import * as React from "react";
import { CircleAlert, RefreshCw } from "lucide-react";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Button } from "./button";

export interface ErrorStateProps {
  error: unknown;
  title?: string;
  onRetry?: () => void | Promise<void>;
  isRetrying?: boolean;
  className?: string;
}

/** Khung thông báo lỗi thân thiện kèm mã theo dõi (Correlation ID) để tra cứu log. */
export function ErrorState({
  error,
  title = "Không tải được dữ liệu",
  onRetry,
  isRetrying = false,
  className = "",
}: ErrorStateProps) {
  const [internalRetrying, setInternalRetrying] = React.useState(false);
  const api = error instanceof ApiError ? error : null;

  const message = React.useMemo(() => {
    if (api) {
      if (api.status === 404) {
        return "Chức năng này chưa có trên máy chủ hoặc dữ liệu không tồn tại.";
      }
      if (api.status === 403) {
        return "Tài khoản của bạn không có quyền xem nội dung này.";
      }
      return api.message;
    }
    if (typeof error === "string" && error.trim()) {
      return error;
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Không kết nối được máy chủ API. Vui lòng kiểm tra kết nối rồi thử lại.";
  }, [api, error]);

  const handleRetry = async () => {
    if (!onRetry || isRetrying || internalRetrying) return;
    try {
      setInternalRetrying(true);
      await onRetry();
    } finally {
      setInternalRetrying(false);
    }
  };

  const busy = isRetrying || internalRetrying;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-lg border border-danger/25 bg-surface shadow-card motion-safe:animate-fade-in",
        className,
      )}
    >
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-badge-declined-bg text-danger shrink-0">
        <CircleAlert className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-fg">{title}</p>
        <p className="mt-0.5 text-sm text-muted break-words">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          isLoading={busy}
          loadingText="Đang thử lại…"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={handleRetry}
          className="self-start sm:self-center shrink-0"
        >
          Thử lại
        </Button>
      )}
    </div>
  );
}
