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

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] bg-page text-fg">
      <header className="lg:hidden h-16 navy-panel text-white px-4 flex items-center justify-between border-b border-white/10">
        <Wordmark tone="light" />
        <Link href="/" className="text-xs text-topbar-muted hover:text-white font-medium">
          ← Về trang chủ
        </Link>
      </header>

      <aside className="hidden lg:flex flex-col justify-between navy-panel text-white p-10 xl:p-14 relative overflow-hidden">
        <div className="relative z-10">
          <Wordmark tone="light" />
        </div>

        <div className="relative z-10 max-w-md my-auto py-10 motion-safe:animate-fade-up">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold border border-white/15 text-topbar-muted mb-4">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Hệ thống ký hợp đồng điện tử thế hệ mới
          </span>

          <h2 className="text-2xl xl:text-3xl font-bold tracking-tight leading-snug">
            Ký kết số an toàn, bảo vệ giao dịch pháp lý của bạn
          </h2>

          <div className="mt-8 flex flex-col gap-5">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.title} className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-white/10 border border-white/15 text-white shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{h.title}</p>
                    <p className="text-xs text-topbar-muted mt-0.5 leading-relaxed">{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-topbar-muted pt-6 border-t border-white/10">
          <span>© 2026 Chữ Tín (TrustSign)</span>
          <Link href="/" className="hover:text-white underline underline-offset-2">
            Về trang chủ
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-[460px] motion-safe:animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  );
}
