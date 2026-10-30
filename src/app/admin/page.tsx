"use client";

import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowRight,
  Building2,
  Package,
  ShieldCheck,
  Tag,
  UserCheck,
  Zap,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { subscriptionApi, type Plan } from "@/lib/api/subscription";
import { useApi } from "@/lib/use-api";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";

interface AdminOverviewData {
  user: Awaited<ReturnType<typeof authApi.me>>;
  plans: Plan[];
}

export default function AdminDashboardPage() {
  const { data, error, isLoading, reload } = useApi<AdminOverviewData>(
    "admin-overview-m1-m2",
    async () => {
      const [user, plans] = await Promise.all([
        authApi.me(),
        subscriptionApi.adminPlans(),
      ]);
      return { user, plans };
    },
  );

  const user = data?.user;
  const plans = data?.plans ?? [];
  const activePlansCount = plans.filter((p) => p.isActive).length;
  const trialPlan = plans.find((p) => p.isTrial);

  const workspaceHref = user?.hasTenant ? "/app" : "/onboarding";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Quản trị nền tảng Chữ Tín"
        description="Tổng quan hệ thống, giám sát các gói dịch vụ thuê bao và cấu hình vận hành nền tảng (M1 & M2)"
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/admin/plans">
              <Button variant="primary">
                <Package className="w-4 h-4 mr-1.5" />
                Quản lý gói dịch vụ
              </Button>
            </Link>
            <Link href={workspaceHref}>
              <Button variant="secondary">
                <ArrowLeftRight className="w-4 h-4 mr-1.5" aria-hidden="true" />
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
          {/* 4 StatCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading || !data ? (
              Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            ) : (
              <>
                <StatCard
                  label="Tổng số gói dịch vụ"
                  value={`${plans.length} gói`}
                  icon={Package}
                  tone="primary"
                  hint={`${activePlansCount} gói đang mở bán`}
                />
                <StatCard
                  label="Gói đang mở bán"
                  value={`${activePlansCount} gói`}
                  icon={Zap}
                  tone="success"
                  hint="Hiển thị trên bảng giá công khai"
                />
                <StatCard
                  label="Gói dùng thử mặc định"
                  value={trialPlan ? trialPlan.name : "Chưa cấu hình"}
                  icon={Tag}
                  tone="warning"
                  hint={trialPlan ? `${trialPlan.monthlyQuota} hợp đồng / ${trialPlan.durationDays} ngày` : undefined}
                />
                <StatCard
                  label="Doanh nghiệp liên kết"
                  value={`${user?.tenants?.length ?? 0} tổ chức`}
                  icon={Building2}
                  tone="primary"
                  hint="Tài khoản admin hiện đang tham gia"
                />
              </>
            )}
          </div>

          {/* Quick Plans Catalog Summary Card */}
          <Card
            title="Danh mục gói thuê bao hệ thống (M2)"
            icon={Package}
            actions={
              <Link
                href="/admin/plans"
                className="text-xs font-bold text-primary underline underline-offset-2 hover:text-primary-hover flex items-center gap-1"
              >
                <span>Chỉnh sửa bảng giá & mở bán</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            bodyClassName="p-0"
          >
            <Table
              bare
              loading={isLoading}
              rows={plans}
              getRowKey={(p) => p.id}
              empty={<p className="p-6 text-sm text-muted text-center">Chưa có gói dịch vụ nào.</p>}
              columns={[
                {
                  key: "name",
                  header: "Tên gói",
                  primary: true,
                  render: (p) => (
                    <span className="font-bold text-fg flex items-center gap-2">
                      Gói {p.name}
                      {p.isTrial && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-badge-signing-bg text-badge-signing-fg text-[11px] font-semibold">
                          Dùng thử
                        </span>
                      )}
                    </span>
                  ),
                },
                {
                  key: "price",
                  header: "Đơn giá",
                  align: "right",
                  render: (p) => <span className="font-bold">{formatMoney(p.price)}</span>,
                },
                {
                  key: "duration",
                  header: "Chu kỳ",
                  align: "right",
                  render: (p) => `${p.durationDays} ngày`,
                },
                {
                  key: "quota",
                  header: "Hạn mức / tháng",
                  align: "right",
                  render: (p) => `${p.monthlyQuota} hợp đồng`,
                },
                {
                  key: "status",
                  header: "Trạng thái mở bán",
                  render: (p) => (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        p.isActive
                          ? "bg-badge-completed-bg text-badge-completed-fg"
                          : "bg-badge-draft-bg text-badge-draft-fg"
                      }`}
                    >
                      {p.isActive ? "Đang bán" : "Ngừng bán"}
                    </span>
                  ),
                },
              ]}
            />
          </Card>

          {/* Admin Profile Details */}
          <Card title="Hồ sơ quản trị viên tối cao" icon={UserCheck}>
            {isLoading || !user ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-4 gap-y-3.5 text-sm">
                <dt className="text-muted font-medium">Họ và tên</dt>
                <dd className="font-bold text-fg">{user.fullName}</dd>

                <dt className="text-muted font-medium">Email quản trị</dt>
                <dd className="text-fg font-medium">{user.email}</dd>

                <dt className="text-muted font-medium">Quyền hạn hệ thống</dt>
                <dd>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-selected text-primary text-xs font-bold border border-primary/15">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                    Quản trị toàn quyền (Admin)
                  </span>
                </dd>

                <dt className="text-muted font-medium">Xác minh email</dt>
                <dd>
                  <Badge className="bg-badge-completed-bg text-badge-completed-fg">
                    {user.emailVerified ? "Đã xác minh an toàn" : "Chưa xác minh"}
                  </Badge>
                </dd>
              </dl>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
