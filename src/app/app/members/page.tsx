"use client";

import * as React from "react";
import { ApiError } from "@/lib/api";
import {
  tenantsApi,
  TenantInvitationDto,
  TenantMemberDto,
  TenantRole,
} from "@/lib/api/tenants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { UserPlus, Trash2, Mail, Shield, RefreshCw, XCircle } from "lucide-react";

export default function MembersPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"members" | "invitations">("members");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<TenantRole>("Employee");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [forbidden, setForbidden] = React.useState(false);

  const [members, setMembers] = React.useState<TenantMemberDto[]>([]);
  const [invitations, setInvitations] = React.useState<TenantInvitationDto[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    Promise.all([tenantsApi.getMembers(), tenantsApi.getPendingInvitations()])
      .then(([memberList, invitationList]) => {
        if (!isMounted) return;
        setMembers(memberList);
        setInvitations(invitationList);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err instanceof ApiError && err.status === 403) {
          setForbidden(true);
        } else {
          toast("Không thể tải danh sách thành viên", "error");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const handleRoleChange = async (userId: string, newRole: TenantRole) => {
    try {
      const updated = await tenantsApi.changeMemberRole(userId, newRole);
      setMembers((prev) => prev.map((m) => (m.userId === userId ? updated : m)));
      toast("Đã cập nhật vai trò thành viên", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Không thể đổi vai trò thành viên",
        "error",
      );
    }
  };

  const handleDeleteMember = async (member: TenantMemberDto) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa thành viên ${member.fullName}?`)) {
      return;
    }

    try {
      await tenantsApi.removeMember(member.userId);
      setMembers((prev) => prev.filter((m) => m.userId !== member.userId));
      toast("Đã xóa thành viên khỏi doanh nghiệp", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Không thể xóa thành viên",
        "error",
      );
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setIsSubmitting(true);
    try {
      const created = await tenantsApi.inviteMember(inviteEmail, inviteRole);
      setInvitations((prev) => [created, ...prev]);
      toast(`Đã gửi email mời tham gia đến ${created.email}`, "success");
      setModalOpen(false);
      setInviteEmail("");
      setActiveTab("invitations");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Không thể gửi lời mời",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendInvite = async (inv: TenantInvitationDto) => {
    try {
      await tenantsApi.revokeInvitation(inv.id);
      const created = await tenantsApi.inviteMember(inv.email, inv.role);
      setInvitations((prev) => [created, ...prev.filter((item) => item.id !== inv.id)]);
      toast(`Đã gửi lại lời mời tới ${inv.email}`, "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Không thể gửi lại lời mời",
        "error",
      );
    }
  };

  const handleRevokeInvite = async (inv: TenantInvitationDto) => {
    try {
      await tenantsApi.revokeInvitation(inv.id);
      setInvitations((prev) => prev.filter((item) => item.id !== inv.id));
      toast("Đã thu hồi lời mời", "info");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Không thể thu hồi lời mời",
        "error",
      );
    }
  };

  const roleLabel = (role: TenantRole) => {
    switch (role) {
      case "TenantOwner":
        return "Chủ doanh nghiệp";
      case "ContractManager":
        return "Quản lý hợp đồng";
      default:
        return "Nhân viên";
    }
  };

  if (forbidden) {
    return (
      <div className="bg-surface border border-line rounded-2xl p-8 text-center">
        <Shield className="w-10 h-10 text-danger mx-auto mb-3" />
        <h1 className="text-lg font-semibold text-slate-900 mb-1">
          Không có quyền truy cập
        </h1>
        <p className="text-sm text-muted">
          Chỉ Chủ doanh nghiệp mới có quyền quản lý thành viên và gửi lời mời.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Thành viên & Phân quyền
          </h1>
          <p className="text-sm text-muted mt-1">
            Quản lý tài khoản nhân sự và lời mời tham gia doanh nghiệp hiện tại
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
          <UserPlus className="w-4 h-4" />
          <span>Mời thành viên mới</span>
        </Button>
      </div>

      <div className="flex items-center gap-2 border-b border-line pb-3">
        <button
          onClick={() => setActiveTab("members")}
          className={`h-10 px-5 rounded-xl text-sm font-semibold transition ${
            activeTab === "members"
              ? "bg-primary text-white"
              : "bg-surface text-slate-600 hover:bg-slate-100 border border-line"
          }`}
        >
          Danh sách thành viên ({members.length})
        </button>
        <button
          onClick={() => setActiveTab("invitations")}
          className={`h-10 px-5 rounded-xl text-sm font-semibold transition ${
            activeTab === "invitations"
              ? "bg-primary text-white"
              : "bg-surface text-slate-600 hover:bg-slate-100 border border-line"
          }`}
        >
          Lời mời đang chờ ({invitations.length})
        </button>
      </div>

      {isLoading ? (
        <div className="bg-surface border border-line rounded-2xl p-8 text-center text-sm text-muted">
          Đang tải dữ liệu thành viên…
        </div>
      ) : activeTab === "members" ? (
        <div className="bg-surface border border-line rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-line text-xs uppercase tracking-wider font-semibold text-slate-500 h-12">
                  <th className="px-6">Họ và tên</th>
                  <th className="px-6">Email công việc</th>
                  <th className="px-6">Vai trò trong doanh nghiệp</th>
                  <th className="px-6">Ngày tham gia</th>
                  <th className="px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {members.map((m) => (
                  <tr key={m.userId} className="h-[64px] hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 text-primary font-bold text-xs flex items-center justify-center">
                          {m.fullName.substring(0, 1).toUpperCase()}
                        </div>
                        <span>{m.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 text-slate-600">{m.email}</td>
                    <td className="px-6">
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.userId, e.target.value as TenantRole)}
                        className="h-10 border border-slate-300 rounded-xl px-3.5 text-sm font-medium bg-surface text-slate-900 focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="TenantOwner">Chủ doanh nghiệp</option>
                        <option value="ContractManager">Quản lý hợp đồng</option>
                        <option value="Employee">Nhân viên</option>
                      </select>
                    </td>
                    <td className="px-6 text-slate-600">
                      {new Date(m.joinedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMember(m)}
                        className="text-danger hover:bg-rose-50 hover:text-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-2xl overflow-hidden">
          {invitations.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">
              Chưa có lời mời nào đang chờ phản hồi.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-line text-xs uppercase tracking-wider font-semibold text-slate-500 h-12">
                    <th className="px-6">Email người nhận</th>
                    <th className="px-6">Vai trò được gán</th>
                    <th className="px-6">Thời gian gửi</th>
                    <th className="px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-sm">
                  {invitations.map((inv) => (
                    <tr key={inv.id} className="h-[64px] hover:bg-slate-50/80 transition">
                      <td className="px-6 font-semibold text-slate-900">{inv.email}</td>
                      <td className="px-6 text-slate-700">{roleLabel(inv.role)}</td>
                      <td className="px-6 text-slate-500">
                        {new Date(inv.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleResendInvite(inv)}
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Gửi lại</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-rose-50"
                            onClick={() => handleRevokeInvite(inv)}
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Thu hồi</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-line">
              <h3 className="text-lg font-bold text-slate-900">Mời thành viên mới</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <Input
                label="Email người nhận lời mời"
                type="email"
                required
                placeholder="nhanvien@doanhnghiep.vn"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Vai trò phân quyền
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TenantRole)}
                  className="w-full h-11 border border-slate-300 rounded-xl px-4 text-sm font-medium text-slate-900 bg-surface focus:outline-none focus:border-primary"
                >
                  <option value="ContractManager">Quản lý hợp đồng (Tạo mẫu & Quản lý mọi HĐ)</option>
                  <option value="Employee">Nhân viên (Soạn & quản lý HĐ cá nhân)</option>
                  <option value="TenantOwner">Chủ doanh nghiệp (Toàn quyền)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-line">
                <Button type="button" variant="secondary" size="md" onClick={() => setModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} disabled={isSubmitting}>
                  Gửi lời mời
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
