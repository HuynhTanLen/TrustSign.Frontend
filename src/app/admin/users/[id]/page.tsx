"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Building2, IdCard, ShieldCheck, UserRound } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { useApi } from "@/lib/use-api";
import { formatDate, formatDateTime } from "@/lib/format";
import { TENANT_ROLE_LABELS } from "@/lib/workspace-context";
import { AdminHistoryCard, InfoList, LockActions } from "@/components/admin-profile";
import { LockBadge } from "@/components/lock-badge";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";

const STATUS_LABELS = { Pending: "Chưa xác minh email", Active: "Hoạt động", Locked: "Bị quản trị viên khóa" } as const;

export default function AdminUserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: u, error, isLoading, reload } = useApi(`admin-user:${id}`, () => adminApi.user(id));

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (isLoading || !u) return <Skeleton className="h-96" />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back={{ href: "/admin/users", label: "Người dùng" }}
        title={u.fullName}
        description={
          <span className="inline-flex items-center gap-2">
            {u.email}
            {u.isAdmin ? <span className="text-xs font-semibold text-primary">Quản trị viên</span> : <LockBadge locked={u.isLocked} />}
          </span>
        }
        actions={
          // Tài khoản quản trị và tài khoản chưa xác minh email không khóa được (backend cũng chặn).
          !u.isAdmin && u.status !== "Pending" && (
            <LockActions
              name={u.fullName}
              noun="tài khoản"
              isLocked={u.isLocked}
              lockMessage="sẽ không đăng nhập được; mọi phiên bị thu hồi, phiên đang mở hết hiệu lực trong tối đa 15 phút."
              unlockMessage="sẽ đăng nhập lại được."
              onLock={async (reason) => {
                await adminApi.lockUser(u.id, reason);
                reload();
              }}
              onUnlock={async () => {
                await adminApi.unlockUser(u.id);
                reload();
              }}
            />
          )
        }
      />

      {u.isLocked && (
        <p className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          Khóa lúc {formatDateTime(u.lockedAt)}. Lý do: {u.lockReason}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Thông tin tài khoản" icon={UserRound}>
          <InfoList
            items={[
              ["Trạng thái", STATUS_LABELS[u.status]],
              ["Điện thoại", u.phoneNumber],
              ["Chức danh", u.jobTitle],
              ["Ngày đăng ký", formatDate(u.createdAt)],
              ["Đồng ý điều khoản", u.termsAcceptedAt && formatDateTime(u.termsAcceptedAt)],
            ]}
          />
        </Card>

        <Card title="Bảo mật đăng nhập" icon={ShieldCheck}>
          <InfoList
            items={[
              ["Email", u.emailVerified ? "Đã xác minh" : <span className="text-warning font-semibold">Chưa xác minh</span>],
              ["Đăng nhập sai liên tiếp", `${u.failedLoginCount} lần`],
              [
                "Khóa tạm do sai mật khẩu",
                u.temporarilyLockedUntil ? <span className="text-danger">Đến {formatDateTime(u.temporarilyLockedUntil)}</span> : "Không",
              ],
            ]}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={`Doanh nghiệp tham gia (${u.tenants.length})`} icon={Building2} bodyClassName="p-0">
          <Table
            bare
            rows={u.tenants}
            getRowKey={(t) => t.tenantId}
            empty={<p className="p-4 text-sm text-muted">Chưa tham gia doanh nghiệp nào.</p>}
            columns={[
              {
                key: "name",
                header: "Doanh nghiệp",
                primary: true,
                render: (t) => (
                  <Link href={`/admin/tenants/${t.tenantId}`} className="font-semibold text-primary hover:underline">
                    {t.tenantName}
                  </Link>
                ),
              },
              { key: "role", header: "Vai trò", render: (t) => TENANT_ROLE_LABELS[t.role] ?? t.role },
              { key: "joined", header: "Tham gia", render: (t) => formatDate(t.joinedAt) },
              { key: "lock", header: "Trạng thái", render: (t) => <LockBadge locked={t.tenantLocked} /> },
            ]}
          />
        </Card>

        <Card title="Xác minh danh tính (eKYC)" icon={IdCard}>
          {u.ekyc ? (
            <>
              <InfoList
                items={[
                  ["Kết quả", u.ekyc.status === "Verified" ? "Đã xác minh" : <span className="text-danger">Đã thu hồi</span>],
                  ["Họ tên trên CCCD", u.ekyc.fullName],
                  ["Số CCCD", <span key="cid" className="font-mono">{u.ekyc.citizenIdMasked}</span>],
                  ["Thời điểm", formatDateTime(u.ekyc.verifiedAt)],
                ]}
              />
              <p className="text-xs text-muted mt-3">
                Ảnh CCCD và ảnh khuôn mặt chỉ xem ở{" "}
                <Link href="/admin/ekyc" className="text-primary hover:underline">
                  trang eKYC
                </Link>
                .
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">Chưa xác minh danh tính.</p>
          )}
        </Card>
      </div>

      <AdminHistoryCard items={u.history} />
    </div>
  );
}
