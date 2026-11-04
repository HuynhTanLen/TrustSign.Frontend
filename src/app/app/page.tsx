"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CreditCard,
  FileCheck2,
  FilePenLine,
  FileText,
  MailCheck,
  Plus,
  ShieldCheck,
  UserCheck,
  UserCog,
} from "lucide-react";
import { tenantsApi, type TenantDto } from "@/lib/api/tenants";
import { subscriptionApi, type CurrentSubscription } from "@/lib/api/subscription";
import { contractsApi, type ContractListItem } from "@/lib/api/contracts";
import { useApi } from "@/lib/use-api";
import { daysUntil, formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { useWorkspace } from "@/lib/workspace-context";
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
  subscription: CurrentSubscription | null;
  contracts: ContractListItem[];
}

export default function DashboardPage() {
  const { user, activeTenantId, openProfileModal } = useWorkspace();

  const { data, error, isLoading, reload } = useApi<WorkspaceOverviewData>(
    `m1-m3-overview:${activeTenantId}`,
    async () => {
      const [tenants, subscriptionResult, contractsResult] = await Promise.all([
        tenantsApi.mine(),
        subscriptionApi.current().catch(() => null),
        contractsApi.list().catch(() => []),
      ]);
      return {
        tenants,
        subscription: subscriptionResult,
        contracts: contractsResult,
      };
    },
  );

  const activeTenant = data?.tenants.find((t) => t.id === activeTenantId);
  const sub = data?.subscription;
  const daysLeft = sub ? daysUntil(sub.expiresAt) : 0;
  const quotaUsed = sub?.quotaUsed ?? 0;
  const quotaLimit = sub?.quotaLimit ?? 0;
  const quotaRatio = quotaLimit > 0 ? quotaUsed / quotaLimit : 0;
  const totalContracts = data?.contracts.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tổng quan doanh nghiệp"
        description="Thông tin pháp nhân, trạng thái gói dịch vụ và theo dõi hợp đồng gửi ký"
        actions={
          <>
            <Button type="button" variant="secondary" onClick={openProfileModal}>
              <UserCog className="w-4 h-4 mr-1" aria-hidden="true" />
              Sửa hồ sơ
            </Button>
            <Link href="/app/templates">
              <Button variant="secondary">
                <FilePenLine className="w-4 h-4 mr-1" aria-hidden="true" />
                Mẫu hợp đồng
              </Button>
            </Link>
            <Link href="/app/contracts/new">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                Soạn hợp đồng
              </Button>
            </Link>
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
                  label="Hạn mức gửi ký kỳ này"
                  value={`${quotaUsed} / ${quotaLimit}`}
                  icon={FileCheck2}
                  tone={quotaRatio >= 0.85 ? "warning" : "success"}
                  hint={`Đã sử dụng ${Math.round(quotaRatio * 100)}% hạn mức hợp đồng`}
                />
                <StatCard
                  label="Tổng số hợp đồng"
                  value={`${totalContracts} hợp đồng`}
                  icon={FileText}
                  tone="primary"
                  hint="Bấm vào danh sách để xem tiến trình ký"
                />
                <StatCard
                  label="Đại diện quản lý"
                  value={user.fullName}
                  icon={ShieldCheck}
                  tone="success"
                  hint={activeTenant ? `Tại ${activeTenant.name}` : undefined}
                />
              </>
            )}
          </div>

          {/* Subscription & Quota Usage Banner */}
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

          {/* Business Entity & Representative Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <Card
              title="Thông tin pháp nhân doanh nghiệp"
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
                <dl className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-4 gap-y-3.5 text-sm">
                  <dt className="text-muted font-medium">Tên doanh nghiệp</dt>
                  <dd className="font-bold text-fg">{activeTenant.name}</dd>

                  <dt className="text-muted font-medium">Mã số thuế</dt>
                  <dd className="font-mono text-fg">{activeTenant.taxCode || "Chưa cập nhật"}</dd>

                  <dt className="text-muted font-medium">Email nhận xác nhận ký</dt>
                  <dd className="text-fg font-medium">{activeTenant.contactEmail || user.email}</dd>

                  <dt className="text-muted font-medium">Địa chỉ trụ sở</dt>
                  <dd className="text-fg">{activeTenant.address || "Chưa cập nhật"}</dd>

                  <dt className="text-muted font-medium">Ngày khởi tạo</dt>
                  <dd className="text-fg">{formatDate(activeTenant.createdAt)}</dd>
                </dl>
              )}
            </Card>

            <Card
              title="Người đại diện & Quy trình duyệt ký"
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
              <dl className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-x-4 gap-y-3 text-sm">
                <dt className="text-muted font-medium">Người đại diện</dt>
                <dd className="font-bold text-fg">{user.fullName}</dd>

                <dt className="text-muted font-medium">Email tài khoản</dt>
                <dd className="text-fg break-all font-medium">{user.email}</dd>

                <dt className="text-muted font-medium">Quy trình ký</dt>
                <dd className="text-xs text-muted leading-relaxed">
                  <span className="inline-flex items-center gap-1 font-semibold text-primary mb-0.5">
                    <MailCheck className="w-3.5 h-3.5" />
                    Xác nhận qua Email Chủ doanh nghiệp:
                  </span>
                  <br />
                  Khi gửi hợp đồng, hệ thống gửi email kèm mã OTP cho <strong>Chủ doanh nghiệp (Bên A)</strong> xác nhận ký tên trước, sau đó tự động gửi tiếp cho <strong>Đối tác (Bên B)</strong>.
                </dd>
              </dl>
            </Card>
          </div>

          {/* Recent Contracts Card */}
          <Card
            title={`Hợp đồng gần đây (${data?.contracts.length ?? 0})`}
            icon={FileText}
            actions={
              <Link
                href="/app/contracts"
                className="text-xs font-bold text-primary underline underline-offset-2 hover:text-primary-hover"
              >
                Xem tất cả hợp đồng →
              </Link>
            }
            bodyClassName="p-0"
          >
            <Table
              bare
              loading={isLoading}
              rows={(data?.contracts ?? []).slice(0, 5)}
              getRowKey={(c) => c.id}
              empty={
                <div className="p-6 text-sm text-muted text-center flex flex-col items-center gap-2">
                  <span>Chưa có hợp đồng nào được tạo trong doanh nghiệp.</span>
                  <Link href="/app/contracts/new">
                    <Button variant="secondary">Soạn hợp đồng đầu tiên</Button>
                  </Link>
                </div>
              }
              columns={[
                {
                  key: "code",
                  header: "Mã",
                  render: (c) => <span className="font-mono text-xs text-muted">{c.code}</span>,
                },
                {
                  key: "title",
                  header: "Tên hợp đồng",
                  primary: true,
                  render: (c) => (
                    <Link
                      href={`/app/contracts/${c.id}`}
                      className="font-semibold text-fg hover:text-primary underline-offset-2 hover:underline"
                    >
                      {c.title}
                    </Link>
                  ),
                },
                { key: "partner", header: "Bên ký", render: (c) => c.partner },
                {
                  key: "status",
                  header: "Trạng thái",
                  render: (c) => <Badge contractStatus={c.status} />,
                },
                {
                  key: "sent",
                  header: "Ngày gửi",
                  render: (c) => (c.sentAt ? formatDateTime(c.sentAt) : "Chưa gửi"),
                },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
}
