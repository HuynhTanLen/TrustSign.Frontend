"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck2,
  FilePenLine,
  FileText,
  MailCheck,
  Plus,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserCog,
  Zap,
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

/**
 * DashboardPage — Phong cách Stripe & Mercury FinTech (2-Column Asymmetric Layout).
 * Cột trái rộng rãi hiển thị dòng hợp đồng thời gian thực; Cột phải tích hợp thẻ thuê bao,
 * thông tin pháp nhân và trung tâm bảo đảm pháp lý.
 */
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

  const completedContracts = data?.contracts.filter((c) => c.status === "Completed").length ?? 0;
  const pendingContracts =
    data?.contracts.filter((c) => c.status === "Pending" || c.status === "Signing").length ?? 0;

  const greeting = React.useMemo(() => getGreeting(), []);

  return (
    <div className="flex flex-col gap-8">
      {/* ==========================================================
          HEADER STRIP: LỜI CHÀO & CÁC NÚT TÁC VỤ NHANH
          ========================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-bold text-blue-700 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
              <span>Trung tâm Điều hành Ký kết</span>
            </span>
            {activeTenant && (
              <span className="text-xs text-slate-500 font-semibold truncate">
                · {activeTenant.name}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 truncate">
            {greeting}, <span className="text-blue-700">{user.fullName || "Quý khách"}</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Giám sát thời gian thực các luồng ký PAdES, chuỗi băm mật mã và quản trị pháp nhân điện tử.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={openProfileModal}
            leftIcon={<UserCog className="w-3.5 h-3.5" />}
          >
            Hồ sơ cá nhân
          </Button>
          <Link href="/app/templates">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FilePenLine className="w-3.5 h-3.5" />}
            >
              Mẫu hợp đồng
            </Button>
          </Link>
          <Link href="/app/contracts/new">
            <Button
              variant="primary"
              size="sm"
              glow
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Soạn hợp đồng mới
            </Button>
          </Link>
        </div>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          {/* ==========================================================
              4 THẺ KPI METRICS (STRIPE STYLE)
              ========================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {isLoading || !data ? (
              Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))
            ) : (
              <>
                <StatCard
                  label="Hạn mức gửi ký kỳ này"
                  value={`${quotaUsed} / ${quotaLimit}`}
                  icon={FileCheck2}
                  tone={quotaRatio >= 0.85 ? "warning" : "primary"}
                  hint={`Đã dùng ${Math.round(quotaRatio * 100)}% (${quotaLimit - quotaUsed} lượt còn lại)`}
                />
                <StatCard
                  label="Hợp đồng đang ký"
                  value={`${pendingContracts} luồng`}
                  icon={Clock}
                  tone={pendingContracts > 0 ? "warning" : "primary"}
                  hint={`${completedContracts} hợp đồng đã ký hoàn tất`}
                />
                <StatCard
                  label="Gói dịch vụ hiện tại"
                  value={sub ? `Gói ${sub.planName}` : "Chưa kích hoạt"}
                  icon={CreditCard}
                  tone="primary"
                  hint={
                    sub ? (
                      <span className="flex items-center gap-1.5">
                        <Badge subscriptionStatus={sub.status} className="scale-90 origin-left" />
                        <span className={daysLeft <= 5 ? "text-amber-700 font-extrabold" : "font-semibold text-slate-500"}>
                          {daysLeft > 0 ? `Còn ${daysLeft} ngày` : "Đã hết hạn"}
                        </span>
                      </span>
                    ) : (
                      "Vui lòng chọn gói để kích hoạt"
                    )
                  }
                />
                <StatCard
                  label="Người đại diện pháp lý"
                  value={user.fullName}
                  icon={ShieldCheck}
                  tone="success"
                  hint={activeTenant ? `Tại ${activeTenant.name}` : undefined}
                />
              </>
            )}
          </div>

          {/* ==========================================================
              BỐ CỤC 2 CỘT BẤT ĐỐI XỨNG (STRIPE / MERCURY ASYMMETRIC GRID)
              Cột trái 68% (Main Feed) — Cột phải 32% (Utility & Control)
              ========================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ==========================================================
                CỘT TRÁI (8/12 COLS): DÒNG HỢP ĐỒNG THỜI GIAN THỰC & LUỒNG KÝ
                ========================================================== */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Bảng hợp đồng gần đây */}
              <Card
                title={
                  <span className="flex items-center gap-2.5">
                    <span>Hợp đồng gần đây</span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {data?.contracts.length ?? 0}
                    </span>
                  </span>
                }
                icon={FileText}
                interactive
                actions={
                  <Link
                    href="/app/contracts"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors group"
                  >
                    <span>Xem tất cả danh sách</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                }
                bodyClassName="p-0"
              >
                <Table
                  bare
                  loading={isLoading}
                  refreshing={isRefreshing}
                  rows={(data?.contracts ?? []).slice(0, 6)}
                  getRowKey={(c) => c.id}
                  empty={
                    <div className="p-10">
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
                        <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-bold">
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
                          className="font-extrabold text-slate-900 hover:text-blue-600 transition-colors underline-offset-2 hover:underline block truncate max-w-sm"
                        >
                          {c.title}
                        </Link>
                      ),
                    },
                    {
                      key: "partner",
                      header: "Đối tác ký (Bên B)",
                      render: (c) => (
                        <span className="font-semibold text-slate-700">{c.partner}</span>
                      ),
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
                        <span className="text-xs text-slate-500 font-medium">
                          {c.sentAt ? formatDateTime(c.sentAt) : "Chưa phát hành"}
                        </span>
                      ),
                    },
                  ]}
                />
              </Card>

              {/* Thẻ hướng dẫn quy trình ký tuần tự 2 bên */}
              <Card
                title="Quy trình Ký kết Điện tử PAdES 2 Bên"
                icon={UserCheck}
                interactive
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-black text-xs mb-3">
                        01
                      </span>
                      <p className="text-sm font-extrabold text-slate-900">Bên A Ký duyệt</p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Chủ doanh nghiệp ký số trước qua mã OTP gửi về email định danh.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs mb-3">
                        02
                      </span>
                      <p className="text-sm font-extrabold text-slate-900">Bên B Ký ngoài</p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Đối tác nhận liên kết bảo mật và ký xác thực OTP mà không cần tạo tài khoản.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-black text-xs mb-3">
                        03
                      </span>
                      <p className="text-sm font-extrabold text-slate-900">Đóng dấu PAdES</p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Tự động đóng chứng thư số Adobe PAdES và gắn chuỗi băm SHA-256 bất biến.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* ==========================================================
                CỘT PHẢI (4/12 COLS): THẺ THUÊ BAO MERCURY & THÔNG TIN PHÁP NHÂN
                ========================================================== */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Thẻ Thuê bao & Hạn mức kiểu Mercury Banking */}
              {sub && (
                <div className="relative rounded-2xl p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white border border-slate-800 shadow-xl shadow-slate-950/15 overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/10 text-blue-200 border border-white/15">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Gói thuê bao
                      </span>
                      <Badge subscriptionStatus={sub.status} />
                    </div>

                    <h2 className="text-xl font-black text-white tracking-tight">
                      Gói {sub.planName}
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      {formatMoney(sub.price)} · Chu kỳ {sub.durationDays} ngày
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Hết hạn: {formatDate(sub.expiresAt)} ({daysLeft > 0 ? `còn ${daysLeft} ngày` : "đã hết hạn"})
                    </p>

                    <div className="mt-5 pt-4 border-t border-white/10">
                      <div className="flex justify-between text-xs font-bold text-slate-200 mb-1.5">
                        <span>Hạn mức gửi ký</span>
                        <span className="font-mono text-blue-300">
                          {sub.quotaUsed} / {sub.quotaLimit} lượt
                        </span>
                      </div>
                      <Progress
                        value={sub.quotaUsed}
                        max={sub.quotaLimit}
                        tone={quotaRatio >= 0.9 ? "danger" : quotaRatio >= 0.7 ? "warning" : "primary"}
                        label="Hạn mức hợp đồng đã gửi"
                        className="h-2.5 bg-white/15 border-white/20"
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-2">
                    <Link href="/app/billing" className="block">
                      <Button
                        variant="accent"
                        size="md"
                        fullWidth
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Nâng cấp / Gia hạn gói
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Thẻ Pháp nhân Doanh nghiệp */}
              <Card
                title="Pháp nhân Doanh nghiệp"
                icon={Building2}
                interactive
                actions={
                  activeTenant && (
                    <Badge
                      className={
                        activeTenant.status === "Active"
                          ? "bg-emerald-50 text-emerald-800 ring-emerald-300 font-bold"
                          : "bg-rose-50 text-rose-800 ring-rose-300 font-bold"
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
                  <dl className="flex flex-col gap-3 text-xs sm:text-sm">
                    <div>
                      <dt className="text-slate-500 font-semibold text-xs">Tên doanh nghiệp</dt>
                      <dd className="font-extrabold text-slate-900 mt-0.5 break-words">
                        {activeTenant.name}
                      </dd>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <dt className="text-slate-500 font-semibold text-xs">Mã số thuế</dt>
                      <dd className="font-mono text-slate-900 font-bold">
                        {activeTenant.taxCode || "Chưa cập nhật"}
                      </dd>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <dt className="text-slate-500 font-semibold text-xs">Email thông báo ký</dt>
                      <dd className="text-slate-800 font-medium break-all mt-0.5">
                        {activeTenant.contactEmail || user.email}
                      </dd>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <dt className="text-slate-500 font-semibold text-xs">Địa chỉ trụ sở</dt>
                      <dd className="text-slate-700 break-words mt-0.5">
                        {activeTenant.address || "Chưa cập nhật"}
                      </dd>
                    </div>
                  </dl>
                )}
              </Card>

              {/* Thẻ Bảo đảm Pháp lý */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs flex flex-col gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                  <span>Tuân thủ Pháp lý & Bảo mật</span>
                </div>
                <p className="leading-relaxed">
                  Toàn bộ tài liệu ký kết trên Chữ Tín được gắn dấu thời gian Timestamp chuẩn mở, đóng chứng thư số PAdES tương thích 100% Adobe Acrobat Reader và bảo chứng bởi chuỗi băm SHA-256 bất biến.
                </p>
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Luật Giao dịch điện tử 2023</span>
                  <span className="text-emerald-700 font-bold">Hợp pháp 100%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
