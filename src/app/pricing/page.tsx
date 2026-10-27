import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, FileSignature, ShieldCheck, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-page text-fg">
      <header className="h-[72px] border-b border-line bg-surface/95 backdrop-blur-sm px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-base shadow-sm shadow-indigo-500/20">
              <FileSignature className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900 leading-tight">
                Chữ Tín <span className="text-primary font-semibold">TrustSign</span>
              </span>
              <span className="text-[11px] text-muted font-medium">
                Nền tảng hợp đồng điện tử doanh nghiệp
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <Link href="/pricing" className="text-primary">
              Bảng giá dịch vụ
            </Link>
            <Link href="/verify" className="hover:text-primary transition-colors">
              Xác minh chữ ký số
            </Link>
            <Link href="/app" className="hover:text-primary transition-colors">
              Bảng điều khiển
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="secondary" size="md">
              Đăng nhập
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="md">
              Đăng ký tài khoản
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-[1200px] w-full mx-auto px-6 lg:px-12 py-16 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-[680px] mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-light px-3.5 py-1.5 rounded-full border border-indigo-200">
            <ShieldCheck className="w-4 h-4" />
            Bảng giá minh bạch cho SMEs
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-4 mb-3">
            Chọn gói dịch vụ phù hợp quy mô doanh nghiệp
          </h1>
          <p className="text-base text-muted">
            Không phí ẩn, không giới hạn số trang mỗi hợp đồng. Kích hoạt tự động 24/7 qua mã VietQR SePay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-[1100px] mx-auto w-full">
          {/* Gói Dùng thử */}
          <div className="bg-surface border border-line rounded-2xl p-7 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Gói Dùng thử</h2>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Miễn phí
                </span>
              </div>
              <p className="text-sm text-muted mt-1.5">Dành cho doanh nghiệp mới khởi tạo và đánh giá hệ thống</p>
              <div className="mt-6 mb-6 pb-6 border-b border-line">
                <span className="text-4xl font-bold text-slate-900">0 ₫</span>
                <span className="text-sm text-muted ml-2">/ 14 ngày</span>
              </div>
              <ul className="text-sm text-slate-700 space-y-3.5">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span><strong>5 hợp đồng gửi ký</strong> miễn phí</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Tối đa 5 người ký mỗi hợp đồng</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Ký số PAdES chuẩn chứng thư X.509</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Tách chữ ký từ ảnh chụp (Otsu)</span>
                </li>
              </ul>
            </div>
            <Link href="/register" className="mt-8 block">
              <Button variant="secondary" size="lg" className="w-full">
                Bắt đầu dùng thử
              </Button>
            </Link>
          </div>

          {/* Gói Cơ bản */}
          <div className="bg-surface border-2 border-primary rounded-2xl p-7 flex flex-col justify-between shadow-lg shadow-indigo-500/10 relative">
            <span className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-sm">
              Phổ biến nhất
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Gói Cơ bản</h2>
              <p className="text-sm text-muted mt-1.5">Dành cho hộ kinh doanh và doanh nghiệp vừa & nhỏ</p>
              <div className="mt-6 mb-6 pb-6 border-b border-line">
                <span className="text-4xl font-bold text-slate-900">299.000 ₫</span>
                <span className="text-sm text-muted ml-2">/ 30 ngày</span>
              </div>
              <ul className="text-sm text-slate-700 space-y-3.5">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span><strong>20 hợp đồng gửi ký</strong> mỗi tháng</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Tối đa 5 người ký tuần tự</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Soạn thảo hợp đồng từ mẫu động HTML</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Xác thực mã OTP 6 số qua thư điện tử</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Lưu trữ và tra cứu chuỗi băm SHA-256</span>
                </li>
              </ul>
            </div>
            <Link href="/app/billing" className="mt-8 block">
              <Button variant="primary" size="lg" className="w-full">
                <span>Chọn gói Cơ bản</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Gói Doanh nghiệp */}
          <div className="bg-surface border border-line rounded-2xl p-7 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Gói Doanh nghiệp Pro</h2>
              <p className="text-sm text-muted mt-1.5">Tối ưu cho doanh nghiệp có tần suất ký kết cao</p>
              <div className="mt-6 mb-6 pb-6 border-b border-line">
                <span className="text-4xl font-bold text-primary">699.000 ₫</span>
                <span className="text-sm text-muted ml-2">/ 30 ngày</span>
              </div>
              <ul className="text-sm text-slate-700 space-y-3.5">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span><strong>100 hợp đồng gửi ký</strong> mỗi tháng</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Không giới hạn số lượng thành viên</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Đóng dấu thời gian chuẩn RFC 3161 (TSA)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Phân quyền Quản lý & Nhân viên chuyên sâu</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Xuất hóa đơn PDF thanh toán tự động</span>
                </li>
              </ul>
            </div>
            <Link href="/app/billing" className="mt-8 block">
              <Button variant="secondary" size="lg" className="w-full">
                Chọn gói Doanh nghiệp Pro
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="h-[64px] border-t border-line bg-surface px-6 lg:px-12 flex items-center justify-between text-sm text-muted">
        <span>© 2026 Chữ Tín (TrustSign)</span>
        <span>Hệ thống ký kết hợp đồng điện tử doanh nghiệp</span>
      </footer>
    </div>
  );
}
