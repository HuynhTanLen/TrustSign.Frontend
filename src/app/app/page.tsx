"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileEdit,
  FilePenLine,
  FileText,
  Plus,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { tenantsApi, type TenantDto } from "@/lib/api/tenants";
import { subscriptionApi, type CurrentSubscription } from "@/lib/api/subscription";
import { contractsApi, type ContractListItem } from "@/lib/api/contracts";
import { useApi } from "@/lib/use-api";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { useWorkspace } from "@/lib/workspace-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

type ContractFilter = "all" | "active" | "completed" | "draft";

function LifecyclePip({ status }: { status: ContractListItem["status"] }) {
  const stage =
    status === "Completed"
      ? 4
      : status === "Signing"
      ? 3
      : status === "Pending"
      ? 2
      : 1;
  const muted = status === "Declined" || status === "Cancelled" || status === "Expired";

  return (
    <div className="flex items-center gap-1 mt-1" aria-label={`Tiến độ: ${status}`}>
      {[1, 2, 3, 4].map((step) => (
        <span
          key={step}
          className={`h-1 w-4 rounded-sm ${
            muted ? "bg-rose-300" : step <= stage ? "bg-[#1B4332]" : "bg-[#E6E4DC]"
          }`}
        />
      ))}
    </div>
  );
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
  const quotaUsed = sub?.quotaUsed ?? 0;
  const quotaLimit = sub?.quotaLimit ?? 0;
  const quotaRatio = quotaLimit > 0 ? quotaUsed / quotaLimit : 0;

  const completedContracts = data?.contracts.filter((c) => c.status === "Completed").length ?? 0;
  const pendingContracts =
    data?.contracts.filter((c) => c.status === "Pending" || c.status === "Signing").length ?? 0;
  const draftContracts = data?.contracts.filter((c) => c.status === "Draft").length ?? 0;

  const [filter, setFilter] = React.useState<ContractFilter>("all");
  const filteredContracts = React.useMemo(() => {
    const list = data?.contracts ?? [];
    switch (filter) {
      case "active":
        return list.filter((c) => c.status === "Pending" || c.status === "Signing");
      case "completed":
        return list.filter((c) => c.status === "Completed");
      case "draft":
        return list.filter((c) => c.status === "Draft");
      default:
        return list;
    }
  }, [data?.contracts, filter]);

  const greeting = React.useMemo(() => getGreeting(), []);

  if (error) {
    return <ErrorState error={error} onRetry={reload} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ==========================================================
          LEFT RAIL (3/12): WORKSPACE IDENTITY, ACTIONS & QUOTA
          ========================================================== */}
      <aside className="lg:col-span-3 lg:sticky lg:top-24 flex flex-col gap-5">
        {/* Greeting & Primary Actions */}
        <div className="bg-white border border-[#E6E4DC] rounded-sm p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1B4332]">
            {greeting}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1A2922] leading-snug">
            <span className="font-serif italic font-normal text-[#1B4332]">
              {user.fullName || "Quý khách"}
            </span>
          </h1>

          <div className="mt-5 flex flex-col gap-2">
            <Link href="/app/contracts/new" className="block">
              <Button
                variant="primary"
                size="md"
                fullWidth
                className="rounded-sm"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Soạn hợp đồng mới
              </Button>
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/app/templates" className="block">
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  className="rounded-sm"
                  leftIcon={<FilePenLine className="w-3.5 h-3.5" />}
                >
                  Mẫu
                </Button>
              </Link>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                fullWidth
                onClick={openProfileModal}
                className="rounded-sm"
                leftIcon={<UserCog className="w-3.5 h-3.5" />}
              >
                Hồ sơ
              </Button>
            </div>
          </div>
        </div>

        {/* Quota & Subscription */}
        <div className="bg-white border border-[#E6E4DC] rounded-sm p-5">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E6E4DC]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E3B33]">
              Hạn mức &amp; Gói
            </span>
            {sub && <Badge subscriptionStatus={sub.status} size="sm" />}
          </div>

          {isLoading || !data ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-2 w-full" />
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-[#1A2922] tabular-nums">
                  {quotaUsed} / {quotaLimit}
                </span>
                <span className="text-xs text-[#2E3B33]">lượt gửi ký</span>
              </div>
              <Progress
                value={quotaUsed}
                max={quotaLimit}
                tone={quotaRatio >= 0.9 ? "danger" : quotaRatio >= 0.7 ? "warning" : "primary"}
                label="Hạn mức hợp đồng đã gửi"
                className="h-1.5 mt-2.5"
              />
              {sub && (
                <div className="mt-4 pt-3 border-t border-[#EFECE4] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#1A2922]">
                      {sub.planName} · {formatMoney(sub.price)}
                    </p>
                    <p className="text-[11px] text-[#2E3B33]">
                      HSD: {formatDate(sub.expiresAt)}
                    </p>
                  </div>
                  <Link
                    href="/app/billing"
                    className="font-bold text-[#1B4332] hover:underline underline-offset-4 inline-flex items-center gap-0.5 shrink-0"
                  >
                    Nâng cấp
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Entity Summary */}
        <div className="bg-white border border-[#E6E4DC] rounded-sm p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E6E4DC]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E3B33]">
              Pháp nhân
            </span>
            {activeTenant && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${
                  activeTenant.status === "Active"
                    ? "bg-[#EFF5E8] text-[#1B4332]"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {activeTenant.status === "Active" ? "Hoạt động" : "Tạm khóa"}
              </span>
            )}
          </div>

          {isLoading || !activeTenant ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ) : (
            <dl className="space-y-2.5 text-xs">
              <div>
                <dt className="text-[#2E3B33]">Mã số thuế</dt>
                <dd className="font-mono font-bold text-[#1A2922] mt-0.5">
                  {activeTenant.taxCode || "Chưa cập nhật"}
                </dd>
              </div>
              <div>
                <dt className="text-[#2E3B33]">Email thông báo</dt>
                <dd className="font-medium text-[#1A2922] break-all mt-0.5">
                  {activeTenant.contactEmail || user.email}
                </dd>
              </div>
              <div>
                <dt className="text-[#2E3B33]">Địa chỉ</dt>
                <dd className="text-[#2E3B33] break-words mt-0.5">
                  {activeTenant.address || "Chưa cập nhật"}
                </dd>
              </div>
            </dl>
          )}
        </div>
      </aside>

      {/* ==========================================================
          MAIN STAGE (9/12): CLICKABLE LANES + CONTRACT PIPELINE
          ========================================================== */}
      <div className="lg:col-span-9 flex flex-col gap-7">
        {/* 3 Clickable Tri-State Lanes (DocuSign / PandaDoc Command Pattern) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              id: "active" as const,
              label: "Đang chờ / Đang ký",
              count: pendingContracts,
              sub: "Cần theo dõi luồng ký",
              icon: Clock,
            },
            {
              id: "completed" as const,
              label: "Hoàn tất PAdES",
              count: completedContracts,
              sub: "Đã đóng dấu & lưu hash",
              icon: CheckCircle2,
            },
            {
              id: "draft" as const,
              label: "Bản nháp nội bộ",
              count: draftContracts,
              sub: "Chưa phát hành gửi ký",
              icon: FileEdit,
            },
          ].map((lane) => {
            const Icon = lane.icon;
            const active = filter === lane.id;
            return (
              <button
                key={lane.id}
                type="button"
                onClick={() => setFilter(active ? "all" : lane.id)}
                className={`text-left p-5 rounded-sm border transition-all cursor-pointer ${
                  active
                    ? "bg-[#EFF5E8] border-[#1B4332]"
                    : "bg-white border-[#E6E4DC] hover:border-[#1B4332]/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E3B33]">
                    {lane.label}
                  </span>
                  <Icon className="w-4 h-4 text-[#1B4332]" aria-hidden="true" />
                </div>
                <p className="mt-2 text-3xl font-black text-[#1A2922] tabular-nums">
                  {isLoading ? "—" : lane.count}
                </p>
                <p className="mt-1 text-xs text-[#2E3B33]">{lane.sub}</p>
              </button>
            );
          })}
        </div>

        {/* Full-Width Contract Table */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b-2 border-[#1A2922]">
            <div className="flex items-baseline gap-2.5">
              <span className="font-serif italic text-xl text-[#1B4332]">01.</span>
              <h2 className="text-lg font-extrabold tracking-tight text-[#1A2922]">
                Danh sách hợp đồng
              </h2>
              <span className="text-xs font-bold text-[#2E3B33]">
                ({filteredContracts.length})
              </span>
              {filter !== "all" && (
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="ml-1 text-xs font-bold text-[#1B4332] underline underline-offset-4 cursor-pointer"
                >
                  Hiện tất cả
                </button>
              )}
            </div>

            <Link
              href="/app/contracts"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1B4332] hover:underline underline-offset-4"
            >
              Mở trang quản lý
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="bg-white border border-[#E6E4DC] rounded-sm overflow-hidden">
            <Table
              bare
              loading={isLoading}
              refreshing={isRefreshing}
              rows={filteredContracts.slice(0, 8)}
              getRowKey={(c) => c.id}
              empty={
                <div className="p-8">
                  <EmptyState
                    icon={<FileText />}
                    compact
                    title="Chưa có hợp đồng nào"
                    description="Soạn hợp đồng từ thư viện mẫu chuẩn hoặc tải PDF lên để gửi ký trực tuyến."
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
                    <span className="font-mono text-xs text-[#1A2922] bg-[#F5F4EF] px-2 py-0.5 rounded-sm border border-[#E6E4DC] font-semibold">
                      {c.code}
                    </span>
                  ),
                },
                {
                  key: "title",
                  header: "Tên hợp đồng",
                  primary: true,
                  render: (c) => (
                    <div>
                      <Link
                        href={`/app/contracts/${c.id}`}
                        className="font-bold text-[#1A2922] hover:text-[#1B4332] transition-colors underline-offset-4 hover:underline block truncate max-w-md"
                      >
                        {c.title}
                      </Link>
                      <LifecyclePip status={c.status} />
                    </div>
                  ),
                },
                {
                  key: "partner",
                  header: "Bên B",
                  render: (c) => (
                    <span className="text-xs font-medium text-[#2E3B33]">{c.partner}</span>
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
                    <span className="text-xs text-[#2E3B33]">
                      {c.sentAt ? formatDateTime(c.sentAt) : "Nháp"}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </section>

        {/* Bottom Compact 3-Step Strip */}
        <section className="bg-white border border-[#E6E4DC] rounded-sm p-5">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#EFECE4]">
            <ShieldCheck className="w-4 h-4 text-[#1B4332]" aria-hidden="true" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#1A2922]">
              Quy trình ký số PAdES chuẩn pháp lý
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            {[
              { num: "01.", title: "Bên A ký duyệt", desc: "Ký xác thực OTP qua email doanh nghiệp." },
              { num: "02.", title: "Bên B ký ngoài", desc: "Đối tác ký qua liên kết OTP không cần tài khoản." },
              { num: "03.", title: "Đóng dấu PAdES", desc: "Gắn chứng thư PAdES và chuỗi băm SHA-256." },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-2.5">
                <span className="font-serif italic text-base text-[#1B4332] shrink-0">
                  {step.num}
                </span>
                <div>
                  <p className="font-bold text-[#1A2922]">{step.title}</p>
                  <p className="text-[#2E3B33] mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
