"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  CreditCard,
  TrendingUp,
  Award,
  BarChart3,
  Package,
  ArrowUpRight,
} from "lucide-react";

const REVENUE_12M = [
  { month: "T11", value: "18.5tr", height: "35%" },
  { month: "T12", value: "22.0tr", height: "42%" },
  { month: "T01", value: "21.4tr", height: "40%" },
  { month: "T02", value: "25.8tr", height: "48%" },
  { month: "T03", value: "29.2tr", height: "55%" },
  { month: "T04", value: "33.5tr", height: "62%" },
  { month: "T05", value: "36.0tr", height: "68%" },
  { month: "T06", value: "41.2tr", height: "75%" },
  { month: "T07", value: "44.8tr", height: "82%" },
  { month: "T08", value: "48.1tr", height: "88%" },
  { month: "T09", value: "52.4tr", height: "94%" },
  { month: "T10", value: "56.8tr", height: "100%" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Tổng quan Quản trị Nền tảng (FE-08)
          </h1>
          <p className="text-sm text-muted mt-1">
            Số liệu vận hành toàn hệ thống SaaS Chữ Tín: Doanh nghiệp thuê bao, doanh thu SePay và chứng thư số PKI
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/plans">
            <Button variant="secondary" size="md">
              Cấu hình Gói dịch vụ
            </Button>
          </Link>
          <Link href="/admin/certificates">
            <Button variant="primary" size="md">
              Quản lý Chứng thư số CA
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards Toàn nền tảng */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-600">Tổng Doanh nghiệp</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-primary flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">128</div>
          <div className="text-sm text-emerald-600 mt-2 flex items-center gap-1.5 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>+14 doanh nghiệp mới tháng này</span>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-600">Doanh thu tháng 10</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600">56.810.000 ₫</div>
          <div className="text-sm text-slate-600 mt-2">
            98 hóa đơn thanh toán qua SePay QR
          </div>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-600">Thuê bao trả phí</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">94 / 128</div>
          <div className="text-sm text-slate-600 mt-2">
            58 Gói Cơ bản • 36 Gói Pro • 34 Dùng thử
          </div>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-600">Chứng thư X.509 đã cấp</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">412</div>
          <div className="text-sm text-slate-600 mt-2">
            409 hiệu lực • 3 đã thu hồi (CRL)
          </div>
        </div>
      </div>

      {/* Biểu đồ doanh thu 12 tháng & Phân bổ thuê bao theo gói */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-surface border border-line rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-slate-900">
                Biểu đồ Doanh thu Thuê bao 12 tháng gần nhất (VNĐ)
              </h2>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Tổng 12 tháng: 429.700.000 ₫
            </span>
          </div>

          <div className="h-52 flex items-end justify-between gap-2.5 pt-6 px-2 border-b border-line">
            {REVENUE_12M.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[11px] font-bold text-slate-600">{item.value}</span>
                <div
                  className="w-full max-w-[38px] rounded-t-lg bg-primary hover:bg-primary-hover transition-all"
                  style={{ height: item.height }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2 pt-3 text-xs font-semibold text-slate-500">
            {REVENUE_12M.map((item) => (
              <div key={item.month} className="flex-1 text-center">
                {item.month}
              </div>
            ))}
          </div>
        </div>

        {/* Thuê bao theo gói */}
        <div className="lg:col-span-4 bg-surface border border-line rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-5">
              Cơ cấu Thuê bao theo Gói cước
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold text-slate-700">Gói Cơ bản (299.000 ₫)</span>
                  <span className="font-bold text-slate-900">58 DN (45%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold text-slate-700">Gói Doanh nghiệp Pro (699.000 ₫)</span>
                  <span className="font-bold text-slate-900">36 DN (28%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "28%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold text-slate-700">Gói Dùng thử (Miễn phí 14 ngày)</span>
                  <span className="font-bold text-slate-900">34 DN (27%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "27%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-line flex items-center justify-between text-sm">
            <span className="text-muted">Quản lý danh sách công ty:</span>
            <Link href="/admin/tenants" className="text-primary font-semibold hover:underline flex items-center gap-1">
              <span>Xem 128 doanh nghiệp</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bảng doanh nghiệp mới đăng ký gần đây */}
      <div className="bg-surface border border-line rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-line flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Doanh nghiệp đăng ký & Gia hạn gần đây</h2>
          <Link href="/admin/tenants" className="text-sm font-semibold text-primary hover:underline">
            Quản lý toàn bộ Doanh nghiệp →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-line text-xs uppercase tracking-wider font-semibold text-slate-500 h-12">
                <th className="px-6">Tên doanh nghiệp</th>
                <th className="px-6">Mã số thuế</th>
                <th className="px-6">Chủ doanh nghiệp</th>
                <th className="px-6">Gói thuê bao</th>
                <th className="px-6">Trạng thái</th>
                <th className="px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              <tr className="h-[60px] hover:bg-slate-50/80">
                <td className="px-6 font-semibold text-slate-900">CTCP Giải pháp Chữ Tín</td>
                <td className="px-6 font-mono text-slate-600">0109827364</td>
                <td className="px-6 text-slate-700">an.nguyen@trustsign.vn</td>
                <td className="px-6 font-medium text-slate-900">Gói Cơ bản</td>
                <td className="px-6">
                  <Badge subscriptionStatus="Active" />
                </td>
                <td className="px-6 text-right">
                  <Link href="/admin/tenants">
                    <Button variant="secondary" size="sm">Quản lý</Button>
                  </Link>
                </td>
              </tr>
              <tr className="h-[60px] hover:bg-slate-50/80">
                <td className="px-6 font-semibold text-slate-900">Công ty TNHH Logistics Biển Đông</td>
                <td className="px-6 font-mono text-slate-600">0314891204</td>
                <td className="px-6 text-slate-700">ceo@biendonglogistics.vn</td>
                <td className="px-6 font-medium text-primary">Gói Doanh nghiệp Pro</td>
                <td className="px-6">
                  <Badge subscriptionStatus="Active" />
                </td>
                <td className="px-6 text-right">
                  <Link href="/admin/tenants">
                    <Button variant="secondary" size="sm">Quản lý</Button>
                  </Link>
                </td>
              </tr>
              <tr className="h-[60px] hover:bg-slate-50/80">
                <td className="px-6 font-semibold text-slate-900">CTCP Thương mại Sao Mai</td>
                <td className="px-6 font-mono text-slate-600">0105541920</td>
                <td className="px-6 text-slate-700">contact@saomaicorp.vn</td>
                <td className="px-6 font-medium text-slate-600">Gói Dùng thử</td>
                <td className="px-6">
                  <Badge subscriptionStatus="Trial" />
                </td>
                <td className="px-6 text-right">
                  <Link href="/admin/tenants">
                    <Button variant="secondary" size="sm">Quản lý</Button>
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
