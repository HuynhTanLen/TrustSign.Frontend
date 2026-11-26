"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowUpRight,
  Building2,
  Package,
  ScanFace,
  ShieldAlert,
  Users,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { adminApi, type AdminTenant, type AdminUser } from "@/lib/api/admin";
import { ekycApi, type AdminEkyc } from "@/lib/api/ekyc";
import { subscriptionApi, type Plan } from "@/lib/api/subscription";
import { useApi } from "@/lib/use-api";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge } from "@/components/verification-badge";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { BarChart, Progress } from "@/components/ui/chart";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";

interface AdminOverviewData {
  user: Awaited<ReturnType<typeof authApi.me>>;
  plans: Plan[];
  tenants: AdminTenant[];
  users: AdminUser[];
  ekycs: AdminEkyc[];
}

export default function AdminDashboardPage() {
  const { data, error, isLoading, reload } = useApi<AdminOverviewData>(
    "admin-overview-metis",
    async () => {
      const [user, plans, tenants, users, ekycs] = await Promise.all([
        authApi.me(),
        subscriptionApi.adminPlans(),
        adminApi.tenants().catch(() => []),
        adminApi.users().catch(() => []),
        ekycApi.adminList().catch(() => []),
      ]);
      return { user, plans, tenants, users, ekycs };
    },
  );

  const user = data?.user;
  const plans = data?.plans ?? [];
  const tenants = data?.tenants ?? [];
  const users = data?.users ?? [];
  const ekycs = data?.ekycs ?? [];

  const activePlansCount = plans.filter((p) => p.isActive).length;
  const pendingTenantsCount = tenants.filter((t) => t.verificationStatus === "Pending").length;
  const verifiedTenantsCount = tenants.filter((t) => t.verificationStatus === "Verified").length;
  const lockedTenantsCount = tenants.filter((t) => t.isLocked).length;
  const verifiedUsersCount = users.filter((u) => u.identityVerified).length;
  const lockedUsersCount = users.filter((u) => u.isLocked).length;

  const planDistribution = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of plans) counts.set(p.name, 0);
    for (const t of tenants) {
      const key = t.planName || "Chưa có gói";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([label, value]) => ({
      label,
      value,
      display: `${value} DN`,
    }));
  }, [plans, tenants]);

  const workspaceHref = user?.hasTenant ? "/app" : "/onboarding";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <>
            Quản trị nền tảng{" "}
            <span className="font-serif italic font-normal text-[#1B4332]">TrustSign.</span>
          </>
        }
        description="Tổng quan vận hành doanh nghiệp, người dùng, xác minh danh tính eKYC và các gói thuê bao."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/admin/plans">
              <Button variant="primary" size="sm" leftIcon={<Package className="w-4 h-4" />}>
                Quản lý gói dịch vụ
              </Button>
            </Link>
            <Link href={workspaceHref}>
              <Button variant="secondary" size="sm" leftIcon={<ArrowLeftRight className="w-4 h-4" />}>
                {user?.hasTenant ? "Sang khu doanh nghiệp" : "Tạo doanh nghiệp thử"}
              </Button>
            </Link>
          </div>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          {/* 1. METIS 4 KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading || !data ? (
              Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-sm" />)
            ) : (
              <>
                <StatCard
                  label="Doanh nghiệp"
                  value={tenants.length}
                  icon={Building2}
                  tone="primary"
                  hint={`${verifiedTenantsCount} đã xác thực · ${pendingTenantsCount} chờ duyệt`}
                />
                <StatCard
                  label="Người dùng"
                  value={users.length}
                  icon={Users}
                  tone="primary"
                  hint={`${verifiedUsersCount} đã xác minh eKYC`}
                />
                <StatCard
                  label="Hồ sơ eKYC"
                  value={ekycs.length}
                  icon={ScanFace}
                  tone={pendingTenantsCount > 0 ? "warning" : "success"}
                  hint={`${lockedTenantsCount + lockedUsersCount} tài khoản/DN đang khóa`}
                />
                <StatCard
                  label="Gói dịch vụ"
                  value={`${activePlansCount} / ${plans.length}`}
                  icon={Package}
                  tone="primary"
                  hint="Gói đang mở bán công khai"
                />
              </>
            )}
          </div>

          {/* 2. METIS 2-COLUMN WORKSPACE (8/12 CHART + TENANTS | 4/12 ACTIONS + PLANS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8/12: Analytics Chart + Recent Tenants Table */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <Card
                title="Phân bổ doanh nghiệp theo gói thuê bao"
                icon={Building2}
                actions={
                  <Link
                    href="/admin/tenants"
                    className="text-xs font-bold text-[#1B4332] hover:underline underline-offset-4 inline-flex items-center gap-1"
                  >
                    Xem doanh nghiệp <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                }
              >
                {isLoading ? (
                  <Skeleton className="h-48 w-full rounded-sm" />
                ) : (
                  <div className="flex flex-col gap-6">
                    <BarChart
                      data={planDistribution}
                      height={180}
                      emptyText="Chưa có dữ liệu doanh nghiệp."
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E6E4DC]">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-[#1A2922] mb-1.5">
                          <span>Tỷ lệ doanh nghiệp xác thực pháp nhân</span>
                          <span className="font-mono font-bold text-[#1B4332]">
                            {tenants.length > 0
                              ? `${Math.round((verifiedTenantsCount / tenants.length) * 100)}%`
                              : "0%"}
                          </span>
                        </div>
                        <Progress
                          value={verifiedTenantsCount}
                          max={Math.max(1, tenants.length)}
                          tone="primary"
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-[#1A2922] mb-1.5">
                          <span>Tỷ lệ người dùng đã xác minh eKYC</span>
                          <span className="font-mono font-bold text-[#1B4332]">
                            {users.length > 0
                              ? `${Math.round((verifiedUsersCount / users.length) * 100)}%`
                              : "0%"}
                          </span>
                        </div>
                        <Progress
                          value={verifiedUsersCount}
                          max={Math.max(1, users.length)}
                          tone="primary"
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card
                title="Doanh nghiệp gần đây"
                icon={Building2}
                actions={
                  <Link
                    href="/admin/tenants"
                    className="text-xs font-bold text-[#1B4332] hover:underline underline-offset-4 flex items-center gap-1"
                  >
                    Tất cả doanh nghiệp <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                }
                bodyClassName="p-0"
              >
                <Table
                  bare
                  loading={isLoading}
                  rows={tenants.slice(0, 6)}
                  getRowKey={(t) => t.id}
                  empty={<p className="p-6 text-sm text-[#2E3B33] text-center">Chưa có doanh nghiệp nào.</p>}
                  columns={[
                    {
                      key: "name",
                      header: "Doanh nghiệp",
                      primary: true,
                      render: (t) => (
                        <Link
                          href={`/admin/tenants/${t.id}`}
                          className="font-bold text-[#1A2922] hover:text-[#1B4332] hover:underline underline-offset-4"
                        >
                          {t.name}
                        </Link>
                      ),
                    },
                    {
                      key: "taxCode",
                      header: "MST",
                      render: (t) => (
                        <span className="font-mono text-xs text-[#2E3B33]">
                          {t.taxCode || "—"}
                        </span>
                      ),
                    },
                    {
                      key: "plan",
                      header: "Gói thuê bao",
                      render: (t) => (
                        <span className="text-xs font-semibold text-[#1A2922]">
                          {t.planName || "Chưa có gói"}
                          {t.subscriptionStatus === "Expired" && (
                            <span className="ml-1.5 text-rose-700 font-semibold">(Hết hạn)</span>
                          )}
                        </span>
                      ),
                    },
                    {
                      key: "verification",
                      header: "Xác thực",
                      render: (t) => (
                        <VerificationBadge status={t.verificationStatus ?? "Unverified"} />
                      ),
                    },
                  ]}
                />
              </Card>
            </div>

            {/* Right 4/12: Action Queue + Plans Summary */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <Card
                title="Tác vụ kiểm duyệt & quản trị"
                icon={ShieldAlert}
              >
                <div className="divide-y divide-[#EFECE4] text-xs">
                  {[
                    {
                      label: "Duyệt pháp nhân doanh nghiệp",
                      detail: `${pendingTenantsCount} hồ sơ đang chờ xử lý`,
                      href: "/admin/tenants",
                      highlight: pendingTenantsCount > 0,
                    },
                    {
                      label: "Kiểm tra hồ sơ eKYC",
                      detail: `${ekycs.length} bản ghi xác minh CCCD`,
                      href: "/admin/ekyc",
                      highlight: false,
                    },
                    {
                      label: "Quản lý người dùng hệ thống",
                      detail: `${lockedUsersCount} tài khoản đang bị khóa`,
                      href: "/admin/users",
                      highlight: lockedUsersCount > 0,
                    },
                    {
                      label: "Cấu hình gói & giá thuê bao",
                      detail: `${activePlansCount} gói đang mở bán`,
                      href: "/admin/plans",
                      highlight: false,
                    },
                  ].map((item) => (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group hover:text-[#1B4332] transition-colors"
                    >
                      <div>
                        <p className="font-bold text-[#1A2922] group-hover:text-[#1B4332]">
                          {item.label}
                        </p>
                        <p
                          className={`mt-0.5 ${
                            item.highlight ? "text-amber-700 font-semibold" : "text-[#2E3B33]"
                          }`}
                        >
                          {item.detail}
                        </p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#2E3B33] group-hover:text-[#1B4332] shrink-0" />
                    </Link>
                  ))}
                </div>
              </Card>

              <Card
                title="Danh mục gói thuê bao"
                icon={Package}
                actions={
                  <Link
                    href="/admin/plans"
                    className="text-xs font-bold text-[#1B4332] hover:underline underline-offset-4 flex items-center gap-1"
                  >
                    Chỉnh sửa <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                }
                bodyClassName="p-0"
              >
                <Table
                  bare
                  loading={isLoading}
                  rows={plans}
                  getRowKey={(p) => p.id}
                  empty={<p className="p-6 text-sm text-[#2E3B33] text-center">Chưa có gói dịch vụ nào.</p>}
                  columns={[
                    {
                      key: "name",
                      header: "Gói",
                      primary: true,
                      render: (p) => (
                        <span className="font-bold text-[#1A2922]">
                          {p.name}
                          {p.isTrial ? " (Thử)" : ""}
                        </span>
                      ),
                    },
                    {
                      key: "price",
                      header: "Giá",
                      align: "right",
                      render: (p) => <span className="font-mono text-xs font-bold">{formatMoney(p.price)}</span>,
                    },
                    {
                      key: "status",
                      header: "Bán",
                      render: (p) => (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-semibold ${
                            p.isActive
                              ? "bg-[#EFF5E8] text-[#1B4332]"
                              : "bg-[#F5F4EF] text-[#2E3B33]"
                          }`}
                        >
                          {p.isActive ? "Mở" : "Ẩn"}
                        </span>
                      ),
                    },
                  ]}
                />
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
