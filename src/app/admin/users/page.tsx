"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Search, Lock, Unlock, CheckCircle2 } from "lucide-react";

interface PlatformUser {
  id: string;
  fullName: string;
  email: string;
  tenantsCount: number;
  emailVerified: boolean;
  isLocked: boolean;
  lockReason?: string;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [lockingUser, setLockingUser] = React.useState<PlatformUser | null>(null);
  const [lockReason, setLockReason] = React.useState("");

  const [users, setUsers] = React.useState<PlatformUser[]>([
    {
      id: "usr-1",
      fullName: "Nguyễn Văn An",
      email: "an.nguyen@trustsign.vn",
      tenantsCount: 2,
      emailVerified: true,
      isLocked: false,
    },
    {
      id: "usr-2",
      fullName: "Trần Thị Mai",
      email: "mai.tran@trustsign.vn",
      tenantsCount: 1,
      emailVerified: true,
      isLocked: false,
    },
    {
      id: "usr-3",
      fullName: "Lê Hoàng Long",
      email: "long.le@trustsign.vn",
      tenantsCount: 1,
      emailVerified: true,
      isLocked: false,
    },
    {
      id: "usr-4",
      fullName: "Phạm Quốc Hưng",
      email: "hung.pq@anhduonginvest.vn",
      tenantsCount: 1,
      emailVerified: true,
      isLocked: true,
      lockReason: "Nhập sai OTP và phát tán spam lời mời ký",
    },
  ]);

  const filtered = users.filter(
    (u) =>
      !query.trim() ||
      u.fullName.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  const handleConfirmLock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockingUser || !lockReason.trim()) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === lockingUser.id ? { ...u, isLocked: true, lockReason } : u
      )
    );
    toast(`Đã khóa tài khoản "${lockingUser.email}"`, "info");
    setLockingUser(null);
    setLockReason("");
  };

  const handleUnlock = (u: PlatformUser) => {
    if (confirm(`Xác nhận mở khóa tài khoản "${u.email}"?`)) {
      setUsers((prev) =>
        prev.map((item) =>
          item.id === u.id ? { ...item, isLocked: false, lockReason: undefined } : item
        )
      );
      toast(`Đã mở khóa tài khoản "${u.email}"`, "success");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Quản lý Người dùng Toàn hệ thống (FE-08)
        </h1>
        <p className="text-sm text-muted mt-1">
          Tra cứu tài khoản người dùng trên toàn nền tảng, kiểm tra xác thực email và khóa/mở khóa tài khoản
        </p>
      </div>

      <div className="p-5 bg-surface border border-line rounded-2xl shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Tìm theo họ tên hoặc địa chỉ email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 border border-slate-300 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-surface border border-line rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-line text-xs uppercase tracking-wider font-semibold text-slate-500 h-12">
                <th className="px-6">Họ và tên</th>
                <th className="px-6">Email đăng nhập</th>
                <th className="px-6">Số doanh nghiệp</th>
                <th className="px-6">Xác minh Email</th>
                <th className="px-6">Trạng thái</th>
                <th className="px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {filtered.map((u) => (
                <tr key={u.id} className="h-[68px] hover:bg-slate-50/80 transition">
                  <td className="px-6">
                    <p className="font-bold text-slate-900">{u.fullName}</p>
                    {u.lockReason && (
                      <p className="text-xs text-danger">Lý do khóa: {u.lockReason}</p>
                    )}
                  </td>
                  <td className="px-6 text-slate-700">{u.email}</td>
                  <td className="px-6 font-semibold text-slate-900">{u.tenantsCount} DN</td>
                  <td className="px-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" /> Đã xác minh
                    </span>
                  </td>
                  <td className="px-6">
                    {u.isLocked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-danger border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-danger" /> Đã khóa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="px-6 text-right">
                    {u.isLocked ? (
                      <Button variant="secondary" size="sm" onClick={() => handleUnlock(u)}>
                        <Unlock className="w-4 h-4 text-emerald-600" />
                        <span>Mở khóa</span>
                      </Button>
                    ) : (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setLockingUser(u);
                          setLockReason("");
                        }}
                      >
                        <Lock className="w-4 h-4" />
                        <span>Khóa TK</span>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {lockingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5">
            <div className="pb-3 border-b border-line">
              <h3 className="text-lg font-bold text-slate-900">
                Xác nhận khóa Tài khoản Người dùng
              </h3>
              <p className="text-sm text-muted mt-1">
                Tài khoản <strong>{lockingUser.email}</strong> sẽ không thể đăng nhập vào hệ thống.
              </p>
            </div>

            <form onSubmit={handleConfirmLock} className="space-y-4">
              <Input
                label="Lý do khóa tài khoản (bắt buộc)"
                required
                placeholder="Nhập lý do khóa tài khoản..."
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-line">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setLockingUser(null)}
                >
                  Hủy
                </Button>
                <Button type="submit" variant="danger" size="md">
                  Xác nhận khóa
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
