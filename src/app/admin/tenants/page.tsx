"use client";

import * as React from "react";
import { Building2, Lock, LockOpen, Search } from "lucide-react";
import { adminApi, type AdminTenant } from "@/lib/api/admin";
import { useApi } from "@/lib/use-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { ReasonDialog } from "@/components/reason-dialog";
import { LockBadge } from "@/components/lock-badge";
import { Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

export default function AdminTenantsPage() {
  const { toast } = useToast();
  const { data, error, isLoading, reload, mutate } = useApi("admin-tenants", adminApi.tenants);
  const [query, setQuery] = React.useState("");
  const [locking, setLocking] = React.useState<AdminTenant | null>(null);
  const [unlocking, setUnlocking] = React.useState<AdminTenant | null>(null);

  const q = query.trim().toLowerCase();
  const rows = (data ?? []).filter(
    (t) => !q || t.name.toLowerCase().includes(q) || (t.taxCode ?? "").includes(q) || t.ownerEmail.toLowerCase().includes(q),
  );

  const update = (id: string, patch: Partial<AdminTenant>) => mutate((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Doanh nghiệp" description="Doanh nghiệp thuê bao trên toàn nền tảng; khóa khi vi phạm điều khoản" />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <Card
          title={isLoading ? "Danh sách doanh nghiệp" : `Danh sách doanh nghiệp (${data?.length ?? 0})`}
          icon={Building2}
          actions={
            <div className="w-64 [&_label]:sr-only">
              <Input label="Tìm doanh nghiệp" placeholder="Tên, mã số thuế, email" value={query} onChange={(e) => setQuery(e.target.value)} leftIcon={<Search />} />
            </div>
          }
          bodyClassName="p-0"
        >
          <Table
            bare
            loading={isLoading}
            rows={rows}
            getRowKey={(t) => t.id}
            empty={<p className="p-4 text-sm text-muted">{q ? "Không có doanh nghiệp khớp từ khóa." : "Chưa có doanh nghiệp nào."}</p>}
            columns={[
              {
                key: "name",
                header: "Doanh nghiệp",
                primary: true,
                render: (t) => (
                  <span className="block py-2 whitespace-normal">
                    <span className="font-semibold">{t.name}</span>
                    {t.lockReason && <span className="block text-xs text-danger">Lý do khóa: {t.lockReason}</span>}
                  </span>
                ),
              },
              { key: "tax", header: "Mã số thuế", render: (t) => <span className="font-mono text-xs text-muted">{t.taxCode ?? "—"}</span> },
              { key: "owner", header: "Chủ doanh nghiệp", render: (t) => t.ownerEmail },
              { key: "plan", header: "Gói", render: (t) => <span className="inline-flex items-center gap-2">Gói {t.planName} <Badge subscriptionStatus={t.subscriptionStatus} /></span> },
              { key: "members", header: "Thành viên", align: "right", render: (t) => t.membersCount },
              { key: "lock", header: "Trạng thái", render: (t) => <LockBadge locked={t.isLocked} /> },
              {
                key: "actions",
                header: "",
                align: "right",
                render: (t) =>
                  t.isLocked ? (
                    <Button variant="secondary" onClick={() => setUnlocking(t)}>
                      <LockOpen className="w-4 h-4" aria-hidden="true" />
                      Mở khóa
                    </Button>
                  ) : (
                    <Button variant="ghost" className="text-danger" onClick={() => setLocking(t)}>
                      <Lock className="w-4 h-4" aria-hidden="true" />
                      Khóa
                    </Button>
                  ),
              },
            ]}
          />
        </Card>
      )}

      <ReasonDialog
        open={locking !== null}
        title="Khóa doanh nghiệp"
        message={
          <>
            <span className="font-semibold">{locking?.name}</span> sẽ không gửi được hợp đồng mới cho tới khi được mở khóa.
          </>
        }
        reasonLabel="Lý do khóa"
        confirmLabel="Khóa doanh nghiệp"
        onClose={() => setLocking(null)}
        onConfirm={async (reason) => {
          if (!locking) return;
          await adminApi.lockTenant(locking.id, reason);
          update(locking.id, { isLocked: true, lockReason: reason });
          toast(`Đã khóa ${locking.name}.`, "success");
          setLocking(null);
        }}
      />

      <Dialog
        open={unlocking !== null}
        onClose={() => setUnlocking(null)}
        title="Mở khóa doanh nghiệp"
        footer={
          <>
            <Button variant="secondary" onClick={() => setUnlocking(null)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!unlocking) return;
                await adminApi.unlockTenant(unlocking.id);
                update(unlocking.id, { isLocked: false, lockReason: null });
                toast(`Đã mở khóa ${unlocking.name}.`, "success");
                setUnlocking(null);
              }}
            >
              Mở khóa
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg">
          <span className="font-semibold">{unlocking?.name}</span> sẽ dùng lại được mọi chức năng.
        </p>
      </Dialog>
    </div>
  );
}
