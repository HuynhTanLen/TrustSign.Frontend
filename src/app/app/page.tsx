"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Clock,
  CreditCard,
  FileCheck2,
  FilePenLine,
  FileText,
  MailCheck,
  Plus,
  ShieldCheck,
  Sparkles,
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
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";

interface WorkspaceOverviewData {
  tenants: TenantDto[];
  subscription: CurrentSubscription | null;
  contracts: ContractListItem[];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, activeTenantId, openProfileModal } = useWorkspace();

  const { data, error, isLoading, isRefreshing, reload } = useApi<WorkspaceOverviewData>(
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

  // Đếm nhanh trạng thái hợp đồng
  const completedContracts = data?.contracts.filter((c) => c.status === "Completed").length ?? 0;
  const pendingContracts =
    data?.contracts.filter((c) => c.status === "Pending" || c.status === "Signing").length ?? 0;

  const greeting = React.useMemo(() => getGreeting(), []);

  return (
    <div className="flex flex-col gap-6">
      {/* HERO HEADER CHUYÊN NGHIỆP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-line">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-selected text-primary text-xs font-semibold border border-primary/10">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Không gian doanh nghiệp</span>
            </span>
            {activeTenant && (
              <span className="text-xs text-muted font-medium truncate">
                · {activeTenant.name}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-fg truncate">
            {greeting}, {user.fullName || "Quý khách"}
          </h1>
          <p className="mt-0.5 text-xs text-muted max-w-2xl leading-relaxed">
            Theo dõi tiến trình các hợp đồng điện tử, chứng thư PAdES và hạn mức ký kết của pháp nhân.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button type="button" variant="secondary" size="sm" onClick={openProfileModal}>
            <UserCog className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            Hồ sơ cá nhân
          </Button>
          <Link href="/app/templates">
            <Button variant="secondary" size="sm">
              <FilePenLine className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              Mẫu chuẩn
            </Button>
          </Link>
          <Link href="/app/contracts/new">
            <Button variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              Soạn hợp đồng mới
            </Button>
          </Link>
        </div>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          {/* 4 THẺ CHỈ SỐ KPI CHÍNH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading || !data ? (
              Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl shadow-xs" />
              ))
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
                        <span className={daysLeft <= 5 ? "text-amber-700 font-semibold" : ""}>
                          {daysLeft > 0 ? `Còn ${daysLeft} ngày` : "Đã hết hạn"}
                        </span>
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
                  hint={`Đã sử dụng ${Math.round(quotaRatio * 100)}% hạn mức (${quotaLimit - quotaUsed} lượt còn lại)`}
                />
                <StatCard
                  label="Hợp đồng đang điều phối"
                  value={`${pendingContracts} đang ký`}
                  icon={Clock}
                  tone={pendingContracts > 0 ? "warning" : "primary"}
                  hint={`${completedContracts} hợp đồng đã ký hoàn tất`}
                />
                <StatCard
                  label="Đại diện pháp lý"
                  value={user.fullName}
                  icon={ShieldCheck}
                  tone="success"
                  hint={activeTenant ? `Tại ${activeTenant.name}` : undefined}
                />
              </>
            )}
          </div>

          {/* BANNER GÓI THUÊ BAO VÀ HẠN MỨC KÝ KẾT */}
          {sub && (
            <div className="p-5 sm:p-6 rounded-xl bg-gradient-to-r from-surface via-surface to-strip border border-line shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-card-hover">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Tiến độ sử dụng gói thuê bao
                  </span>
                  <Badge subscriptionStatus={sub.status} />
                </div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-xl font-bold text-fg">
                    Gói {sub.planName} · {formatMoney(sub.price)} / {sub.durationDays} ngày
                  </span>
                  <span className="text-xs text-muted">
                    Hạn dùng: {formatDate(sub.expiresAt)} ({daysLeft > 0 ? `còn ${daysLeft} ngày` : "hết hạn"})
                  </span>
                </div>
                <div className="mt-3.5 max-w-xl">
                  <div className="flex justify-between text-xs font-semibold text-fg mb-1">
                    <span>Lượt gửi ký hợp đồng đã phát hành</span>
                    <span className="tabular-nums font-bold">
                      {sub.quotaUsed} / {sub.quotaLimit} lượt
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
                  <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Nâng cấp / Gia hạn gói
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* THÔNG TIN PHÁP NHÂN VÀ QUY TRÌNH KÝ */}
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
                </div>
              ) : (
                <dl className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-4 gap-y-3.5 text-sm">
                  <dt className="text-muted font-medium">Tên doanh nghiệp</dt>
                  <dd className="font-bold text-fg break-words">{activeTenant.name}</dd>

                  <dt className="text-muted font-medium">Mã số thuế</dt>
                  <dd className="font-mono text-fg font-semibold">
                    {activeTenant.taxCode || "Chưa cập nhật"}
                  </dd>

                  <dt className="text-muted font-medium">Email thông báo ký</dt>
                  <dd className="text-fg font-medium break-all">
                    {activeTenant.contactEmail || user.email}
                  </dd>

                  <dt className="text-muted font-medium">Địa chỉ trụ sở</dt>
                  <dd className="text-fg break-words">{activeTenant.address || "Chưa cập nhật"}</dd>

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
                  <span className="inline-flex items-center gap-1 font-semibold text-primary mb-1">
                    <MailCheck className="w-3.5 h-3.5" />
                    Xác thực OTP Email 2 Bên:
                  </span>
                  <br />
                  Khi phát hành, hệ thống gửi email OTP cho <strong>Bên A (Chủ doanh nghiệp)</strong> xác nhận ký trước, sau đó tự động chuyển lượt ký bảo mật tới <strong>Bên B (Khách hàng/Đối tác)</strong>.
                </dd>
              </dl>
            </Card>
          </div>

          {/* BẢNG DANH SÁCH HỢP ĐỒNG GẦN ĐÂY */}
          <Card
            title={
              <span className="flex items-center gap-2">
                <span>Hợp đồng gần đây</span>
                <span className="text-xs font-normal text-muted">
                  ({data?.contracts.length ?? 0} hợp đồng)
                </span>
              </span>
            }
            icon={FileText}
            actions={
              <Link
                href="/app/contracts"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
              >
                <span>Xem tất cả danh sách</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            bodyClassName="p-0"
          >
            <Table
              bare
              loading={isLoading}
              refreshing={isRefreshing}
              rows={(data?.contracts ?? []).slice(0, 5)}
              getRowKey={(c) => c.id}
              empty={
                <div className="p-8">
                  <EmptyState
                    icon={<FileText />}
                    compact
                    title="Chưa có hợp đồng nào được tạo"
                    description="Soạn hợp đồng ngay từ thư viện mẫu chuẩn để gửi đối tác ký kết trực tuyến."
                    actionLabel="Soạn hợp đồng đầu tiên"
                    onAction={() => router.push("/app/contracts/new")}
                  />
                </div>
              }
              columns={[
                {
                  key: "code",
                  header: "Mã",
                  render: (c) => (
                    <span className="font-mono text-xs text-slate-600 bg-strip px-1.5 py-0.5 rounded border border-line">
                      {c.code}
                    </span>
                  ),
                },
                {
                  key: "title",
                  header: "Tên hợp đồng",
                  primary: true,
                  render: (c) => (
                    <Link
                      href={`/app/contracts/${c.id}`}
                      className="font-semibold text-fg hover:text-primary transition-colors underline-offset-2 hover:underline block truncate max-w-sm"
                    >
                      {c.title}
                    </Link>
                  ),
                },
                {
                  key: "partner",
                  header: "Đối tác ký (Bên B)",
                  render: (c) => <span className="font-medium text-slate-700">{c.partner}</span>,
                },
                {
                  key: "status",
                  header: "Trạng thái",
                  render: (c) => <Badge contractStatus={c.status} size="sm" />,
                },
                {
                  key: "sent",
                  header: "Ngày gửi",
                  align: "right",
                  render: (c) => (
                    <span className="text-xs text-muted">
                      {c.sentAt ? formatDateTime(c.sentAt) : "Chưa phát hành"}
                    </span>
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
}
