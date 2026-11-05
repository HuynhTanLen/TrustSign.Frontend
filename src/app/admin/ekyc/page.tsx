"use client";

import * as React from "react";
import { ScanFace } from "lucide-react";
import { ekycApi, type AdminEkyc, type EkycImageKind } from "@/lib/api/ekyc";
import { ApiError } from "@/lib/api";
import { useApi } from "@/lib/use-api";
import { MAX_FACE_DISTANCE } from "@/lib/ekyc-vision";
import { formatDate, formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { ReasonDialog } from "@/components/reason-dialog";

const KINDS: [EkycImageKind, string][] = [
  ["Selfie", "Khuôn mặt"],
  ["Front", "CCCD mặt trước"],
  ["Back", "CCCD mặt sau"],
];

function ImagesDialog({ row, onClose }: { row: AdminEkyc | null; onClose: () => void }) {
  const [urls, setUrls] = React.useState<Partial<Record<EkycImageKind, string>>>({});
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!row) return;
    let cancelled = false;
    const created: string[] = [];
    Promise.all(KINDS.map(([k]) => ekycApi.adminImageUrl(row.id, k)))
      .then((list) => {
        created.push(...list);
        if (!cancelled) setUrls({ Selfie: list[0], Front: list[1], Back: list[2] });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      created.forEach((u) => URL.revokeObjectURL(u));
      setUrls({});
      setFailed(false);
    };
  }, [row]);

  return (
    <Dialog open={!!row} onClose={onClose} title={row ? `Hồ sơ eKYC: ${row.fullName}` : ""} size="xl">
      {row && (
        <div className="flex flex-col gap-4">
          {failed && <p className="text-sm text-danger" role="alert">Không tải được ảnh hồ sơ.</p>}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {KINDS.map(([k, label]) => (
              <figure key={k} className="flex flex-col gap-1">
                {urls[k] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- ảnh đã giải mã dạng blob
                  <img src={urls[k]} alt={label} className="aspect-[4/3] w-full rounded-md bg-page object-contain" />
                ) : (
                  <div className="aspect-[4/3] w-full animate-pulse rounded-md bg-skeleton" />
                )}
                <figcaption className="text-xs text-muted">{label}</figcaption>
              </figure>
            ))}
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
            <dt className="text-muted">Tài khoản</dt>
            <dd>{row.accountName} ({row.email})</dd>
            <dt className="text-muted">Số CCCD</dt>
            <dd className="font-mono">{row.citizenId}</dd>
            <dt className="text-muted">Ngày sinh · Giới tính</dt>
            <dd>{formatDate(row.dateOfBirth)} · {row.gender}</dd>
            <dt className="text-muted">Nơi thường trú</dt>
            <dd>{row.address || "—"}</dd>
            <dt className="text-muted">Ngày cấp</dt>
            <dd>{formatDate(row.issuedOn)}</dd>
            <dt className="text-muted">Khoảng cách khuôn mặt</dt>
            <dd>{row.faceDistance.toFixed(3)} (ngưỡng {MAX_FACE_DISTANCE}, do trình duyệt tính)</dd>
          </dl>
        </div>
      )}
    </Dialog>
  );
}

export default function AdminEkycPage() {
  const { toast } = useToast();
  const { data, error, isLoading, reload, mutate } = useApi("admin-ekyc", ekycApi.adminList);
  const [viewing, setViewing] = React.useState<AdminEkyc | null>(null);
  const [revoking, setRevoking] = React.useState<AdminEkyc | null>(null);

  const revoke = async (reason: string) => {
    if (!revoking) return;
    try {
      await ekycApi.revoke(revoking.id, reason);
      mutate((list) => list.map((r) => (r.id === revoking.id ? { ...r, status: "Revoked", revokeReason: reason } : r)));
      toast(`Đã thu hồi xác minh của ${revoking.fullName}.`, "success");
      setRevoking(null);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thu hồi được.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Xác minh danh tính (eKYC)"
        description="Đối soát ảnh khuôn mặt và CCCD người dùng đã gửi; thu hồi khi nghi ngờ giả mạo."
      />
      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <Card title={`Hồ sơ đã gửi (${data?.length ?? 0})`} icon={ScanFace} bodyClassName="p-0">
          <Table
            bare
            loading={isLoading}
            rows={data ?? []}
            getRowKey={(r) => r.id}
            ariaLabel="Danh sách hồ sơ eKYC"
            empty={<p className="p-6 text-center text-sm text-muted">Chưa có hồ sơ eKYC nào.</p>}
            columns={[
              {
                key: "name",
                header: "Họ tên trên CCCD",
                primary: true,
                render: (r) => (
                  <span className="flex flex-col">
                    <span className="font-semibold text-fg">{r.fullName}</span>
                    <span className="text-xs text-muted">{r.email}</span>
                  </span>
                ),
              },
              { key: "cccd", header: "Số CCCD", render: (r) => <span className="font-mono">{r.citizenId}</span> },
              { key: "dist", header: "Khoảng cách", align: "right", hideOnMobile: true, render: (r) => r.faceDistance.toFixed(3) },
              {
                key: "status",
                header: "Trạng thái",
                render: (r) =>
                  r.status === "Verified" ? (
                    <Badge tone="completed" size="sm">Đã xác minh</Badge>
                  ) : (
                    <Badge tone="declined" size="sm" title={r.revokeReason ?? undefined}>Đã thu hồi</Badge>
                  ),
              },
              { key: "at", header: "Thời gian", hideOnMobile: true, render: (r) => formatDateTime(r.createdAt) },
              {
                key: "actions",
                header: "",
                align: "right",
                render: (r) => (
                  <span className="inline-flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setViewing(r)}>Xem ảnh</Button>
                    {r.status === "Verified" && (
                      <Button size="sm" variant="danger" onClick={() => setRevoking(r)}>Thu hồi</Button>
                    )}
                  </span>
                ),
              },
            ]}
          />
        </Card>
      )}
      <ImagesDialog row={viewing} onClose={() => setViewing(null)} />
      <ReasonDialog
        open={!!revoking}
        title="Thu hồi xác minh danh tính"
        message={revoking ? `Tài khoản ${revoking.email} sẽ phải làm eKYC lại.` : ""}
        confirmLabel="Thu hồi"
        onClose={() => setRevoking(null)}
        onConfirm={revoke}
      />
    </div>
  );
}
