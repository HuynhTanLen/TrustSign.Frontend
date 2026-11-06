"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { CircleX, ScanFace, ShieldCheck } from "lucide-react";
import { ApiError } from "@/lib/api";
import { ekycApi, type MyEkyc } from "@/lib/api/ekyc";
import { useApi } from "@/lib/use-api";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { EkycDialog } from "@/components/ekyc-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

function Message({ tone, title, text }: { tone: "ok" | "bad"; title: string; text: string }) {
  const Icon = tone === "ok" ? ShieldCheck : CircleX;
  return (
    <Card bodyClassName="p-8">
      <div className="flex flex-col items-center gap-3 text-center" role="status">
        <Icon className={tone === "ok" ? "h-12 w-12 text-success" : "h-12 w-12 text-danger"} aria-hidden="true" />
        <h1 className="text-lg font-semibold text-fg">{title}</h1>
        <p className="max-w-md text-sm text-muted">{text}</p>
      </div>
    </Card>
  );
}

/** Trang mở từ mã QR trên máy tính: làm eKYC bằng camera điện thoại, không cần đăng nhập. */
function HandoffContent() {
  const { token } = useParams<{ token: string }>();
  const { data, error, isLoading, reload } = useApi(`ekyc-handoff:${token}`, () => ekycApi.getHandoff(token));
  const [open, setOpen] = React.useState(true);
  const [done, setDone] = React.useState<MyEkyc | null>(null);
  const submitFn = React.useCallback((req: Parameters<typeof ekycApi.submitHandoff>[1]) => ekycApi.submitHandoff(token, req), [token]);

  return (
    <div className="flex min-h-screen flex-col bg-page text-fg">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-[880px] flex-1 flex-col gap-4 px-4 py-8">
        {error ? (
          error instanceof ApiError && error.status === 404 ? (
            <Message tone="bad" title="Liên kết đã hết hạn" text="Mã QR chỉ dùng được 15 phút. Hãy tạo mã mới trên máy tính rồi quét lại." />
          ) : (
            <ErrorState error={error} onRetry={reload} />
          )
        ) : isLoading || !data ? (
          <Skeleton className="h-48" />
        ) : done || data.status === "Verified" ? (
          <Message tone="ok" title="Đã xác minh danh tính" text="Bạn có thể quay lại máy tính, trang cài đặt sẽ tự cập nhật trong vài giây." />
        ) : (
          <Card bodyClassName="p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <ScanFace className="h-10 w-10 text-primary" aria-hidden="true" />
              <h1 className="text-lg font-semibold text-fg">Xác minh danh tính (eKYC)</h1>
              <p className="text-sm text-muted">
                Đang xác minh cho tài khoản <span className="font-semibold text-fg">{data.maskedEmail}</span>.
              </p>
              {!open && (
                <Button variant="primary" onClick={() => setOpen(true)}>
                  Tiếp tục xác minh
                </Button>
              )}
            </div>
          </Card>
        )}
        {data && !done && data.status !== "Verified" && (
          <EkycDialog open={open} onClose={() => setOpen(false)} onVerified={setDone} submitFn={submitFn} />
        )}
      </main>
      <PublicFooter />
    </div>
  );
}

export default function EkycHandoffPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-page" />}>
      <HandoffContent />
    </React.Suspense>
  );
}
