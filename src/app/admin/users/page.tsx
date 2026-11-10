"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, LockOpen, Search, ShieldCheck, UserCheck, Users } from "lucide-react";
import { adminApi, type AdminUser } from "@/lib/api/admin";
import { useApi } from "@/lib/use-api";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { ReasonDialog } from "@/components/reason-dialog";
import { Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { LockBadge } from "@/components/lock-badge";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const { data, error, isLoading, reload, mutate } = useApi("admin-users", adminApi.users);
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<"all" | "ekyc" | "no-ekyc" | "locked">("all");
  const [locking, setLocking] = React.useState<AdminUser | null>(null);
  const [unlocking, setUnlocking] = React.useState<AdminUser | null>(null);

  const q = query.trim().toLowerCase();
  const allUsers = data ?? [];

  const counts = {
    all: allUsers.length,
    ekyc: allUsers.filter((u) => u.identityVerified).length,
    noEkyc: allUsers.filter((u) => !u.identityVerified).length,
    locked: allUsers.filter((u) => u.isLocked).length,
  };

  const rows = allUsers
    .filter((u) => {
      if (tab === "ekyc") return u.identityVerified;
      if (tab === "no-ekyc") return !u.identityVerified;
      if (tab === "locked") return u.isLocked;
      return true;
    })
    .filter((u) => !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  const update = (id: string, patch: Partial<AdminUser>) => mutate((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Người dùng" description="Tài khoản trên toàn nền tảng; khóa tài khoản có dấu hiệu lạm dụng" />

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
              onClick={() => setTab("ekyc")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === "ekyc" ? "bg-primary text-white" : "bg-surface text-muted hover:text-fg hover:bg-page"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Đã xác minh eKYC</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${tab === "ekyc" ? "bg-white/20" : "bg-line"}`}>
                {counts.ekyc}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("no-ekyc")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === "no-ekyc" ? "bg-primary text-white" : "bg-surface text-muted hover:text-fg hover:bg-page"
              }`}
            >
              <span>Chưa eKYC</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${tab === "no-ekyc" ? "bg-white/20" : "bg-line"}`}>
                {counts.noEkyc}
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
            title={isLoading ? "Danh sách người dùng" : `Danh sách người dùng (${rows.length})`}
            icon={Users}
            actions={
              <div className="w-64 [&_label]:sr-only">
                <Input label="Tìm người dùng" placeholder="Họ tên hoặc email" value={query} onChange={(e) => setQuery(e.target.value)} leftIcon={<Search />} />
              </div>
            }
            bodyClassName="p-0"
          >
            <Table
              bare
              loading={isLoading}
              rows={rows}
              getRowKey={(u) => u.id}
              empty={<p className="p-4 text-sm text-muted">{q ? "Không có người dùng khớp từ khóa." : "Chưa có người dùng nào."}</p>}
              columns={[
                {
                  key: "name",
                  header: "Họ và tên",
                  primary: true,
                  render: (u) => (
                    <span className="block py-2 whitespace-normal">
                      <Link href={`/admin/users/${u.id}`} className="font-semibold text-primary hover:underline">
                        {u.fullName}
                      </Link>
                      {u.lockReason && <span className="block text-xs text-danger">Lý do khóa: {u.lockReason}</span>}
                    </span>
                  ),
                },
                { key: "email", header: "Email", render: (u) => u.email },
                {
                  key: "verified",
                  header: "Xác minh email",
                  render: (u) => (u.emailVerified ? "Đã xác minh" : <span className="text-warning font-semibold">Chưa xác minh</span>),
                },
                {
                  key: "identity",
                  header: "Xác minh danh tính (eKYC)",
                  render: (u) =>
                    u.identityVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Đã xác minh (CCCD)
                      </span>
                    ) : (
                      <span className="text-muted text-xs">Chưa eKYC</span>
                    ),
                },
                { key: "tenants", header: "Doanh nghiệp", align: "right", render: (u) => u.tenantsCount },
                { key: "lock", header: "Trạng thái", render: (u) => <LockBadge locked={u.isLocked} /> },
                {
                  key: "actions",
                  header: "",
                  align: "right",
                  render: (u) =>
                    // Admin và tài khoản chưa xác minh email không khóa được (backend trả 403/409).
                    u.isAdmin || (!u.emailVerified && !u.isLocked) ? null : u.isLocked ? (
                      <Button
                        variant="secondary"
                        leftIcon={<LockOpen className="w-4 h-4" aria-hidden="true" />}
                        onClick={() => setUnlocking(u)}
                      >
                        Mở khóa
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="text-danger"
                        leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
                        onClick={() => setLocking(u)}
                      >
                        Khóa
                      </Button>
                    ),
                },
              ]}
            />
          </Card>
        </div>
      )}

      <ReasonDialog
        open={locking !== null}
        title="Khóa tài khoản"
        message={
          <>
            <span className="font-semibold">{locking?.email}</span> sẽ không đăng nhập được cho tới khi được mở khóa.
          </>
        }
        reasonLabel="Lý do khóa"
        confirmLabel="Khóa tài khoản"
        onClose={() => setLocking(null)}
        onConfirm={async (reason) => {
          if (!locking) return;
          await adminApi.lockUser(locking.id, reason);
          update(locking.id, { isLocked: true, lockReason: reason });
          toast(`Đã khóa ${locking.email}.`, "success");
          setLocking(null);
        }}
      />

      <Dialog
        open={unlocking !== null}
        onClose={() => setUnlocking(null)}
        title="Mở khóa tài khoản"
        footer={
          <>
            <Button variant="secondary" onClick={() => setUnlocking(null)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!unlocking) return;
                await adminApi.unlockUser(unlocking.id);
                update(unlocking.id, { isLocked: false, lockReason: null });
                toast(`Đã mở khóa ${unlocking.email}.`, "success");
                setUnlocking(null);
              }}
            >
              Mở khóa
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg">
          <span className="font-semibold">{unlocking?.email}</span> sẽ đăng nhập lại được.
        </p>
      </Dialog>
    </div>
  );
}
