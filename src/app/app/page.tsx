"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CreditCard,
  FileCheck2,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import { tenantsApi, type TenantDto, type TenantMemberDto } from "@/lib/api/tenants";
import { subscriptionApi, type CurrentSubscription } from "@/lib/api/subscription";
import { useApi } from "@/lib/use-api";
import { daysUntil, formatDate, formatMoney } from "@/lib/format";
import {
  TENANT_ROLE_DESCRIPTIONS,
  TENANT_ROLE_LABELS,
  useWorkspace,
} from "@/lib/workspace-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { Progress } from "@/components/ui/chart";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";

interface WorkspaceOverviewData {
  tenants: TenantDto[];
  members: TenantMemberDto[];
  subscription: CurrentSubscription | null;
}

export default function DashboardPage() {
  const { user, activeTenantId, currentRole, openProfileModal } = useWorkspace();

  const { data, error, isLoading, reload } = useApi<WorkspaceOverviewData>(
    `m1-m2-overview:${activeTenantId}`,
    async () => {
      const [tenants, members, subscriptionResult] = await Promise.all([
        tenantsApi.mine(),
        tenantsApi.getMembers(),
        subscriptionApi.current().catch(() => null),
      ]);
      return { tenants, members, subscription: subscriptionResult };
    },
  );

  const activeTenant = data?.tenants.find((t) => t.id === activeTenantId);
  const isOwner = currentRole === "TenantOwner";
  const sub = data?.subscription;
  const daysLeft = sub ? daysUntil(sub.expiresAt) : 0;
  const quotaUsed = sub?.quotaUsed ?? 0;
  const quotaLimit = sub?.quotaLimit ?? 0;
  const quotaRatio = quotaLimit > 0 ? quotaUsed / quotaLimit : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tổng quan doanh nghiệp"
        description="Thông tin pháp nhân, trạng thái gói dịch vụ và danh sách thành viên đang làm việc"
        actions={
          <>
            <Button type="button" variant="secondary" onClick={openProfileModal}>
              <UserCog className="w-4 h-4 mr-1" aria-hidden="true" />
              Sửa hồ sơ
            </Button>
            <Link href="/app/billing">
              <Button variant="secondary">
                <CreditCard className="w-4 h-4 mr-1" aria-hidden="true" />
                Gói & Thanh toán
              </Button>
            </Link>
            {isOwner && (
              <Link href="/app/members">
                <Button variant="primary">
                  <UserPlus className="w-4 h-4 mr-1" aria-hidden="true" />
                  Mời thành viên
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
          {/* Top 4 KPI StatCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading || !data ? (
              Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            ) : (
              <>
                <StatCard
                  label="Gói dịch vụ hiện tại"
                  value={sub ? `Gói ${sub.planName}` : "Chưa kích hoạt"}
                  icon={CreditCard}
                  tone="primary"
                  hint={
                    sub ? (
                      <span className="flex items-center gap-1.5">
                        <Badge subscriptionStatus={sub.status} className="scale-90 origin-left" />
                        <span>{daysLeft > 0 ? `Còn ${daysLeft} ngày` : "Đã hết hạn"}</span>
                      </span>
                    ) : (
                      "Vui lòng chọn gói để bắt đầu"
                    )
                  }
                />
                <StatCard
                  label="Hạn mức gửi ký tháng"
                  value={`${quotaUsed} / ${quotaLimit}`}
                  icon={FileCheck2}
                  tone={quotaRatio >= 0.85 ? "warning" : "success"}
                  hint={`Đã sử dụng ${Math.round(quotaRatio * 100)}% hạn mức hợp đồng`}
                />
                <StatCard
                  label="Nhân sự doanh nghiệp"
                  value={`${data.members.length} thành viên`}
                  icon={Users}
                  tone="primary"
                  hint={`${data.members.filter((m) => m.role === "TenantOwner").length} Chủ doanh nghiệp`}
                />
                <StatCard
                  label="Vai trò của bạn"
                  value={TENANT_ROLE_LABELS[currentRole] ?? currentRole}
                  icon={ShieldCheck}
                  tone="success"
                  hint={activeTenant ? `Tại ${activeTenant.name}` : undefined}
                />
              </>
            )}
          </div>

          {/* Subscription & Quota Usage Banner (M2 Live) */}
          {sub && (
            <div className="p-6 rounded-xl bg-gradient-to-r from-surface via-surface to-strip border border-line shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Tiến độ sử dụng gói thuê bao
                  </span>
                  <Badge subscriptionStatus={sub.status} />
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-xl font-bold text-fg">
                    Gói {sub.planName} · {formatMoney(sub.price)} / {sub.durationDays} ngày
                  </span>
                  <span className="text-xs text-muted">
                    Hết hạn: {formatDate(sub.expiresAt)} ({daysLeft > 0 ? `còn ${daysLeft} ngày` : "hết hạn"})
                  </span>
                </div>
                <div className="mt-3 max-w-xl">
                  <div className="flex justify-between text-xs font-semibold text-fg mb-1">
                    <span>Lượt gửi ký hợp đồng đã dùng</span>
                    <span className="tabular-nums font-bold">
                      {sub.quotaUsed} / {sub.quotaLimit}
                    </span>
                  </div>
                  <Progress
                    value={sub.quotaUsed}
                    max={sub.quotaLimit}
                    tone={quotaRatio >= 0.9 ? "danger" : quotaRatio >= 0.7 ? "warning" : "primary"}
                    label="Hạn mức hợp đồng đã gửi"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link href="/app/billing">
                  <Button variant="primary">
                    Gia hạn / Nâng cấp gói
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Business Entity & Personal Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <Card
              title="Thông tin pháp nhân đang chọn"
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
                <dl className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-4 gap-y-3.5 text-sm">
                  <dt className="text-muted font-medium">Tên doanh nghiệp</dt>
                  <dd className="font-bold text-fg">{activeTenant.name}</dd>

                  <dt className="text-muted font-medium">Mã số thuế</dt>
                  <dd className="font-mono text-fg">{activeTenant.taxCode || "Chưa cập nhật"}</dd>

                  <dt className="text-muted font-medium">Email liên hệ</dt>
                  <dd className="text-fg">{activeTenant.contactEmail || "Chưa cập nhật"}</dd>

                  <dt className="text-muted font-medium">Địa chỉ trụ sở</dt>
                  <dd className="text-fg">{activeTenant.address || "Chưa cập nhật"}</dd>

                  <dt className="text-muted font-medium">Ngày khởi tạo</dt>
                  <dd className="text-fg">{formatDate(activeTenant.createdAt)}</dd>
                </dl>
              )}
            </Card>

            <Card
              title="Tài khoản cá nhân"
              icon={UserCheck}
              className="lg:col-span-5"
              actions={
                <button
                  type="button"
                  onClick={openProfileModal}
                  className="text-xs font-bold text-primary underline underline-offset-2 hover:text-primary-hover cursor-pointer"
                >
                  Đổi họ tên
                </button>
              }
            >
              <dl className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-x-4 gap-y-3.5 text-sm">
                <dt className="text-muted font-medium">Họ và tên</dt>
                <dd className="font-bold text-fg">{user.fullName}</dd>

                <dt className="text-muted font-medium">Email</dt>
                <dd className="text-fg break-all font-medium">{user.email}</dd>

                <dt className="text-muted font-medium">Xác minh email</dt>
                <dd>
                  <Badge className="bg-badge-completed-bg text-badge-completed-fg">
                    Đã xác minh
                  </Badge>
                </dd>

                <dt className="text-muted font-medium">Phạm vi quyền</dt>
                <dd className="text-xs text-muted leading-relaxed">
                  {TENANT_ROLE_DESCRIPTIONS[currentRole]}
                </dd>
              </dl>
            </Card>
          </div>

          {/* Members Table Card */}
          <Card
            title="Thành viên trong tổ chức"
            icon={Users}
            actions={
              isOwner ? (
                <Link
                  href="/app/members"
                  className="text-xs font-bold text-primary underline underline-offset-2 hover:text-primary-hover"
                >
                  Quản lý & gửi lời mời →
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
              empty={<p className="p-6 text-sm text-muted text-center">Chưa có thành viên nào.</p>}
              columns={[
                {
                  key: "fullName",
                  header: "Thành viên",
                  primary: true,
                  render: (m) => (
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-selected border border-primary/15 text-primary text-xs font-bold inline-flex items-center justify-center shrink-0">
                        {m.fullName.trim().slice(0, 1).toUpperCase() || "?"}
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-fg block">{m.fullName}</span>
                        {m.userId === user.id && (
                          <span className="inline-flex items-center text-[10px] font-semibold text-primary">
                            (Tài khoản của bạn)
                          </span>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  key: "email",
                  header: "Email",
                  render: (m) => <span className="text-muted font-medium">{m.email}</span>,
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
