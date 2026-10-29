import { Check } from "lucide-react";
import { Wordmark } from "@/components/wordmark";

const points = [
  "Một tài khoản làm việc trên nhiều doanh nghiệp tách biệt",
  "Mời thành viên qua email, phân quyền theo vai trò",
  "Phiên đăng nhập bảo mật bằng xoay vòng refresh token",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] bg-page text-fg">
      <header className="lg:hidden h-14 bg-primary text-white px-4 flex items-center">
        <Wordmark tone="light" />
      </header>

      <aside className="hidden lg:flex flex-col justify-between bg-primary text-white p-10">
        <Wordmark tone="light" />
        <div className="max-w-[400px] motion-safe:animate-fade-up">
          <h2 className="text-xl font-semibold">Quản lý và ký hợp đồng điện tử cho doanh nghiệp</h2>
          <ul className="mt-6 flex flex-col gap-3 text-sm text-topbar-muted">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-white shrink-0" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-topbar-muted">© 2026 Chữ Tín (TrustSign) · Theo Luật Giao dịch điện tử 2023</p>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px] bg-surface border border-line rounded-md overflow-hidden motion-safe:animate-fade-up">
          {children}
        </div>
      </main>
    </div>
  );
}
