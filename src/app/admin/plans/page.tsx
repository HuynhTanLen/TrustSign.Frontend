"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Plus, Edit3, Power } from "lucide-react";

interface PlanItem {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  monthlyQuota: number;
  isTrial: boolean;
  isActive: boolean;
}

export default function AdminPlansPage() {
  const { toast } = useToast();
  const [plans, setPlans] = React.useState<PlanItem[]>([
    {
      id: "plan-trial",
      name: "Gói Dùng thử",
      price: 0,
      durationDays: 14,
      monthlyQuota: 5,
      isTrial: true,
      isActive: true,
    },
    {
      id: "plan-basic",
      name: "Gói Cơ bản",
      price: 299000,
      durationDays: 30,
      monthlyQuota: 20,
      isTrial: false,
      isActive: true,
    },
    {
      id: "plan-pro",
      name: "Gói Doanh nghiệp Pro",
      price: 699000,
      durationDays: 30,
      monthlyQuota: 100,
      isTrial: false,
      isActive: true,
    },
    {
      id: "plan-legacy",
      name: "Gói Khởi nghiệp 2025 (Cũ)",
      price: 199000,
      durationDays: 30,
      monthlyQuota: 10,
      isTrial: false,
      isActive: false,
    },
  ]);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<PlanItem | null>(null);
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState("299000");
  const [durationDays, setDurationDays] = React.useState("30");
  const [monthlyQuota, setMonthlyQuota] = React.useState("20");
  const [isTrial, setIsTrial] = React.useState(false);
  const [isActive, setIsActive] = React.useState(true);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName("");
    setPrice("499000");
    setDurationDays("30");
    setMonthlyQuota("50");
    setIsTrial(false);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (p: PlanItem) => {
    setEditingPlan(p);
    setName(p.name);
    setPrice(String(p.price));
    setDurationDays(String(p.durationDays));
    setMonthlyQuota(String(p.monthlyQuota));
    setIsTrial(p.isTrial);
    setIsActive(p.isActive);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: PlanItem = {
      id: editingPlan ? editingPlan.id : `plan-${Date.now()}`,
      name,
      price: Number(price) || 0,
      durationDays: Number(durationDays) || 30,
      monthlyQuota: Number(monthlyQuota) || 10,
      isTrial,
      isActive,
    };

    if (editingPlan) {
      setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? payload : p)));
      toast(`Đã cập nhật thông số "${name}"`, "success");
    } else {
      setPlans((prev) => [...prev, payload]);
      toast(`Đã tạo gói dịch vụ "${name}"`, "success");
    }
    setModalOpen(false);
  };

  const toggleActive = (plan: PlanItem) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === plan.id ? { ...p, isActive: !p.isActive } : p))
    );
    toast(
      plan.isActive
        ? `Đã ngừng bán "${plan.name}"`
        : `Đã mở bán lại "${plan.name}"`,
      "info"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Quản lý Gói dịch vụ SaaS (FE-03)
          </h1>
          <p className="text-sm text-muted mt-1">
            Thiết lập biểu phí, thời hạn chu kỳ, hạn mức hợp đồng/tháng và trạng thái mở bán trên toàn nền tảng
          </p>
        </div>
        <Button variant="primary" size="md" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          <span>Tạo gói dịch vụ mới</span>
        </Button>
      </div>

      <div className="bg-surface border border-line rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-line text-xs uppercase tracking-wider font-semibold text-slate-500 h-12">
                <th className="px-6">Tên gói dịch vụ</th>
                <th className="px-6">Đơn giá / Kỳ</th>
                <th className="px-6">Thời hạn 1 kỳ</th>
                <th className="px-6">Hạn mức HĐ / tháng</th>
                <th className="px-6">Loại gói</th>
                <th className="px-6">Trạng thái kinh doanh</th>
                <th className="px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {plans.map((p) => (
                <tr key={p.id} className="h-[64px] hover:bg-slate-50/80 transition">
                  <td className="px-6 font-bold text-slate-900">{p.name}</td>
                  <td className="px-6 font-semibold text-primary">
                    {p.price === 0 ? "Miễn phí (0 ₫)" : `${p.price.toLocaleString("vi-VN")} ₫`}
                  </td>
                  <td className="px-6 text-slate-700">{p.durationDays} ngày</td>
                  <td className="px-6 font-semibold text-slate-900">{p.monthlyQuota} hợp đồng</td>
                  <td className="px-6">
                    {p.isTrial ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-primary border border-indigo-200">
                        Gói Dùng thử
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        Gói Thương mại
                      </span>
                    )}
                  </td>
                  <td className="px-6">
                    {p.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Đang bán
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Ngừng bán
                      </span>
                    )}
                  </td>
                  <td className="px-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEditModal(p)}>
                        <Edit3 className="w-4 h-4" />
                        <span>Sửa</span>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(p)}>
                        <Power className="w-4 h-4" />
                        <span>{p.isActive ? "Ngừng bán" : "Mở bán"}</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-line">
              <h3 className="text-lg font-bold text-slate-900">
                {editingPlan ? "Chỉnh sửa Gói dịch vụ" : "Tạo Gói dịch vụ mới"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Tên gói dịch vụ"
                required
                placeholder="Ví dụ: Gói Doanh nghiệp Plus"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Giá (VNĐ / kỳ)"
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <Input
                  label="Số ngày một kỳ"
                  type="number"
                  required
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                />
                <Input
                  label="Hạn mức HĐ/tháng"
                  type="number"
                  required
                  value={monthlyQuota}
                  onChange={(e) => setMonthlyQuota(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <label className="flex items-center gap-2.5 text-sm font-medium text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrial}
                    onChange={(e) => setIsTrial(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span>Đánh dấu là Gói Dùng thử</span>
                </label>

                <label className="flex items-center gap-2.5 text-sm font-medium text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span>Cho phép mở bán công khai</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-line">
                <Button type="button" variant="secondary" size="md" onClick={() => setModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Lưu cấu hình gói
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
