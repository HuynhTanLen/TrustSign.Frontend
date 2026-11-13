"use client";

import * as React from "react";
import { History, Lock, LockOpen } from "lucide-react";
import { ApiError } from "@/lib/api";
import type { AdminHistoryItem } from "@/lib/api/admin";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ReasonDialog } from "@/components/reason-dialog";
import { useToast } from "@/components/ui/toast";

/** Danh sách nhãn – giá trị của một hồ sơ; giá trị trống hiện dấu gạch. */
export function InfoList({ items }: { items: [label: string, value: React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
      {items.map(([label, value]) => (
        <React.Fragment key={label}>
          <dt className="text-muted">{label}</dt>
          <dd className="text-fg break-words">{value === null || value === undefined || value === "" ? "—" : value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

/** Lịch sử thao tác quản trị lấy từ nhật ký hash-chain, mới nhất ở trên. */
export function AdminHistoryCard({ items }: { items: AdminHistoryItem[] }) {
  return (
    <Card title="Lịch sử quản trị" icon={History}>
      {items.length === 0 ? (
        <p className="text-sm text-muted">Chưa có thao tác nào được ghi nhận.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {items.map((h, i) => (
            <li key={`${h.at}-${i}`} className="text-sm">
              <p className="font-semibold text-fg">{h.title}</p>
              <p className="text-xs text-muted">
                {formatDateTime(h.at)}
                {h.actorEmail && ` · ${h.actorEmail}`}
              </p>
              {h.reason && <p className="text-xs text-fg mt-0.5">Lý do: {h.reason}</p>}
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

/** Nút khóa / mở khóa kèm hộp thoại; khóa bắt buộc nhập lý do. */
export function LockActions({
  name,
  noun,
  isLocked,
  lockMessage,
  unlockMessage,
  onLock,
  onUnlock,
}: {
  name: string;
  noun: string;
  isLocked: boolean;
  lockMessage: string;
  unlockMessage: string;
  onLock: (reason: string) => Promise<void>;
  onUnlock: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [locking, setLocking] = React.useState(false);
  const [unlocking, setUnlocking] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  // Lỗi (ví dụ 409 đã bị khóa ở tab khác) hiện thành toast và giữ hộp thoại mở.
  const run = async (action: () => Promise<void>, done: string, close: () => void) => {
    try {
      await action();
      toast(done, "success");
      close();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Thao tác không thành công. Thử lại.", "error");
    }
  };

  return (
    <>
      {isLocked ? (
        <Button variant="secondary" leftIcon={<LockOpen className="w-4 h-4" aria-hidden="true" />} onClick={() => setUnlocking(true)}>
          Mở khóa
        </Button>
      ) : (
        <Button variant="ghost" className="text-danger" leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />} onClick={() => setLocking(true)}>
          Khóa {noun}
        </Button>
      )}

      <ReasonDialog
        open={locking}
        title={`Khóa ${noun}`}
        message={
          <>
            <span className="font-semibold">{name}</span> {lockMessage}
          </>
        }
        reasonLabel="Lý do khóa"
        confirmLabel={`Khóa ${noun}`}
        onClose={() => setLocking(false)}
        onConfirm={(reason) => run(() => onLock(reason), `Đã khóa ${name}.`, () => setLocking(false))}
      />

      <Dialog
        open={unlocking}
        onClose={() => setUnlocking(false)}
        title={`Mở khóa ${noun}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setUnlocking(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              isLoading={busy}
              onClick={async () => {
                setBusy(true);
                await run(onUnlock, `Đã mở khóa ${name}.`, () => setUnlocking(false));
                setBusy(false);
              }}
            >
              Mở khóa
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg">
          <span className="font-semibold">{name}</span> {unlockMessage}
        </p>
      </Dialog>
    </>
  );
}
