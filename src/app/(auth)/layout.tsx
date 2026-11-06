import Link from "next/link";
import { CheckCircle2, QrCode, ShieldCheck, Users } from "lucide-react";
import { Wordmark } from "@/components/wordmark";

const highlights = [
  {
    icon: Users,
    title: "Đa doanh nghiệp & Phân quyền",
    desc: "Một tài khoản quản lý và tham gia nhiều không gian pháp nhân tách biệt an toàn.",
  },
  {
    icon: ShieldCheck,
    title: "Bảo mật & Pháp lý chuẩn mực",
    desc: "Phiên đăng nhập xoay vòng refresh token cùng chuẩn ký số PAdES bất biến.",
  },
  {
    icon: QrCode,
    title: "Tự động kích hoạt gói",
    desc: "Tự động nhận 14 ngày dùng thử miễn phí khi tạo doanh nghiệp đầu tiên.",
  },
];

/**
 * AuthLayout — Phong cách Clean Bright Minimalist (Stripe & Notion Light).
 * Toàn bộ 2 bên đều là nền sáng ngà / xám nhạt cao cấp, loại bỏ hoàn toàn mảng nền đen tối ngột ngạt.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] bg-[#f8fafc] text-fg">
      {/* Mobile Top Header (Clean Light) */}
      <header className="lg:hidden h-16 bg-white px-4 flex items-center justify-between border-b border-slate-200 shadow-2xs">
        <Wordmark tone="dark" />
        <Link
          href="/"
          className="text-xs text-slate-600 hover:text-slate-900 font-bold transition-colors"
        >
          ← Về trang chủ
        </Link>
      </header>

      {/* Desktop Left Brand & Showcase Panel (Clean Bright Soft Gray/Blue Wash) */}
      <aside className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-white via-slate-50 to-blue-50/20 p-10 xl:p-14 relative overflow-hidden border-r border-slate-200/80">
        {/* Soft subtle radial ambient light */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative z-10">
          <Wordmark tone="dark" />
        </div>

        <div className="relative z-10 max-w-md my-auto py-8 motion-safe:animate-fade-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs font-bold border border-blue-200/80 text-blue-700 mb-5 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Nền tảng Ký kết Số Pháp lý Thế hệ mới</span>
          </div>

          <h2 className="text-2xl xl:text-3xl font-black tracking-tight leading-snug text-slate-900">
            Ký kết số an toàn, bảo vệ giao dịch pháp lý của bạn
          </h2>

          <div className="mt-8 flex flex-col gap-3.5">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div
                  key={h.title}
                  className="group bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-blue-200 flex items-start gap-3.5"
                >
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-105">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {h.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {h.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-200">
          <span>© 2026 Chữ Tín (TrustSign)</span>
          <Link
            href="/"
            className="text-slate-600 hover:text-slate-900 font-semibold underline underline-offset-2 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </aside>

      {/* Right Login / Register Form Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 relative bg-[#f8fafc]">
        <div className="w-full max-w-[460px] motion-safe:animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  );
}
