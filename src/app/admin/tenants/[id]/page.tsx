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
import { AdminTenantVerification } from "@/components/admin-tenant-verification";
import { LockBadge } from "@/components/lock-badge";
import { Badge, type ContractStatus } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";

const CONTRACT_STATUS_META: { status: ContractStatus; label: string }[] = [
  { status: "Draft", label: "Nháp" },
  { status: "Pending", label: "Chờ ký" },
  { status: "Signing", label: "Đang ký" },
  { status: "Completed", label: "Hoàn tất" },
  { status: "Declined", label: "Từ chối" },
  { status: "Cancelled", label: "Đã hủy" },
  { status: "Expired", label: "Hết hạn" },
];

export default function AdminTenantProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: t, error, isLoading, reload } = useApi(`admin-tenant:${id}`, () => adminApi.tenant(id));

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (isLoading || !t) return <Skeleton className="h-96 rounded-sm" />;

  const totalContracts = CONTRACT_STATUS_META.reduce(
    (sum, item) => sum + (t.contractCounts[item.status] ?? 0),
    0,
  );

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
        <p className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Khóa lúc {formatDateTime(t.lockedAt)}. Lý do: {t.lockReason}
        </p>
      )}

      {/* 2-COLUMN STRUCTURED PROFILE (8/12 MAIN DATA + 4/12 SIDEBAR INFO) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Column (8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card title={`Thành viên (${t.members.length})`} icon={Users} bodyClassName="p-0">
            <Table
              bare
              rows={t.members}
              getRowKey={(m) => m.userId}
              empty={<p className="p-4 text-sm text-[#2E3B33]">Chưa có thành viên.</p>}
              columns={[
                {
                  key: "name",
                  header: "Họ và tên",
                  primary: true,
                  render: (m) => (
                    <Link
                      href={`/admin/users/${m.userId}`}
                      className="font-bold text-[#1B4332] hover:underline underline-offset-4"
                    >
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

          <Card title={`Thống kê hợp đồng (${totalContracts})`} icon={FileText}>
            <p className="text-xs text-[#2E3B33] mb-4">
              Chỉ hiển thị số lượng theo trạng thái; quản trị nền tảng không xem nội dung hợp đồng của doanh nghiệp.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CONTRACT_STATUS_META.map((item) => (
                <div
                  key={item.status}
                  className="border-t-2 border-[#E6E4DC] bg-[#F5F4EF]/60 px-3.5 py-2.5 rounded-sm flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-[#2E3B33]">{item.label}</span>
                  <span className="font-mono text-base font-extrabold text-[#1A2922] tabular-nums">
                    {t.contractCounts[item.status] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <AdminHistoryCard items={t.history} />
        </div>

        {/* Right Context Rail (4/12) */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <Card title="Thông tin doanh nghiệp" icon={Building2}>
            <InfoList
              items={[
                ["Mã số thuế", t.taxCode && <span className="font-mono">{t.taxCode}</span>],
                ["Địa chỉ", t.address],
                [
                  "Người đại diện",
                  t.representativeName &&
                    `${t.representativeName}${t.representativeTitle ? ` (${t.representativeTitle})` : ""}`,
                ],
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
                  [
                    "Gói",
                    <span key="plan" className="inline-flex items-center gap-2">
                      {t.subscription.planName} <Badge subscriptionStatus={t.subscription.status} size="sm" />
                    </span>,
                  ],
                  ["Bắt đầu", formatDate(t.subscription.startedAt)],
                  ["Hết hạn", formatDate(t.subscription.expiresAt)],
                  ["Hạn mức tháng", `${t.subscription.quotaUsed} / ${t.subscription.quotaLimit}`],
                ]}
              />
            ) : (
              <p className="text-sm text-[#2E3B33]">Doanh nghiệp chưa có thuê bao.</p>
            )}
          </Card>

          <AdminTenantVerification tenant={t} onChanged={reload} />
        </aside>
      </div>
    </div>
  );
}
