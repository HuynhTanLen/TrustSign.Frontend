"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Award, Ban, CircleCheck, CircleX, Download, FileText, History, Users } from "lucide-react";
import { contractsApi, type ContractSigner } from "@/lib/api/contracts";
import { ROOT_CA_URL } from "@/lib/api/admin";
import { API_URL } from "@/lib/api";
import { USE_MOCK } from "@/lib/mock";
import { useApi } from "@/lib/use-api";
import { formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const SIGNER_STATUS: Record<ContractSigner["status"], { label: string; className: string }> = {
  Signed: { label: "Đã ký", className: "bg-badge-completed-bg text-badge-completed-fg" },
  Current: { label: "Đang chờ ký", className: "bg-badge-signing-bg text-badge-signing-fg" },
  Waiting: { label: "Chưa tới lượt", className: "bg-badge-draft-bg text-badge-draft-fg" },
  Declined: { label: "Từ chối", className: "bg-badge-declined-bg text-badge-declined-fg" },
};

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data: contract, error, isLoading, reload, mutate } = useApi(`contract:${id}`, () => contractsApi.get(id));
  const [confirmCancel, setConfirmCancel] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await contractsApi.cancel(id);
      mutate((c) => ({ ...c, status: "Cancelled" }));
      setConfirmCancel(false);
      toast("Đã hủy hợp đồng.", "success");
    } catch {
      toast("Không hủy được hợp đồng.", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownload = () => {
    if (USE_MOCK) {
      toast("Dữ liệu mẫu không có file PDF.", "info");
      return;
    }
    window.open(`${API_URL}/api/contracts/${encodeURIComponent(id)}/signed-document`, "_blank");
  };

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Chi tiết hợp đồng" back={{ href: "/app/contracts", label: "Danh sách hợp đồng" }} />
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }

  if (isLoading || !contract) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Đang tải">
        <Skeleton className="h-14 w-2/3" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Skeleton className="h-96 lg:col-span-7" />
          <Skeleton className="h-96 lg:col-span-5" />
        </div>
      </div>
    );
  }

  const canCancel = contract.status === "Pending" || contract.status === "Signing";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back={{ href: "/app/contracts", label: "Danh sách hợp đồng" }}
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            {contract.title}
            <Badge contractStatus={contract.status} />
          </span>
        }
        description={
          <>
            Mã <span className="font-mono">{contract.code}</span> · Người tạo {contract.creatorName} · Hạn ký{" "}
            {formatDateTime(contract.dueAt)}
          </>
        }
        actions={
          <>
            {canCancel && (
              <Button variant="danger" onClick={() => setConfirmCancel(true)}>
                <Ban className="w-4 h-4" aria-hidden="true" />
                Hủy hợp đồng
              </Button>
            )}
            {contract.status === "Completed" && (
              <Button variant="primary" onClick={handleDownload}>
                <Download className="w-4 h-4" aria-hidden="true" />
                Tải bản đã ký
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card title="Tài liệu" icon={FileText} bodyClassName="p-0">
            {contract.documentUrl ? (
              <iframe src={contract.documentUrl} title={`Tài liệu ${contract.code}`} className="w-full h-[640px]" />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center gap-1 bg-page text-center px-4">
                <FileText className="w-6 h-6 text-muted" aria-hidden="true" />
                <p className="text-sm font-semibold text-fg">Chưa có bản xem trước</p>
                <p className="text-sm text-muted">File PDF hiển thị ở đây khi máy chủ trả về đường dẫn tài liệu.</p>
              </div>
            )}
          </Card>

          {contract.signatures.length > 0 && (
            <Card
              title="Chữ ký số"
              icon={Award}
              actions={
                <a href={ROOT_CA_URL} className="text-primary underline underline-offset-2">
                  Tải Root CA
                </a>
              }
              bodyClassName="p-0"
            >
              <ul className="divide-y divide-line">
                {contract.signatures.map((s) => (
                  <li key={s.serial} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-fg">
                        {s.signerName} <span className="font-normal text-muted">({s.signerEmail})</span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        Cấp bởi {s.issuer} · Serial <span className="font-mono">{s.serial}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        Ký lúc {formatDateTime(s.signedAt)}
                        {s.timestampAuthority && ` · Dấu thời gian ${s.timestampAuthority}`}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 h-[22px] px-2 rounded-sm text-xs font-semibold shrink-0 ${
                        s.valid ? "bg-badge-completed-bg text-badge-completed-fg" : "bg-badge-declined-bg text-badge-declined-fg"
                      }`}
                    >
                      {s.valid ? <CircleCheck className="w-3.5 h-3.5" /> : <CircleX className="w-3.5 h-3.5" />}
                      {s.valid ? "Hợp lệ" : "Không hợp lệ"}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="px-4 py-3 border-t border-line bg-page text-xs text-muted">
                Để Adobe Reader hiện &quot;chữ ký hợp lệ&quot;, tải Root CA của hệ thống và thêm vào danh sách tin cậy.
              </p>
            </Card>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card title="Người ký theo thứ tự" icon={Users} bodyClassName="p-0">
            <ol className="divide-y divide-line">
              {contract.signers.map((s) => (
                <li key={s.order} className="p-4 flex items-start gap-3">
                  <span
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-sm font-semibold shrink-0 ${
                      s.status === "Signed" ? "bg-success text-white" : s.status === "Current" ? "bg-primary text-white" : "bg-page text-muted border border-line"
                    }`}
                  >
                    {s.order}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-fg">{s.fullName}</p>
                    <p className="text-xs text-muted truncate">{s.email}</p>
                    {s.signedAt && <p className="mt-0.5 text-xs text-muted">Ký lúc {formatDateTime(s.signedAt)}</p>}
                    {s.declineReason && <p className="mt-0.5 text-xs text-danger">Lý do: {s.declineReason}</p>}
                  </div>
                  <span className={`inline-flex items-center h-[22px] px-2 rounded-sm text-xs font-semibold shrink-0 ${SIGNER_STATUS[s.status].className}`}>
                    {SIGNER_STATUS[s.status].label}
                  </span>
                </li>
              ))}
            </ol>
          </Card>

          <Card title="Nhật ký thao tác" icon={History}>
            <ol className="relative flex flex-col gap-4 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-line">
              {contract.events.map((ev, i) => (
                <li
                  key={ev.hash}
                  className="relative pl-6 motion-safe:animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full bg-surface border-2 border-primary" aria-hidden="true" />
                  <p className="text-xs text-muted">{formatDateTime(ev.at)}</p>
                  <p className="text-sm font-semibold text-fg">{ev.title}</p>
                  <p className="text-xs text-muted">{ev.detail}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted truncate" title={ev.hash}>
                    SHA-256 {ev.hash.slice(0, 16)}…
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      <Dialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Hủy hợp đồng"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmCancel(false)} disabled={isCancelling}>
              Không hủy
            </Button>
            <Button variant="danger" onClick={handleCancel} isLoading={isCancelling}>
              Hủy hợp đồng
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg">
          Hợp đồng <span className="font-mono">{contract.code}</span> sẽ bị hủy. Người ký chưa ký sẽ không mở được link nữa.
        </p>
      </Dialog>
    </div>
  );
}
