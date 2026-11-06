"use client";

import * as React from "react";
import QRCode from "qrcode";
import { LoaderCircle, RefreshCw, Smartphone } from "lucide-react";
import { ApiError } from "@/lib/api";
import { ekycApi, type MyEkyc } from "@/lib/api/ekyc";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

const POLL_MS = 3000;

/** Mã QR + đếm ngược; tạo lại component (đổi key) là có link mới. */
function HandoffBody({ onVerified, onRenew }: { onVerified: (r: MyEkyc) => void; onRenew: () => void }) {
  const [link, setLink] = React.useState<{ url: string; qr: string; expiresAt: number } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [now, setNow] = React.useState(() => Date.now());
  const onVerifiedRef = React.useRef(onVerified);
  React.useEffect(() => {
    onVerifiedRef.current = onVerified;
  }, [onVerified]);

  React.useEffect(() => {
    let cancelled = false;
    ekycApi
      .createHandoff()
      .then(async ({ token, expiresAt }) => {
        // Điện thoại phải mở được đúng địa chỉ máy tính đang dùng, nên lấy origin hiện tại.
        const url = `${window.location.origin}/ekyc/${encodeURIComponent(token)}`;
        const qr = await QRCode.toDataURL(url, { width: 240, margin: 1, errorCorrectionLevel: "M" });
        if (!cancelled) setLink({ url, qr, expiresAt: new Date(expiresAt).getTime() });
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Không tạo được mã QR."));
    return () => {
      cancelled = true;
    };
  }, []);

  const expired = link !== null && now >= link.expiresAt;

  React.useEffect(() => {
    if (!link || expired) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(() => {
      ekycApi
        .mine()
        .then((r) => r.status === "Verified" && onVerifiedRef.current(r))
        .catch(() => undefined);
    }, POLL_MS);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [link, expired]);

  if (error) return <p className="text-sm text-danger" role="alert">{error}</p>;
  if (!link) return <div className="mx-auto h-60 w-60 animate-pulse rounded-md bg-skeleton" />;

  const seconds = Math.max(0, Math.floor((link.expiresAt - now) / 1000));
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {expired ? (
        <div className="flex h-60 w-60 flex-col items-center justify-center gap-3 rounded-md border border-line bg-page p-4">
          <p className="text-sm text-muted">Mã đã hết hạn.</p>
          <Button variant="primary" onClick={onRenew}>
            <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Tạo mã mới
          </Button>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- ảnh QR dạng data URL sinh tại chỗ
        <img src={link.qr} alt="Mã QR mở trang xác minh trên điện thoại" width={240} height={240} className="rounded-md border border-line" />
      )}
      {!expired && (
        <>
          <p className="text-sm text-muted">
            Mã hết hạn sau <span className="font-semibold text-fg tabular-nums">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>
          </p>
          <p className="flex items-center gap-2 text-sm text-muted" role="status">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            Đang chờ bạn hoàn tất trên điện thoại…
          </p>
          <p className="max-w-sm break-all text-xs text-muted">{link.url}</p>
        </>
      )}
    </div>
  );
}

export function EkycHandoffDialog({
  open,
  onClose,
  onBack,
  onVerified,
}: {
  open: boolean;
  onClose: () => void;
  /** Quay lại chụp bằng camera của máy tính. */
  onBack: () => void;
  onVerified: (r: MyEkyc) => void;
}) {
  const [attempt, setAttempt] = React.useState(0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="eKYC trên thiết bị khác"
      description="Quét mã bằng camera điện thoại, làm các bước xác minh trên điện thoại. Trang này tự cập nhật khi xong."
      size="md"
      footer={
        <Button variant="ghost" onClick={onBack}>
          Chụp bằng máy tính này
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="flex items-start gap-2 rounded-md bg-primary-subtle p-3 text-sm text-fg">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          Mã chỉ dùng cho tài khoản của bạn trong 15 phút. Không chia sẻ mã này cho người khác.
        </p>
        {open && <HandoffBody key={attempt} onVerified={onVerified} onRenew={() => setAttempt((a) => a + 1)} />}
      </div>
    </Dialog>
  );
}
