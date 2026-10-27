"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Search, Lock, Unlock, Building2 } from "lucide-react";

interface TenantRecord {
  id: string;
  name: string;
  taxCode: string;
  ownerEmail: string;
  planName: string;
  membersCount: number;
  isLocked: boolean;
  lockReason?: string;
}

export default function AdminTenantsPage() {
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [lockingTenant, setLockingTenant] = React.useState<TenantRecord | null>(null);
  const [lockReason, setLockReason] = React.useState("");

  const [tenants, setTenants] = React.useState<TenantRecord[]>([
    {
      id: "tn-1",
      name: "CTCP Giải pháp Chữ Tín",
      taxCode: "0109827364",
      ownerEmail: "an.nguyen@trustsign.vn",
      planName: "Gói Cơ bản",
      membersCount: 8,
      isLocked: false,
    },
    {
      id: "tn-2",
      name: "Công ty TNHH Logistics Biển Đông",
      taxCode: "0314891204",
      ownerEmail: "ceo@biendonglogistics.vn",
      planName: "Gói Doanh nghiệp Pro",
      membersCount: 24,
      isLocked: false,
    },
    {
      id: "tn-3",
      name: "CTCP Thương mại Sao Mai",
      taxCode: "0105541920",
      ownerEmail: "contact@saomaicorp.vn",
      planName: "Gói Dùng thử",
      membersCount: 3,
      isLocked: false,
    },
    {
      id: "tn-4",
      name: "Công ty TNHH Đầu tư Ánh Dương",
      taxCode: "0108872109",
      ownerEmail: "admin@anhduonginvest.vn",
      planName: "Gói Cơ bản",
      membersCount: 5,
      isLocked: true,
      lockReason: "Vi phạm điều khoản sử dụng dịch vụ chữ ký số",
    },
  ]);

  const filtered = tenants.filter(
    (t) =>
      !query.trim() ||
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.taxCode.includes(query) ||
      t.ownerEmail.toLowerCase().includes(query.toLowerCase())
  );

  const handleConfirmLock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockingTenant || !lockReason.trim()) return;

    setTenants((prev) =>
      prev.map((t) =>
        t.id === lockingTenant.id ? { ...t, isLocked: true, lockReason } : t
      )
    );
    toast(`Đã khóa doanh nghiệp "${lockingTenant.name}"`, "info");
    setLockingTenant(null);
    setLockReason("");
  };

  const handleUnlock = (t: TenantRecord) => {
    if (confirm(`Xác nhận mở khóa doanh nghiệp "${t.name}"?`)) {
      setTenants((prev) =>
        prev.map((item) =>
          item.id === t.id ? { ...item, isLocked: false, lockReason: undefined } : item
        )
      );
      toast(`Đã mở khóa doanh nghiệp "${t.name}"`, "success");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Quản lý Doanh nghiệp Thuê bao (FE-08)
        </h1>
        <p className="text-sm text-muted mt-1">
          Tra cứu các doanh nghiệp (Tenants) trên toàn nền tảng, kiểm tra gói thuê bao và khóa/mở khóa quyền truy cập
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-5 bg-surface border border-line rounded-2xl shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Tìm theo tên công ty, mã số thuế hoặc email chủ DN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 border border-slate-300 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-line rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-line text-xs uppercase tracking-wider font-semibold text-slate-500 h-12">
                <th className="px-6">Doanh nghiệp</th>
                <th className="px-6">Mã số thuế</th>
                <th className="px-6">Chủ sở hữu</th>
                <th className="px-6">Gói hiện tại</th>
                <th className="px-6">Thành viên</th>
                <th className="px-6">Trạng thái</th>
                <th className="px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {filtered.map((t) => (
                <tr key={t.id} className="h-[68px] hover:bg-slate-50/80 transition">
                  <td className="px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-primary flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{t.name}</p>
                        {t.lockReason && (
                          <p className="text-xs text-danger">Lý do khóa: {t.lockReason}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 font-mono text-slate-600">{t.taxCode}</td>
                  <td className="px-6 text-slate-700">{t.ownerEmail}</td>
                  <td className="px-6 font-semibold text-slate-900">{t.planName}</td>
                  <td className="px-6 text-slate-700">{t.membersCount} người</td>
                  <td className="px-6">
                    {t.isLocked ? (
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
                    {t.isLocked ? (
                      <Button variant="secondary" size="sm" onClick={() => handleUnlock(t)}>
                        <Unlock className="w-4 h-4 text-emerald-600" />
                        <span>Mở khóa</span>
                      </Button>
                    ) : (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setLockingTenant(t);
                          setLockReason("");
                        }}
                      >
                        <Lock className="w-4 h-4" />
                        <span>Khóa DN</span>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hộp thoại xác nhận khóa Doanh nghiệp kèm lý do */}
      {lockingTenant && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5">
            <div className="pb-3 border-b border-line">
              <h3 className="text-lg font-bold text-slate-900">
                Xác nhận khóa Doanh nghiệp
              </h3>
              <p className="text-sm text-muted mt-1">
                Doanh nghiệp <strong>{lockingTenant.name}</strong> sẽ bị tạm dừng phát hành và ký kết hợp đồng mới.
              </p>
            </div>

            <form onSubmit={handleConfirmLock} className="space-y-4">
              <Input
                label="Lý do khóa doanh nghiệp (bắt buộc)"
                required
                placeholder="Nhập lý do vi phạm hoặc yêu cầu tạm ngưng..."
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-line">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setLockingTenant(null)}
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
