"use client";

import * as React from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import { authApi } from "@/lib/api/auth";
import {
  tenantsApi,
  type TenantInvitationDto,
  type TenantMemberDto,
  type TenantRole,
} from "@/lib/api/tenants";
import { useApi } from "@/lib/use-api";
import { formatDate, formatDateTime } from "@/lib/format";
import { TENANT_ROLE_LABELS, useWorkspace } from "@/lib/workspace-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import {
  CircleAlert,
  Mail,
  RefreshCw,
  ShieldAlert,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

const ROLE_OPTIONS: { value: TenantRole; label: string }[] = [
  { value: "TenantOwner", label: "Chủ doanh nghiệp" },
  { value: "ContractManager", label: "Quản lý hợp đồng" },
  { value: "Employee", label: "Nhân viên" },
];

interface MembersPayload {
  members: TenantMemberDto[];
  invitations: TenantInvitationDto[];
}

export default function MembersPage() {
  const { user, activeTenantId, refreshUser } = useWorkspace();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = React.useState<"members" | "invitations">("members");

  const { data, error, isLoading, reload, mutate } = useApi<MembersPayload>(
    `tenant-members:${activeTenantId}`,
    async () => {
      const [members, invitations] = await Promise.all([
        tenantsApi.getMembers(),
        tenantsApi.getPendingInvitations(),
      ]);
      return { members, invitations };
    },
  );

  const members = React.useMemo(() => data?.members ?? [], [data?.members]);
  const invitations = React.useMemo(() => data?.invitations ?? [], [data?.invitations]);
  const forbiddenError = error instanceof ApiError && error.status === 403 ? error : null;

  // Hộp thoại mời thành viên
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<TenantRole>("Employee");
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [isInviting, setIsInviting] = React.useState(false);

  // Hộp thoại xác nhận xóa thành viên
  const [memberToRemove, setMemberToRemove] = React.useState<TenantMemberDto | null>(null);
  const [isRemoving, setIsRemoving] = React.useState(false);

  // Khóa thao tác theo từng dòng
  const [updatingRoleUserId, setUpdatingRoleUserId] = React.useState<string | null>(null);
  const [busyInvitationId, setBusyInvitationId] = React.useState<string | null>(null);

  const ownerCount = React.useMemo(
    () => members.filter((m) => m.role === "TenantOwner").length,
    [members],
  );

  const handleRoleChange = async (member: TenantMemberDto, newRole: TenantRole) => {
    if (member.role === newRole) return;
    setUpdatingRoleUserId(member.userId);
    try {
      const updated = await tenantsApi.changeMemberRole(member.userId, newRole);
      mutate((prev) => ({
        ...prev,
        members: prev.members.map((m) => (m.userId === member.userId ? updated : m)),
      }));
      toast("Đã cập nhật vai trò thành viên", "success");

      if (member.userId === user.id) {
        await authApi.refresh();
        await refreshUser();
      }
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Không thể đổi vai trò thành viên",
        "error",
      );
    } finally {
      setUpdatingRoleUserId(null);
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);
    try {
      await tenantsApi.removeMember(memberToRemove.userId);
      const removedId = memberToRemove.userId;
      mutate((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.userId !== removedId),
      }));
      setMemberToRemove(null);
      toast("Đã xóa thành viên khỏi doanh nghiệp", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể xóa thành viên", "error");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleOpenInvite = () => {
    setInviteEmail("");
    setInviteRole("Employee");
    setInviteError(null);
    setInviteOpen(true);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = inviteEmail.trim();
    if (!trimmedEmail) return;

    setInviteError(null);
    setIsInviting(true);
    try {
      const created = await tenantsApi.inviteMember(trimmedEmail, inviteRole);
      mutate((prev) => ({
        ...prev,
        invitations: [created, ...prev.invitations],
      }));
      setInviteOpen(false);
      setActiveTab("invitations");
      toast(`Đã gửi lời mời tới ${created.email}`, "success");
    } catch (err) {
      setInviteError(err instanceof ApiError ? err.message : "Không thể gửi lời mời lúc này.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleResendInvite = async (inv: TenantInvitationDto) => {
    setBusyInvitationId(inv.id);
    try {
      await tenantsApi.revokeInvitation(inv.id);
      const created = await tenantsApi.inviteMember(inv.email, inv.role);
      mutate((prev) => ({
        ...prev,
        invitations: [created, ...prev.invitations.filter((item) => item.id !== inv.id)],
      }));
      toast(`Đã gửi lại lời mời tới ${inv.email}`, "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể gửi lại lời mời", "error");
    } finally {
      setBusyInvitationId(null);
    }
  };

  const handleRevokeInvite = async (inv: TenantInvitationDto) => {
    setBusyInvitationId(inv.id);
    try {
      await tenantsApi.revokeInvitation(inv.id);
      mutate((prev) => ({
        ...prev,
        invitations: prev.invitations.filter((item) => item.id !== inv.id),
      }));
      toast("Đã thu hồi lời mời", "info");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể thu hồi lời mời", "error");
    } finally {
      setBusyInvitationId(null);
    }
  };

  if (forbiddenError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Thành viên và lời mời"
          description="Quản lý danh sách nhân sự và phân quyền trong doanh nghiệp"
        />
        <Card title="Không có quyền truy cập" icon={ShieldAlert}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-fg">
                Chỉ <span className="font-semibold">Chủ doanh nghiệp</span> mới có quyền quản lý thành viên và gửi lời mời.
              </p>
              {forbiddenError.correlationId && (
                <p className="mt-1 font-mono text-xs text-muted">
                  Mã theo dõi: {forbiddenError.correlationId}
                </p>
              )}
            </div>
            <Link href="/app">
              <Button variant="secondary">Về trang tổng quan</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Thành viên và lời mời"
        description="Quản lý thành viên, phân quyền vai trò và lời mời tham gia doanh nghiệp"
        actions={
          <Button type="button" variant="primary" onClick={handleOpenInvite}>
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            Mời thành viên
          </Button>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : (
        <>
          <Tabs
            tabs={[
              {
                id: "members",
                label: isLoading ? "Thành viên" : `Thành viên (${members.length})`,
              },
              {
                id: "invitations",
                label: isLoading ? "Lời mời đang chờ" : `Lời mời đang chờ (${invitations.length})`,
              },
            ]}
            value={activeTab}
            onChange={(id) => setActiveTab(id as "members" | "invitations")}
          />

          {activeTab === "members" ? (
            <Card title="Danh sách thành viên" icon={Users} bodyClassName="p-0">
              <Table
                bare
                loading={isLoading}
                rows={members}
                getRowKey={(m) => m.userId}
                empty={
                  <EmptyState
                    icon={<Users />}
                    title="Chưa có thành viên"
                    description="Mời các thành viên trong đơn vị để bắt đầu làm việc."
                    actionLabel="Mời thành viên"
                    onAction={handleOpenInvite}
                    className="border-0 rounded-none"
                  />
                }
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
                    render: (m) => {
                      const isLastOwner = m.role === "TenantOwner" && ownerCount <= 1;
                      const isUpdating = updatingRoleUserId === m.userId;
                      return (
                        <div className="w-48">
                          <Select
                            aria-label={`Vai trò của ${m.fullName}`}
                            value={m.role}
                            options={ROLE_OPTIONS}
                            disabled={isLastOwner || isUpdating}
                            title={
                              isLastOwner
                                ? "Không thể hạ quyền Chủ doanh nghiệp cuối cùng"
                                : undefined
                            }
                            onChange={(e) =>
                              handleRoleChange(m, e.target.value as TenantRole)
                            }
                          />
                        </div>
                      );
                    },
                  },
                  {
                    key: "joinedAt",
                    header: "Ngày tham gia",
                    render: (m) => <span className="text-muted">{formatDate(m.joinedAt)}</span>,
                  },
                  {
                    key: "actions",
                    header: "Thao tác",
                    align: "right",
                    render: (m) => {
                      const isSelf = m.userId === user.id;
                      const isLastOwner = m.role === "TenantOwner" && ownerCount <= 1;
                      const disabledReason = isSelf
                        ? "Không thể tự xóa chính mình"
                        : isLastOwner
                        ? "Không thể xóa Chủ doanh nghiệp cuối cùng"
                        : undefined;
                      return (
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={isSelf || isLastOwner}
                          title={disabledReason}
                          onClick={() => setMemberToRemove(m)}
                          className="text-danger hover:bg-badge-declined-bg"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                          Xóa
                        </Button>
                      );
                    },
                  },
                ]}
              />
            </Card>
          ) : (
            <Card title="Lời mời đang chờ xác nhận" icon={Mail} bodyClassName="p-0">
              <Table
                bare
                loading={isLoading}
                rows={invitations}
                getRowKey={(inv) => inv.id}
                empty={
                  <EmptyState
                    icon={<Mail />}
                    title="Chưa có lời mời đang chờ"
                    description="Các lời mời đã gửi qua email nhưng chưa được người nhận chấp nhận sẽ hiển thị tại đây."
                    actionLabel="Mời thành viên"
                    onAction={handleOpenInvite}
                    className="border-0 rounded-none"
                  />
                }
                columns={[
                  {
                    key: "email",
                    header: "Email người nhận",
                    primary: true,
                    render: (inv) => <span className="font-semibold text-fg">{inv.email}</span>,
                  },
                  {
                    key: "role",
                    header: "Vai trò được gán",
                    render: (inv) => (
                      <Badge
                        className={
                          inv.role === "TenantOwner"
                            ? "bg-badge-signing-bg text-badge-signing-fg"
                            : "bg-badge-draft-bg text-badge-draft-fg"
                        }
                      >
                        {TENANT_ROLE_LABELS[inv.role] ?? inv.role}
                      </Badge>
                    ),
                  },
                  {
                    key: "createdAt",
                    header: "Thời gian gửi",
                    render: (inv) => (
                      <span className="text-muted">{formatDateTime(inv.createdAt)}</span>
                    ),
                  },
                  {
                    key: "expiresAt",
                    header: "Hết hạn",
                    render: (inv) => (
                      <span className="text-muted">{formatDateTime(inv.expiresAt)}</span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "Thao tác",
                    align: "right",
                    render: (inv) => {
                      const isBusy = busyInvitationId === inv.id;
                      return (
                        <div className="inline-flex items-center gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={isBusy}
                            onClick={() => handleResendInvite(inv)}
                          >
                            <RefreshCw className="w-4 h-4" aria-hidden="true" />
                            Gửi lại
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={isBusy}
                            onClick={() => handleRevokeInvite(inv)}
                            className="text-danger hover:bg-badge-declined-bg"
                          >
                            <XCircle className="w-4 h-4" aria-hidden="true" />
                            Thu hồi
                          </Button>
                        </div>
                      );
                    },
                  },
                ]}
              />
            </Card>
          )}
        </>
      )}

      {/* Hộp thoại mời thành viên */}
      <Dialog
        open={inviteOpen}
        onClose={() => !isInviting && setInviteOpen(false)}
        title="Mời thành viên"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setInviteOpen(false)}
              disabled={isInviting}
            >
              Hủy
            </Button>
            <Button type="submit" form="invite-member-form" variant="primary" isLoading={isInviting}>
              Gửi lời mời
            </Button>
          </>
        }
      >
        <form id="invite-member-form" onSubmit={handleInviteSubmit} className="flex flex-col gap-4">
          {inviteError && (
            <div
              role="alert"
              className="p-3 rounded-md border border-line bg-badge-declined-bg text-sm text-danger flex items-start gap-2"
            >
              <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{inviteError}</span>
            </div>
          )}

          <Input
            label="Email người nhận"
            type="email"
            required
            placeholder="nhanvien@doanhnghiep.vn"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
            helperText="Liên kết lời mời có hiệu lực trong 7 ngày."
          />

          <Select
            label="Vai trò trong doanh nghiệp"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as TenantRole)}
            options={[
              { value: "Employee", label: "Nhân viên" },
              { value: "ContractManager", label: "Quản lý hợp đồng" },
              { value: "TenantOwner", label: "Chủ doanh nghiệp" },
            ]}
          />
        </form>
      </Dialog>

      {/* Hộp thoại xác nhận xóa thành viên */}
      <Dialog
        open={memberToRemove !== null}
        onClose={() => !isRemoving && setMemberToRemove(null)}
        title="Xác nhận xóa thành viên"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setMemberToRemove(null)}
              disabled={isRemoving}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isRemoving}
              onClick={handleConfirmRemove}
            >
              Xóa thành viên
            </Button>
          </>
        }
      >
        {memberToRemove && (
          <p className="text-sm text-fg">
            Bạn có chắc chắn muốn xóa thành viên{" "}
            <span className="font-semibold">{memberToRemove.fullName}</span> ({memberToRemove.email}) khỏi doanh nghiệp hiện tại không?
          </p>
        )}
      </Dialog>
    </div>
  );
}
