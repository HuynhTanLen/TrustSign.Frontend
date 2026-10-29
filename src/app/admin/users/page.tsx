"use client";

import * as React from "react";
import { Lock, LockOpen, Search, Users } from "lucide-react";
import { adminApi, type AdminUser } from "@/lib/api/admin";
import { useApi } from "@/lib/use-api";
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
  const [locking, setLocking] = React.useState<AdminUser | null>(null);
  const [unlocking, setUnlocking] = React.useState<AdminUser | null>(null);

  const q = query.trim().toLowerCase();
  const rows = (data ?? []).filter((u) => !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  const update = (id: string, patch: Partial<AdminUser>) => mutate((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Người dùng" description="Tài khoản trên toàn nền tảng; khóa tài khoản có dấu hiệu lạm dụng" />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <Card
          title={isLoading ? "Danh sách người dùng" : `Danh sách người dùng (${data?.length ?? 0})`}
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
                    <span className="font-semibold">{u.fullName}</span>
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
              { key: "tenants", header: "Doanh nghiệp", align: "right", render: (u) => u.tenantsCount },
              { key: "lock", header: "Trạng thái", render: (u) => <LockBadge locked={u.isLocked} /> },
              {
                key: "actions",
                header: "",
                align: "right",
                render: (u) =>
                  u.isLocked ? (
                    <Button variant="secondary" onClick={() => setUnlocking(u)}>
                      <LockOpen className="w-4 h-4" aria-hidden="true" />
                      Mở khóa
                    </Button>
                  ) : (
                    <Button variant="ghost" className="text-danger" onClick={() => setLocking(u)}>
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
