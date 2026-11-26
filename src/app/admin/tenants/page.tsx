"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, Clock, Lock, LockOpen, Search, ShieldCheck } from "lucide-react";
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
import { VerificationBadge } from "@/components/verification-badge";
import { Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

export default function AdminTenantsPage() {
  const { toast } = useToast();
  const { data, error, isLoading, reload, mutate } = useApi("admin-tenants", adminApi.tenants);
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<"all" | "Pending" | "Verified" | "Unverified" | "Rejected" | "locked">("all");
  const [locking, setLocking] = React.useState<AdminTenant | null>(null);
  const [unlocking, setUnlocking] = React.useState<AdminTenant | null>(null);

  const q = query.trim().toLowerCase();
  const allTenants = data ?? [];

  const counts = {
    all: allTenants.length,
    pending: allTenants.filter((t) => t.verificationStatus === "Pending").length,
    verified: allTenants.filter((t) => t.verificationStatus === "Verified").length,
    unverified: allTenants.filter((t) => !t.verificationStatus || t.verificationStatus === "Unverified").length,
    rejected: allTenants.filter((t) => t.verificationStatus === "Rejected").length,
    locked: allTenants.filter((t) => t.isLocked).length,
  };

  const rows = allTenants
    .filter((t) => {
      if (tab === "Pending") return t.verificationStatus === "Pending";
      if (tab === "Verified") return t.verificationStatus === "Verified";
      if (tab === "Unverified") return !t.verificationStatus || t.verificationStatus === "Unverified";
      if (tab === "Rejected") return t.verificationStatus === "Rejected";
      if (tab === "locked") return t.isLocked;
      return true;
    })
    .filter(
      (t) => !q || t.name.toLowerCase().includes(q) || (t.taxCode ?? "").includes(q) || t.ownerEmail.toLowerCase().includes(q),
    );

  const update = (id: string, patch: Partial<AdminTenant>) => mutate((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Doanh nghiệp" description="Doanh nghiệp thuê bao trên toàn nền tảng; khóa khi vi phạm điều khoản" />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-1 pb-3 text-sm">
            <button
              type="button"
              onClick={() => setTab("all")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === "all" ? "bg-primary text-white" : "bg-surface text-muted hover:text-fg hover:bg-page"
              }`}
            >
              <span>Tất cả</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${tab === "all" ? "bg-white/20" : "bg-line"}`}>
                {counts.all}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("Pending")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === "Pending" ? "bg-amber-600 text-white" : "bg-surface text-muted hover:text-fg hover:bg-page"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Chờ duyệt pháp nhân</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  tab === "Pending" ? "bg-white/20" : counts.pending > 0 ? "bg-amber-100 text-amber-800 font-bold" : "bg-line"
                }`}
              >
                {counts.pending}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("Verified")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === "Verified" ? "bg-emerald-600 text-white" : "bg-surface text-muted hover:text-fg hover:bg-page"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Đã xác thực</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${tab === "Verified" ? "bg-white/20" : "bg-line"}`}>
                {counts.verified}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("Unverified")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === "Unverified" ? "bg-primary text-white" : "bg-surface text-muted hover:text-fg hover:bg-page"
              }`}
            >
              <span>Chưa xác thực</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${tab === "Unverified" ? "bg-white/20" : "bg-line"}`}>
                {counts.unverified}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("Rejected")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === "Rejected" ? "bg-rose-600 text-white" : "bg-surface text-muted hover:text-fg hover:bg-page"
              }`}
            >
              <span>Bị từ chối</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${tab === "Rejected" ? "bg-white/20" : "bg-line"}`}>
                {counts.rejected}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("locked")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === "locked" ? "bg-danger text-white" : "bg-surface text-muted hover:text-fg hover:bg-page"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Bị khóa</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${tab === "locked" ? "bg-white/20" : "bg-line"}`}>
                {counts.locked}
              </span>
            </button>
          </div>

          <Card
            title={isLoading ? "Danh sách doanh nghiệp" : `Danh sách doanh nghiệp (${rows.length})`}
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
                    <Link href={`/admin/tenants/${t.id}`} className="font-semibold text-primary hover:underline">
                      {t.name}
                    </Link>
                    {t.lockReason && <span className="block text-xs text-danger">Lý do khóa: {t.lockReason}</span>}
                  </span>
                ),
              },
              { key: "tax", header: "Mã số thuế", render: (t) => <span className="font-mono text-xs text-muted">{t.taxCode ?? "—"}</span> },
              { key: "owner", header: "Chủ doanh nghiệp", render: (t) => t.ownerEmail },
              { key: "plan", header: "Gói", render: (t) =>
                  t.planName && t.subscriptionStatus ? (
                    <span className="inline-flex items-center gap-2">Gói {t.planName} <Badge subscriptionStatus={t.subscriptionStatus} /></span>
                  ) : (
                    <span className="text-muted">Chưa có gói</span>
                  ),
              },
              { key: "members", header: "Thành viên", align: "right", render: (t) => t.membersCount },
              { key: "verify", header: "Xác thực", render: (t) => <VerificationBadge status={t.verificationStatus ?? "Unverified"} /> },
              { key: "lock", header: "Trạng thái", render: (t) => <LockBadge locked={t.isLocked} /> },
              {
                key: "actions",
                header: "",
                align: "right",
                render: (t) =>
                  t.isLocked ? (
                    <button
                      type="button"
                      title="Mở khóa doanh nghiệp"
                      aria-label={`Mở khóa ${t.name}`}
                      onClick={() => setUnlocking(t)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-sm bg-[#E2EED6] text-[#143326] border border-[#9EC084] hover:bg-[#D0E3BD] transition-colors cursor-pointer"
                    >
                      <LockOpen className="w-4 h-4" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      title="Khóa doanh nghiệp"
                      aria-label={`Khóa ${t.name}`}
                      onClick={() => setLocking(t)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-sm bg-[#FDF2F2] text-[#7A1F1F] border border-[#DDA8A8] hover:bg-[#F9E1E1] transition-colors cursor-pointer"
                    >
                      <Lock className="w-4 h-4" aria-hidden="true" />
                    </button>
                  ),
              },
            ]}
          />
        </Card>
        </div>
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
