"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  PieChart,
} from "lucide-react";

const MONTHLY_STATS = [
  { month: "T05", count: 18, height: "42%" },
  { month: "T06", count: 24, height: "56%" },
  { month: "T07", count: 21, height: "49%" },
  { month: "T08", count: 32, height: "74%" },
  { month: "T09", count: 38, height: "86%" },
  { month: "T10", count: 48, height: "100%" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-7">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Bảng điều khiển
          </h1>
          <p className="text-sm text-muted mt-1">
            Tổng quan tình hình ký kết hợp đồng và hạn mức thuê bao tháng 10/2026
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/app/contracts">
            <Button variant="secondary" size="md">
              Xem danh sách hợp đồng
            </Button>
          </Link>
          <Link href="/app/contracts/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              <span>Tạo hợp đồng mới</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Thẻ số liệu KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between text-muted mb-3">
            <span className="text-sm font-semibold text-slate-600">Tổng hợp đồng</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-primary flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">48</div>
          <div className="text-sm text-emerald-600 mt-2 flex items-center gap-1.5 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>+12% so với tháng trước</span>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between text-muted mb-3">
            <span className="text-sm font-semibold text-slate-600">Đang chờ ký</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-amber-600">5</div>
          <div className="text-sm text-slate-600 mt-2">
            2 hợp đồng cần ký trong 24 giờ tới
          </div>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between text-muted mb-3">
            <span className="text-sm font-semibold text-slate-600">Hoàn tất tháng 10</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600">24</div>
          <div className="text-sm text-slate-600 mt-2">
            Tỉ lệ hoàn tất đúng hạn đạt 92%
          </div>
        </div>

        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="font-semibold text-slate-600">Hạn mức gửi ký</span>
              <span className="font-bold text-slate-900">18 / 20 HĐ</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 my-2.5 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: "90%" }} />
            </div>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-slate-600 font-medium">Còn 2 lượt gửi</span>
            <Link href="/app/billing" className="text-primary hover:underline font-semibold">
              Gia hạn gói →
            </Link>
          </div>
        </div>
      </div>

      {/* Khối biểu đồ thống kê (FE-08) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Biểu đồ cột 6 tháng */}
        <div className="lg:col-span-7 bg-surface border border-line rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-slate-900">
                Số lượng hợp đồng phát hành (6 tháng gần nhất)
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Năm 2026
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-4 pt-6 px-2 border-b border-line">
            {MONTHLY_STATS.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-bold text-slate-700">{item.count}</span>
                <div
                  className="w-full max-w-[48px] rounded-t-lg bg-primary hover:bg-primary-hover transition-all"
                  style={{ height: item.height }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between px-2 pt-3 text-xs font-semibold text-slate-500">
            {MONTHLY_STATS.map((item) => (
              <div key={item.month} className="flex-1 text-center">
                {item.month}/2026
              </div>
            ))}
          </div>
        </div>

        {/* Biểu đồ tỷ lệ trạng thái */}
        <div className="lg:col-span-5 bg-surface border border-line rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <PieChart className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-slate-900">
                Phân bổ theo trạng thái hợp đồng
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Hoàn tất (Đã đóng dấu X.509)
                  </span>
                  <span className="font-bold text-slate-900">34 HĐ (71%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "71%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Đang ký & Chờ ký
                  </span>
                  <span className="font-bold text-slate-900">8 HĐ (17%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "17%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Bản nháp
                  </span>
                  <span className="font-bold text-slate-900">4 HĐ (8%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: "8%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Từ chối / Hết hạn
                  </span>
                  <span className="font-bold text-slate-900">2 HĐ (4%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: "4%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-line flex items-center justify-between text-sm">
            <span className="text-muted">Chuỗi nhật ký sự kiện:</span>
            <Link href="/verify" className="text-primary font-semibold hover:underline">
              Kiểm tra toàn vẹn SHA-256 →
            </Link>
          </div>
        </div>
      </div>

      {/* Bảng hợp đồng sắp hết hạn ký */}
      <div className="bg-surface border border-line rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Hợp đồng cần xử lý & sắp hết hạn</h2>
          </div>
          <Link
            href="/app/contracts"
            className="text-sm text-primary hover:underline font-semibold flex items-center gap-1"
          >
            <span>Xem toàn bộ hợp đồng</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-line text-xs uppercase tracking-wider font-semibold text-slate-500 h-12">
                <th className="px-6">Mã hợp đồng</th>
                <th className="px-6">Tên hợp đồng</th>
                <th className="px-6">Người ký hiện tại</th>
                <th className="px-6">Trạng thái</th>
                <th className="px-6">Hạn ký</th>
                <th className="px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              <tr className="h-[60px] hover:bg-slate-50/80 transition-colors">
                <td className="px-6 font-mono font-medium text-slate-600">TS-2026-092</td>
                <td className="px-6 font-semibold text-slate-900">Hợp đồng Cung cấp Dịch vụ Cloud</td>
                <td className="px-6 text-slate-600">Trần Thị Mai (Bên B - Lượt 1/2)</td>
                <td className="px-6">
                  <Badge contractStatus="Pending" />
                </td>
                <td className="px-6 text-danger font-semibold">Hôm nay 17:00</td>
                <td className="px-6 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link href="/sign/TS-2026-092">
                      <Button variant="primary" size="sm">
                        Ký ngay
                      </Button>
                    </Link>
                    <Link href="/app/contracts/TS-2026-092">
                      <Button variant="secondary" size="sm">
                        Chi tiết
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
              <tr className="h-[60px] hover:bg-slate-50/80 transition-colors">
                <td className="px-6 font-mono font-medium text-slate-600">TS-2026-088</td>
                <td className="px-6 font-semibold text-slate-900">Thỏa thuận Bảo mật Thông tin NDA</td>
                <td className="px-6 text-slate-600">Lê Hoàng Long (Bên B - Lượt 2/2)</td>
                <td className="px-6">
                  <Badge contractStatus="Signing" />
                </td>
                <td className="px-6 text-slate-700">24/10/2026 12:00</td>
                <td className="px-6 text-right">
                  <Link href="/app/contracts/TS-2026-088">
                    <Button variant="secondary" size="sm">
                      Chi tiết
                    </Button>
                  </Link>
                </td>
              </tr>
              <tr className="h-[60px] hover:bg-slate-50/80 transition-colors">
                <td className="px-6 font-mono font-medium text-slate-600">TS-2026-075</td>
                <td className="px-6 font-semibold text-slate-900">Hợp đồng Thuê Địa điểm Văn phòng</td>
                <td className="px-6 text-slate-600">Công ty Cổ phần Hòa Bình</td>
                <td className="px-6">
                  <Badge contractStatus="Completed" />
                </td>
                <td className="px-6 text-slate-700">22/10/2026</td>
                <td className="px-6 text-right">
                  <Link href="/app/contracts/TS-2026-075">
                    <Button variant="secondary" size="sm">
                      Xem bản đã ký
                    </Button>
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
