"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, ShieldCheck, UserCheck, UserCog, UserPlus, Users } from "lucide-react";
import { tenantsApi, type TenantDto, type TenantMemberDto } from "@/lib/api/tenants";
import { useApi } from "@/lib/use-api";
import { formatDate } from "@/lib/format";
import {
  TENANT_ROLE_DESCRIPTIONS,
  TENANT_ROLE_LABELS,
  useWorkspace,
} from "@/lib/workspace-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";

interface WorkspaceOverviewData {
  tenants: TenantDto[];
  members: TenantMemberDto[];
}

export default function DashboardPage() {
  const { user, activeTenantId, currentRole, openProfileModal } = useWorkspace();

  const { data, error, isLoading, reload } = useApi<WorkspaceOverviewData>(
    `m1-overview:${activeTenantId}`,
    async () => {
      const [tenants, members] = await Promise.all([
        tenantsApi.mine(),
        tenantsApi.getMembers(),
      ]);
      return { tenants, members };
    },
  );

  const activeTenant = data?.tenants.find((t) => t.id === activeTenantId);
  const isOwner = currentRole === "TenantOwner";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tổng quan doanh nghiệp"
        description="Thông tin pháp nhân, vai trò hiện tại và thành viên trong không gian làm việc"
        actions={
          <>
            <Button type="button" variant="secondary" onClick={openProfileModal}>
              <UserCog className="w-4 h-4" aria-hidden="true" />
              Sửa hồ sơ cá nhân
            </Button>
            {isOwner && (
              <Link href="/app/members">
                <Button variant="primary">
                  <UserPlus className="w-4 h-4" aria-hidden="true" />
                  Quản lý thành viên
                </Button>
              </Link>
            )}
          </>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isLoading || !data ? (
              Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[104px]" />)
            ) : (
              <>
                <StatCard
                  label="Vai trò hiện tại"
                  value={TENANT_ROLE_LABELS[currentRole] ?? currentRole}
                  icon={ShieldCheck}
                  tone="primary"
                  hint={activeTenant ? `Tại ${activeTenant.name}` : undefined}
                />
                <StatCard
                  label="Thành viên doanh nghiệp"
                  value={data.members.length}
                  icon={Users}
                  tone="success"
                  hint={`${data.members.filter((m) => m.role === "TenantOwner").length} Chủ doanh nghiệp`}
                />
                <StatCard
                  label="Doanh nghiệp tham gia"
                  value={data.tenants.length}
                  icon={Building2}
                  tone="primary"
                  hint="Có thể chuyển đổi ở thanh bên trái"
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <Card
              title="Thông tin doanh nghiệp đang chọn"
              icon={Building2}
              className="lg:col-span-7"
              actions={
                activeTenant && (
                  <Badge
                    className={
                      activeTenant.status === "Active"
                        ? "bg-badge-completed-bg text-badge-completed-fg"
                        : "bg-badge-declined-bg text-badge-declined-fg"
                    }
                  >
                    {activeTenant.status === "Active" ? "Đang hoạt động" : "Tạm khóa"}
                  </Badge>
                )
              }
            >
              {isLoading || !activeTenant ? (
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ) : (
                <dl className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-4 gap-y-3 text-sm">
                  <dt className="text-muted">Tên doanh nghiệp</dt>
                  <dd className="font-semibold text-fg">{activeTenant.name}</dd>

                  <dt className="text-muted">Mã số thuế</dt>
                  <dd className="font-mono text-fg">{activeTenant.taxCode || "Chưa cập nhật"}</dd>

                  <dt className="text-muted">Email liên hệ</dt>
                  <dd className="text-fg">{activeTenant.contactEmail || "Chưa cập nhật"}</dd>

                  <dt className="text-muted">Địa chỉ trụ sở</dt>
                  <dd className="text-fg">{activeTenant.address || "Chưa cập nhật"}</dd>

                  <dt className="text-muted">Ngày khởi tạo</dt>
                  <dd className="text-fg">{formatDate(activeTenant.createdAt)}</dd>
                </dl>
              )}
            </Card>

            <Card
              title="Hồ sơ cá nhân"
              icon={UserCheck}
              className="lg:col-span-5"
              actions={
                <button
                  type="button"
                  onClick={openProfileModal}
                  className="text-primary underline underline-offset-2 hover:text-primary-hover cursor-pointer"
                >
                  Đổi họ tên
                </button>
              }
            >
              <dl className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-x-4 gap-y-3 text-sm">
                <dt className="text-muted">Họ và tên</dt>
                <dd className="font-semibold text-fg">{user.fullName}</dd>

                <dt className="text-muted">Email</dt>
                <dd className="text-fg break-all">{user.email}</dd>

                <dt className="text-muted">Xác minh email</dt>
                <dd>
                  <Badge className="bg-badge-completed-bg text-badge-completed-fg">Đã xác minh</Badge>
                </dd>

                <dt className="text-muted">Phạm vi quyền</dt>
                <dd className="text-muted">{TENANT_ROLE_DESCRIPTIONS[currentRole]}</dd>
              </dl>
            </Card>
          </div>

          <Card
            title="Thành viên trong doanh nghiệp"
            icon={Users}
            actions={
              isOwner ? (
                <Link
                  href="/app/members"
                  className="text-primary underline underline-offset-2 hover:text-primary-hover"
                >
                  Quản lý & lời mời
                </Link>
              ) : undefined
            }
            bodyClassName="p-0"
          >
            <Table
              bare
              loading={isLoading}
              rows={data?.members ?? []}
              getRowKey={(m) => m.userId}
              empty={<p className="p-4 text-sm text-muted">Chưa có thành viên nào trong doanh nghiệp.</p>}
              columns={[
                {
                  key: "fullName",
                  header: "Họ và tên",
                  primary: true,
                  render: (m) => (
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-selected border border-line text-primary text-xs font-semibold inline-flex items-center justify-center shrink-0">
                        {m.fullName.trim().slice(0, 1).toUpperCase() || "?"}
                      </span>
                      <span className="font-semibold text-fg">{m.fullName}</span>
                      {m.userId === user.id && (
                        <Badge className="bg-selected text-primary">Bạn</Badge>
                      )}
                    </div>
                  ),
                },
                {
                  key: "email",
                  header: "Email",
                  render: (m) => <span className="text-muted">{m.email}</span>,
                },
                {
                  key: "role",
                  header: "Vai trò",
                  render: (m) => (
                    <Badge
                      className={
                        m.role === "TenantOwner"
                          ? "bg-badge-signing-bg text-badge-signing-fg"
                          : "bg-badge-draft-bg text-badge-draft-fg"
                      }
                    >
                      {TENANT_ROLE_LABELS[m.role] ?? m.role}
                    </Badge>
                  ),
                },
                {
                  key: "joinedAt",
                  header: "Ngày tham gia",
                  render: (m) => <span className="text-muted">{formatDate(m.joinedAt)}</span>,
                },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
}
