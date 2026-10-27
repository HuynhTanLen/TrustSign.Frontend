import Link from "next/link";
import { GatewayStatus } from "@/components/gateway-status";
import {
  FileSignature,
  ShieldCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  Lock,
  FileCheck2,
  Layers,
  QrCode,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-page text-fg">
      {/* Top Enterprise Header */}
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
            <Link href="/pricing" className="hover:text-primary transition-colors">
              Bảng giá dịch vụ
            </Link>
            <Link href="/verify" className="hover:text-primary transition-colors">
              Xác minh chữ ký số
            </Link>
            <Link href="/app" className="hover:text-primary transition-colors">
              Khu Doanh nghiệp (/app)
            </Link>
            <Link href="/admin" className="hover:text-primary transition-colors">
              Quản trị nền tảng (/admin)
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin" className="hidden sm:block">
            <Button variant="ghost" size="md">
              Quản trị nền tảng
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="md">
              Đăng nhập
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="md">
              Dùng thử miễn phí
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1280px] w-full mx-auto px-6 lg:px-12 py-14 lg:py-20 flex-1">
        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-light border border-indigo-200 text-primary text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Chuẩn ký số PAdES X.509 • Nhật ký bất biến SHA-256 Hash-Chain</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-slate-900 leading-[1.2] tracking-tight">
              Quản lý và ký kết hợp đồng điện tử{" "}
              <span className="text-primary">chuẩn pháp lý</span> cho doanh nghiệp Việt
            </h1>

            <p className="text-base sm:text-lg text-muted leading-relaxed max-w-[620px]">
              Khởi tạo hợp đồng từ mẫu động, phân luồng ký tuần tự nhiều bên, xác thực mã OTP qua email,
              tách chữ ký viết tay bằng thuật toán Otsu và đóng dấu chứng thư số X.509 hợp lệ trên Adobe Reader.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link href="/app">
                <Button variant="primary" size="lg">
                  <span>Trải nghiệm Không gian làm việc</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Đăng ký dùng thử 14 ngày
                </Button>
              </Link>
            </div>

            <div className="pt-4 grid grid-cols-3 gap-6 border-t border-line max-w-[540px]">
              <div>
                <p className="text-xl font-bold text-slate-900">PAdES B-T</p>
                <p className="text-xs text-muted mt-0.5">Chuẩn chữ ký số PDF</p>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">SHA-256</p>
                <p className="text-xs text-muted mt-0.5">Chuỗi băm chống sửa đổi</p>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">SePay QR</p>
                <p className="text-xs text-muted mt-0.5">Kích hoạt gói tức thì</p>
              </div>
            </div>
          </div>

          {/* Right Hero Interactive Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-surface border border-slate-200/90 rounded-2xl p-6 shadow-lg shadow-slate-900/5 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-line">
                <div>
                  <span className="text-xs font-mono text-slate-500">MÃ HỢP ĐỒNG: TS-2026-092</span>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">
                    Hợp đồng Dịch vụ Phần mềm Cloud
                  </h2>
                </div>
                <Badge contractStatus="Signing" />
              </div>

              {/* Luồng ký tuần tự */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tiến trình ký tuần tự (2 bên)
                </p>

                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Nguyễn Văn An (Bên A)</p>
                      <p className="text-xs text-slate-600">Đã ký số X.509 • 23/10/2026 09:15</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>

                <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Trần Bình Minh (Bên B)</p>
                      <p className="text-xs text-primary font-medium">Đang chờ xác thực OTP & ký tên</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary bg-surface px-2.5 py-1 rounded-lg border border-indigo-200">
                    Đến lượt
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link href="/sign/demo-token" className="flex-1">
                  <Button variant="primary" size="md" className="w-full">
                    Mở phòng ký mẫu (/sign)
                  </Button>
                </Link>
                <Link href="/verify" className="flex-1">
                  <Button variant="secondary" size="md" className="w-full">
                    Kiểm tra chữ ký (/verify)
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Trụ cột chức năng chính */}
        <div className="mb-16">
          <div className="text-center max-w-[680px] mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Quy trình khép kín từ soạn thảo đến xác thực pháp lý
            </h2>
            <p className="text-sm sm:text-base text-muted mt-2">
              Thiết kế tối ưu cho doanh nghiệp vừa và nhỏ tại Việt Nam với đầy đủ phân quyền và kiểm toán
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-line bg-surface shadow-xs hover:border-indigo-200 transition-all">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-primary flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                1. Soạn từ mẫu & Đặt ô ký
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Tự động nhận diện biến động <code>{"{{ten_bien}}"}</code> từ mẫu HTML hoặc tải file PDF, kéo thả vị trí ô ký theo tọa độ chuẩn.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-line bg-surface shadow-xs hover:border-indigo-200 transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                2. Tách chữ ký bằng Otsu
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Chụp ảnh chữ ký trên giấy, hệ thống tự động tách nền trong suốt ngay trên trình duyệt bằng thuật toán ngưỡng Otsu.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-line bg-surface shadow-xs hover:border-indigo-200 transition-all">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                3. Ký PAdES & Hash-Chain
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Xác thực người ký qua OTP 6 số, nhúng chứng thư số X.509 kèm dấu thời gian TSA và ghi nhật ký chuỗi băm SHA-256.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-line bg-surface shadow-xs hover:border-indigo-200 transition-all">
              <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-4">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                4. Thuê bao SePay VietQR
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Quản lý hạn mức hợp đồng theo tháng, thanh toán chuyển khoản VietQR tự động kích hoạt gói qua SePay Webhook.
              </p>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <GatewayStatus />
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/app" className="text-primary hover:underline">
              Mở Bảng điều khiển (/app) →
            </Link>
            <Link href="/verify" className="text-slate-600 hover:text-slate-900">
              Tra cứu hợp đồng (/verify)
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-[64px] border-t border-line bg-surface px-6 lg:px-12 flex items-center justify-between text-sm text-muted">
        <span>© 2026 Chữ Tín (TrustSign). Nền tảng ký kết hợp đồng điện tử.</span>
        <span className="hidden sm:inline">Tuân thủ Luật Giao dịch điện tử 2023</span>
      </footer>
    </div>
  );
}
