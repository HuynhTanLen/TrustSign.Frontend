"use client";

import Link from "next/link";
import { ArrowLeftRight, Building2, ShieldCheck, UserCheck } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useApi } from "@/lib/use-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const { data: user, error, isLoading, reload } = useApi("admin-me-m1", authApi.me);

  const workspaceHref = user?.hasTenant ? "/app" : "/onboarding";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Quản trị nền tảng"
        description="Thông tin tài khoản quản trị hệ thống ở mốc M1"
        actions={
          <Link href={workspaceHref}>
            <Button variant="primary">
              <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
              {user?.hasTenant ? "Mở khu doanh nghiệp" : "Tạo doanh nghiệp thử nghiệm"}
            </Button>
          </Link>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLoading || !user ? (
              <>
                <Skeleton className="h-[104px]" />
                <Skeleton className="h-[104px]" />
              </>
            ) : (
              <>
                <StatCard
                  label="Vai trò hệ thống"
                  value="Quản trị nền tảng"
                  icon={ShieldCheck}
                  tone="primary"
                  hint="Tài khoản quản trị toàn hệ thống (Admin)"
                />
                <StatCard
                  label="Doanh nghiệp liên kết"
                  value={user.tenants?.length ?? 0}
                  icon={Building2}
                  tone="success"
                  hint={
                    user.hasTenant
                      ? "Có thể chuyển sang khu doanh nghiệp để kiểm thử"
                      : "Chưa tham gia doanh nghiệp nào"
                  }
                />
              </>
            )}
          </div>

          <Card title="Hồ sơ quản trị viên" icon={UserCheck}>
            {isLoading || !user ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-4 gap-y-3 text-sm">
                <dt className="text-muted">Họ và tên</dt>
                <dd className="font-semibold text-fg">{user.fullName}</dd>

                <dt className="text-muted">Email đăng nhập</dt>
                <dd className="text-fg">{user.email}</dd>

                <dt className="text-muted">Trạng thái xác minh</dt>
                <dd>
                  <Badge className="bg-badge-completed-bg text-badge-completed-fg">
                    {user.emailVerified ? "Đã xác minh" : "Chưa xác minh"}
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
