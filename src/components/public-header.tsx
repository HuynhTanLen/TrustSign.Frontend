import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";

/** Thanh trên màu navy của khu công khai ở mốc M1: logo, Đăng nhập và Đăng ký. */
export function PublicHeader() {
  return (
    <header className="h-14 bg-primary text-white sticky top-0 z-30">
      <div className="h-full max-w-content mx-auto px-4 lg:px-6 flex items-center justify-between gap-4">
        <Wordmark tone="light" />
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="inline-flex px-3 h-control items-center rounded-md text-sm font-semibold text-white hover:bg-topbar-hover"
          >
            Đăng nhập
          </Link>
          <Link href="/register">
            <Button variant="inverse">Đăng ký</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

const footerColumns = [
  {
    title: "Tài khoản",
    links: [
      { href: "/login", label: "Đăng nhập" },
      { href: "/register", label: "Đăng ký tài khoản" },
    ],
  },
  {
    title: "Không gian làm việc",
    links: [
      { href: "/app", label: "Khu doanh nghiệp" },
      { href: "/onboarding", label: "Tạo doanh nghiệp" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="bg-surface border-t border-line">
      <div className="max-w-content mx-auto px-4 lg:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div className="col-span-2">
          <Wordmark />
          <p className="mt-2 max-w-[360px] text-muted">
            Nền tảng quản lý và ký hợp đồng điện tử cho doanh nghiệp vừa và nhỏ. Tuân thủ Luật Giao dịch điện tử 2023.
          </p>
        </div>
        {footerColumns.map((col) => (
          <div key={col.title}>
            <p className="font-semibold text-fg">{col.title}</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-primary underline underline-offset-2 hover:text-primary-hover">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="max-w-content mx-auto px-4 lg:px-6 py-3 text-xs text-muted">
          © 2026 Chữ Tín (TrustSign)
        </div>
      </div>
    </footer>
  );
}
