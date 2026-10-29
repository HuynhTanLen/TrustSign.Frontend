"use client";

import * as React from "react";
import { Award, Download, Search, ShieldCheck, ShieldOff } from "lucide-react";
import { adminApi, ROOT_CA_URL, type Certificate } from "@/lib/api/admin";
import { useApi } from "@/lib/use-api";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { ReasonDialog } from "@/components/reason-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

export default function AdminCertificatesPage() {
  const { toast } = useToast();
  const { data, error, isLoading, reload, mutate } = useApi("admin-certs", adminApi.certificates);
  const [query, setQuery] = React.useState("");
  const [revoking, setRevoking] = React.useState<Certificate | null>(null);

  const q = query.trim().toLowerCase();
  const rows = (data?.items ?? []).filter(
    (c) => !q || [c.serial, c.subject, c.subjectEmail].some((v) => v.toLowerCase().includes(q)),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Chứng thư số"
        description="Chứng thư do CA của hệ thống cấp cho người ký; thu hồi khi lộ khóa hoặc ngừng sử dụng"
        actions={
          <a href={ROOT_CA_URL}>
            <Button variant="secondary">
              <Download className="w-4 h-4" aria-hidden="true" />
              Tải Root CA
            </Button>
          </a>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <Card title="Tổ chức cấp chứng thư" icon={ShieldCheck}>
            {!data ? (
              <Skeleton className="h-12" />
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-muted">CA gốc</dt>
                  <dd className="font-semibold text-fg">{data.authority.rootName}</dd>
                </div>
                <div>
                  <dt className="text-muted">CA cấp phát</dt>
                  <dd className="font-semibold text-fg">{data.authority.issuingName}</dd>
                </div>
                <div>
                  <dt className="text-muted">Thuật toán</dt>
                  <dd className="font-semibold text-fg">{data.authority.algorithm}</dd>
                </div>
              </dl>
            )}
          </Card>

          <Card
            title={isLoading ? "Chứng thư đã cấp" : `Chứng thư đã cấp (${data?.items.length ?? 0})`}
            icon={Award}
            actions={
              <div className="w-64 [&_label]:sr-only">
                <Input label="Tìm chứng thư" placeholder="Serial, tên hoặc email" value={query} onChange={(e) => setQuery(e.target.value)} leftIcon={<Search />} />
              </div>
            }
            bodyClassName="p-0"
          >
            <Table
              bare
              loading={isLoading}
              rows={rows}
              getRowKey={(c) => c.serial}
              empty={<p className="p-4 text-sm text-muted">{q ? "Không có chứng thư khớp từ khóa." : "Chưa cấp chứng thư nào."}</p>}
              columns={[
                {
                  key: "subject",
                  header: "Người được cấp",
                  primary: true,
                  render: (c) => (
                    <span className="block py-2 whitespace-normal">
                      <span className="font-semibold">{c.subject.replace(/^CN=/, "").split(",")[0]}</span>
                      <span className="block text-xs text-muted">
                        {c.subjectEmail} · {c.tenantName}
                      </span>
                    </span>
                  ),
                },
                { key: "serial", header: "Serial", render: (c) => <span className="font-mono text-xs">{c.serial}</span> },
                { key: "valid", header: "Hiệu lực", render: (c) => `${formatDate(c.validFrom)} – ${formatDate(c.validTo)}` },
                {
                  key: "status",
                  header: "Trạng thái",
                  render: (c) => (
                    <span className="block py-2 whitespace-normal">
                      <span
                        className={`inline-flex items-center h-[22px] px-2 rounded-sm text-xs font-semibold ${
                          c.revoked ? "bg-badge-declined-bg text-badge-declined-fg" : "bg-badge-completed-bg text-badge-completed-fg"
                        }`}
                      >
                        {c.revoked ? "Đã thu hồi" : "Còn hiệu lực"}
                      </span>
                      {c.revokeReason && <span className="block text-xs text-muted mt-0.5">{c.revokeReason}</span>}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  header: "",
                  align: "right",
                  render: (c) =>
                    c.revoked ? null : (
                      <Button variant="ghost" className="text-danger" onClick={() => setRevoking(c)}>
                        <ShieldOff className="w-4 h-4" aria-hidden="true" />
                        Thu hồi
                      </Button>
                    ),
                },
              ]}
            />
          </Card>
        </>
      )}

      <ReasonDialog
        open={revoking !== null}
        title="Thu hồi chứng thư"
        message={
          <>
            Chứng thư <span className="font-mono">{revoking?.serial}</span> sẽ được đưa vào danh sách thu hồi (CRL). Chữ ký tạo sau thời điểm này
            bằng chứng thư đó không còn hợp lệ.
          </>
        }
        reasonLabel="Lý do thu hồi"
        confirmLabel="Thu hồi"
        onClose={() => setRevoking(null)}
        onConfirm={async (reason) => {
          if (!revoking) return;
          await adminApi.revokeCertificate(revoking.serial, reason);
          mutate((d) => ({
            ...d,
            items: d.items.map((c) => (c.serial === revoking.serial ? { ...c, revoked: true, revokeReason: reason } : c)),
          }));
          toast(`Đã thu hồi chứng thư ${revoking.serial}.`, "success");
          setRevoking(null);
        }}
      />
    </div>
  );
}
