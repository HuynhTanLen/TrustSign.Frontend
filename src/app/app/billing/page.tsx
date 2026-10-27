"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { CreditCard, Check, Download, Copy, Clock, AlertTriangle } from "lucide-react";

const INVOICES = [
  {
    code: "INV-2026-1089",
    plan: "Gói Cơ bản (30 ngày)",
    amount: "299.000 ₫",
    status: "Paid",
    createdAt: "28/09/2026 10:15",
  },
  {
    code: "INV-2026-0912",
    plan: "Gói Cơ bản (30 ngày)",
    amount: "299.000 ₫",
    status: "Paid",
    createdAt: "28/08/2026 09:30",
  },
  {
    code: "INV-2026-0801",
    plan: "Gói Dùng thử (14 ngày)",
    amount: "0 ₫",
    status: "Paid",
    createdAt: "14/08/2026 14:20",
  },
];

export default function BillingPage() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState("Gói Cơ bản");
  const [selectedPrice, setSelectedPrice] = React.useState(299000);

  const openCheckout = (name: string, price: number) => {
    setSelectedPlan(name);
    setSelectedPrice(price);
    setModalOpen(true);
  };

  const handleSimulatePayment = () => {
    setModalOpen(false);
    toast("SePay Webhook: Xác nhận thanh toán thành công! Đã cộng hạn mức thuê bao.", "success");
  };

  const copyText = (value: string, label: string) => {
    navigator.clipboard?.writeText(value);
    toast(`Đã sao chép ${label}: ${value}`, "info");
  };

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Gói Dịch Vụ & Thanh Toán SePay (FE-03)
        </h1>
        <p className="text-sm text-muted mt-1">
          Quản lý hạn mức hợp đồng hàng tháng và thanh toán tự động qua mã VietQR SePay
        </p>
      </div>

      {/* Thẻ Gói của tôi */}
      <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-primary flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-bold text-lg text-slate-900">
                  Gói Cơ Bản (Doanh Nghiệp Vừa & Nhỏ)
                </span>
                <Badge subscriptionStatus="Active" />
              </div>
              <p className="text-sm text-muted mt-1">
                Ngày hết hạn: <strong className="text-slate-900">28/10/2026</strong> (Còn 5 ngày)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-500">Cước phí định kỳ</span>
              <p className="text-2xl font-bold text-slate-900">
                299.000 ₫ <span className="text-sm font-normal text-slate-500">/ 30 ngày</span>
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => openCheckout("Gói Cơ bản", 299000)}
            >
              Gia hạn ngay
            </Button>
          </div>
        </div>

        <div>
          <div className="text-sm text-slate-700 flex justify-between mb-2 font-semibold">
            <span>Hạn mức hợp đồng gửi ký trong tháng 10/2026:</span>
            <span className="text-slate-900">Đã dùng 18 / 20 hợp đồng (90%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-3">
            <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: "90%" }} />
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-sm text-amber-900">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                Thuê bao còn dưới 7 ngày và chỉ còn <strong>2 lượt gửi ký</strong>. Vui lòng gia hạn hoặc nâng cấp gói.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng giá 3 gói */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Các gói dịch vụ nâng cấp</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col justify-between shadow-xs">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Gói Dùng thử</h3>
              <p className="text-sm text-muted mt-1">Dành cho trải nghiệm khởi tạo</p>
              <div className="text-3xl font-bold text-slate-900 my-5">
                0 ₫ <span className="text-sm text-slate-500 font-normal">/ 14 ngày</span>
              </div>
              <ul className="text-sm text-slate-700 space-y-3">
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>5 hợp đồng gửi ký</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Ký số PAdES chuẩn X.509</span>
                </li>
              </ul>
            </div>
            <Button variant="secondary" size="md" className="w-full mt-6" disabled>
              Đã sử dụng
            </Button>
          </div>

          <div className="bg-surface border-2 border-primary rounded-2xl p-6 flex flex-col justify-between shadow-md relative">
            <span className="absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-xs">
              Đang sử dụng
            </span>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Gói Cơ bản</h3>
              <p className="text-sm text-muted mt-1">Hộ kinh doanh và doanh nghiệp nhỏ</p>
              <div className="text-3xl font-bold text-slate-900 my-5">
                299.000 ₫ <span className="text-sm text-slate-500 font-normal">/ 30 ngày</span>
              </div>
              <ul className="text-sm text-slate-700 space-y-3">
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span><strong>20 hợp đồng gửi ký</strong> / tháng</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Tối đa 5 người ký tuần tự</span>
                </li>
              </ul>
            </div>
            <Button
              variant="primary"
              size="md"
              className="w-full mt-6"
              onClick={() => openCheckout("Gói Cơ bản", 299000)}
            >
              Gia hạn gói này (VietQR)
            </Button>
          </div>

          <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Gói Doanh nghiệp Pro</h3>
              <p className="text-sm text-muted mt-1">Doanh nghiệp có nhu cầu ký kết lớn</p>
              <div className="text-3xl font-bold text-primary my-5">
                699.000 ₫ <span className="text-sm text-slate-500 font-normal">/ 30 ngày</span>
              </div>
              <ul className="text-sm text-slate-700 space-y-3">
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span><strong>100 hợp đồng gửi ký</strong> / tháng</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Không giới hạn số lượng thành viên</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Dấu thời gian TSA FreeTSA</span>
                </li>
              </ul>
            </div>
            <Button
              variant="primary"
              size="md"
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 border-slate-900"
              onClick={() => openCheckout("Gói Doanh nghiệp Pro", 699000)}
            >
              Nâng cấp lên Pro
            </Button>
          </div>
        </div>
      </div>

      {/* Bảng lịch sử hóa đơn */}
      <div className="bg-surface border border-line rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-line">
          <h2 className="text-lg font-bold text-slate-900">Lịch sử hóa đơn thanh toán</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-line text-xs uppercase tracking-wider font-semibold text-slate-500 h-12">
                <th className="px-6">Mã hóa đơn</th>
                <th className="px-6">Gói dịch vụ</th>
                <th className="px-6">Số tiền</th>
                <th className="px-6">Trạng thái</th>
                <th className="px-6">Ngày thanh toán</th>
                <th className="px-6 text-right">Hóa đơn PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {INVOICES.map((inv) => (
                <tr key={inv.code} className="h-[60px] hover:bg-slate-50/80 transition">
                  <td className="px-6 font-mono font-semibold text-slate-700">{inv.code}</td>
                  <td className="px-6 font-medium text-slate-900">{inv.plan}</td>
                  <td className="px-6 font-bold text-slate-900">{inv.amount}</td>
                  <td className="px-6">
                    <Badge subscriptionStatus="Active">Đã thanh toán</Badge>
                  </td>
                  <td className="px-6 text-slate-600">{inv.createdAt}</td>
                  <td className="px-6 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toast(`Đang tải hóa đơn ${inv.code}.pdf`, "info")}
                    >
                      <Download className="w-4 h-4" />
                      <span>Tải PDF</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal thanh toán SePay VietQR */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-xl text-sm space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-line">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Thanh toán VietQR SePay</h3>
                <p className="text-sm text-primary font-semibold mt-0.5">{selectedPlan}</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-center">
              <div className="w-44 h-44 mx-auto border border-line rounded-2xl p-3 flex flex-col items-center justify-center bg-slate-50 shadow-2xs">
                <svg className="w-32 h-32" viewBox="0 0 100 100" fill="#0f172a">
                  <path d="M0 0h30v30H0zM40 0h10v10H40zM60 0h10v10H60zM70 0h30v30H70zM10 10h10v10H10zM80 10h10v10H80zM0 40h10v10H0zM20 40h20v20H20zM50 40h10v10H50zM70 40h20v10H70zM0 70h30v30H0zM10 80h10v10H10zM40 70h10v20H40zM60 70h10v10H60zM80 70h10v30H80zM90 90h10v10H90z" />
                </svg>
                <span className="text-xs font-mono font-semibold text-slate-600 mt-1">
                  SePay Auto-Webhook QR
                </span>
              </div>
              <p className="text-xs text-muted mt-2 flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Đang tự động kiểm tra trạng thái mỗi 5 giây (Còn 14:52)</span>
              </p>
            </div>

            <div className="space-y-2.5 p-4 rounded-xl border border-line bg-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Ngân hàng:</span>
                <span className="font-bold text-slate-900">VietinBank (NH Công Thương)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Số tài khoản:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">102874910283</span>
                  <button
                    onClick={() => copyText("102874910283", "số tài khoản")}
                    className="text-primary hover:underline text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Chép
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Số tiền:</span>
                <span className="font-bold text-emerald-600 text-base">
                  {selectedPrice.toLocaleString("vi-VN")} ₫
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nội dung bắt buộc:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    TS98214
                  </span>
                  <button
                    onClick={() => copyText("TS98214", "mã hóa đơn")}
                    className="text-primary hover:underline text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Chép
                  </button>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
              onClick={handleSimulatePayment}
            >
              Mô phỏng SePay Webhook: Đã thanh toán
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
