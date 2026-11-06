"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, X } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { tryRestoreSession } from "@/lib/api";

const publicNav = [
  { href: "/#features", label: "Tính năng" },
  { href: "/#workflow", label: "Quy trình" },
  { href: "/pricing", label: "Bảng giá" },
  { href: "/#faq", label: "Hỏi đáp" },
];

/** Floating Pill Navbar phong cách Enterprise FinTech sạch sẽ, sang trọng (không màu neon). */
export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [signedIn, setSignedIn] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    tryRestoreSession().then((ok) => alive && setSignedIn(ok));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <header className="sticky top-3 z-40 px-4 sm:px-6 w-full max-w-5xl mx-auto">
      <div className="h-14 sm:h-15 px-4 sm:px-6 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-7">
          <Wordmark />
          <nav className="hidden md:flex items-center gap-1" aria-label="Điều hướng chính">
            {publicNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
                    active
                      ? "bg-slate-100 text-blue-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden sm:flex items-center gap-2.5">
          {signedIn ? (
            <Link href="/app">
              <Button variant="primary" size="sm" className="rounded-full shadow-xs">
                Vào ứng dụng
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="rounded-full shadow-xs">
                  Dùng thử 14 ngày
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          className="sm:hidden inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="sm:hidden mt-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 flex flex-col gap-2 shadow-lg motion-safe:animate-drop-in">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-blue-700 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          {signedIn ? (
            <Link href="/app" onClick={() => setMobileOpen(false)} className="pt-2 mt-1 border-t border-slate-100">
              <Button variant="primary" className="w-full rounded-lg">
                Vào ứng dụng
              </Button>
            </Link>
          ) : (
            <div className="pt-2 mt-1 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" size="sm" className="w-full rounded-lg">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="sm" className="w-full rounded-lg">
                  Dùng thử
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

const footerColumns = [
  {
    title: "Sản phẩm & Gói cước",
    links: [
      { href: "/#features", label: "Tính năng cốt lõi" },
      { href: "/#workflow", label: "Quy trình ký kết" },
      { href: "/pricing", label: "Bảng giá thuê bao" },
    ],
  },
  {
    title: "Không gian doanh nghiệp",
    links: [
      { href: "/app", label: "Tổng quan doanh nghiệp" },
      { href: "/app/billing", label: "Gói & Thanh toán VietQR" },
      { href: "/onboarding", label: "Khởi tạo pháp nhân mới" },
    ],
  },
  {
    title: "Tài khoản",
    links: [
      { href: "/login", label: "Đăng nhập hệ thống" },
      { href: "/register", label: "Đăng ký dùng thử 14 ngày" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-content mx-auto px-4 lg:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-sm">
        <div className="lg:col-span-2">
          <Wordmark />
          <p className="mt-3.5 max-w-[360px] text-muted leading-relaxed">
            Nền tảng quản lý không gian pháp nhân, phân quyền nhân sự và ký kết hợp đồng điện tử chuẩn số PAdES dành cho doanh nghiệp Việt Nam.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700 shrink-0" aria-hidden="true" />
            Tuân thủ Luật Giao dịch điện tử 2023
          </div>
        </div>
        {footerColumns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">{col.title}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted hover:text-blue-700 font-medium transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-content mx-auto px-4 lg:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted font-medium">
          <span>© 2026 Chữ Tín (TrustSign) · Hệ thống ký hợp đồng điện tử doanh nghiệp chuẩn quốc gia.</span>
          <span>Bảo mật PAdES · Xác thực OTP · Đối soát VietQR tự động</span>
        </div>
      </div>
    </footer>
  );
}
