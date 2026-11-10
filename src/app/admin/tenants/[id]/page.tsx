"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, CreditCard, FileText, Users } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { useApi } from "@/lib/use-api";
import { formatDate, formatDateTime } from "@/lib/format";
import { TENANT_ROLE_LABELS } from "@/lib/workspace-context";
import { AdminHistoryCard, InfoList, LockActions } from "@/components/admin-profile";
import { LockBadge } from "@/components/lock-badge";
import { Badge, type ContractStatus } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";

const CONTRACT_ORDER: ContractStatus[] = ["Draft", "Pending", "Signing", "Completed", "Declined", "Cancelled", "Expired"];

export default function AdminTenantProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: t, error, isLoading, reload } = useApi(`admin-tenant:${id}`, () => adminApi.tenant(id));

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (isLoading || !t) return <Skeleton className="h-96" />;

  const totalContracts = CONTRACT_ORDER.reduce((sum, s) => sum + (t.contractCounts[s] ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back={{ href: "/admin/tenants", label: "Doanh nghiệp" }}
        title={t.name}
        description={<LockBadge locked={t.isLocked} />}
        actions={
          <LockActions
            name={t.name}
            noun="doanh nghiệp"
            isLocked={t.isLocked}
            lockMessage="sẽ bị chặn khỏi mọi chức năng; thành viên mất quyền truy cập khi phiên hiện tại hết hạn."
            unlockMessage="sẽ dùng lại được mọi chức năng."
            onLock={async (reason) => {
              await adminApi.lockTenant(t.id, reason);
              reload();
            }}
            onUnlock={async () => {
              await adminApi.unlockTenant(t.id);
              reload();
            }}
          />
        }
      />

      {t.isLocked && (
        <p className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          Khóa lúc {formatDateTime(t.lockedAt)}. Lý do: {t.lockReason}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Thông tin doanh nghiệp" icon={Building2}>
          <InfoList
            items={[
              ["Mã số thuế", t.taxCode && <span className="font-mono">{t.taxCode}</span>],
              ["Địa chỉ", t.address],
              ["Người đại diện", t.representativeName && `${t.representativeName}${t.representativeTitle ? ` (${t.representativeTitle})` : ""}`],
              ["Email liên hệ", t.contactEmail],
              ["Điện thoại", t.phone],
              ["Ngày tạo", formatDate(t.createdAt)],
            ]}
          />
        </Card>

        <Card title="Thuê bao" icon={CreditCard}>
          {t.subscription ? (
            <InfoList
              items={[
                ["Gói", <span key="plan" className="inline-flex items-center gap-2">{t.subscription.planName} <Badge subscriptionStatus={t.subscription.status} /></span>],
                ["Bắt đầu", formatDate(t.subscription.startedAt)],
                ["Hết hạn", formatDate(t.subscription.expiresAt)],
                ["Hạn mức tháng này", `${t.subscription.quotaUsed} / ${t.subscription.quotaLimit} hợp đồng`],
              ]}
            />
          ) : (
            <p className="text-sm text-muted">Doanh nghiệp chưa có thuê bao.</p>
          )}
        </Card>
      </div>

      <Card title={`Thành viên (${t.members.length})`} icon={Users} bodyClassName="p-0">
        <Table
          bare
          rows={t.members}
          getRowKey={(m) => m.userId}
          empty={<p className="p-4 text-sm text-muted">Chưa có thành viên.</p>}
          columns={[
            {
              key: "name",
              header: "Họ và tên",
              primary: true,
              render: (m) => (
                <Link href={`/admin/users/${m.userId}`} className="font-semibold text-primary hover:underline">
                  {m.fullName}
                </Link>
              ),
            },
            { key: "email", header: "Email", render: (m) => m.email },
            { key: "role", header: "Vai trò", render: (m) => TENANT_ROLE_LABELS[m.role] ?? m.role },
            { key: "joined", header: "Tham gia", render: (m) => formatDate(m.joinedAt) },
            { key: "lock", header: "Tài khoản", render: (m) => <LockBadge locked={m.isLocked} /> },
          ]}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={`Hợp đồng (${totalContracts})`} icon={FileText}>
          <p className="text-xs text-muted mb-3">Chỉ hiện số lượng; quản trị nền tảng không xem nội dung hợp đồng của doanh nghiệp.</p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CONTRACT_ORDER.map((s) => (
              <li key={s} className="flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2">
                <Badge contractStatus={s} />
                <span className="font-semibold tabular-nums">{t.contractCounts[s] ?? 0}</span>
              </li>
            ))}
          </ul>
        </Card>

        <AdminHistoryCard items={t.history} />
      </div>
    </div>
  );
}
