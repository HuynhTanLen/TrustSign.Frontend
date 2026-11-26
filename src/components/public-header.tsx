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
  { href: "/verify", label: "Xác minh" },
  { href: "/#faq", label: "Hỏi đáp" },
];

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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E6E4DC]">
      <div className="max-w-content mx-auto h-16 px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Wordmark />
          <nav className="hidden md:flex items-center gap-1" aria-label="Điều hướng chính">
            {publicNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[#EFF5E8] text-[#1B4332]"
                      : "text-[#2E3B33] hover:text-[#1A2922] hover:bg-[#F5F4EF]"
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
              <Button variant="primary" size="sm" className="rounded-md shadow-xs">
                Vào ứng dụng
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-md text-[#1A2922]">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="rounded-md shadow-xs">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-md bg-[#F5F4EF] border border-[#E6E4DC] text-[#1A2922] hover:bg-[#EFF5E8] transition-colors cursor-pointer"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="sm:hidden border-t border-[#E6E4DC] bg-white px-4 py-4 flex flex-col gap-1.5 shadow-md">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-semibold text-[#1A2922] hover:bg-[#F5F4EF] hover:text-[#1B4332] transition-colors"
            >
              {item.label}
            </Link>
          ))}
          {signedIn ? (
            <Link href="/app" onClick={() => setMobileOpen(false)} className="pt-2 mt-1 border-t border-[#E6E4DC]">
              <Button variant="primary" className="w-full rounded-md">
                Vào ứng dụng
              </Button>
            </Link>
          ) : (
            <div className="pt-2 mt-1 border-t border-[#E6E4DC] grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" size="sm" className="w-full rounded-md">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="sm" className="w-full rounded-md">
                  Đăng ký
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
      { href: "/onboarding", label: "Đăng ký doanh nghiệp" },
    ],
  },
  {
    title: "Tài khoản",
    links: [
      { href: "/login", label: "Đăng nhập hệ thống" },
      { href: "/register", label: "Đăng ký tài khoản" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="bg-[#F5F4EF] border-t border-[#E6E4DC]">
      <div className="max-w-content mx-auto px-4 lg:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-sm">
        <div className="lg:col-span-2">
          <Wordmark />
          <p className="mt-3.5 max-w-[360px] text-[#2E3B33] leading-relaxed">
            Nền tảng quản lý không gian pháp nhân, phân quyền nhân sự và ký kết hợp đồng điện tử chuẩn số PAdES dành cho doanh nghiệp Việt Nam.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-[#E6E4DC] text-xs font-semibold text-[#1A2922]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332] shrink-0" aria-hidden="true" />
            Tuân thủ Luật Giao dịch điện tử 2023
          </div>
        </div>
        {footerColumns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-bold uppercase tracking-wider text-[#1A2922]">{col.title}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[#2E3B33] hover:text-[#1B4332] font-medium transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[#E6E4DC] bg-[#EFECE4]/60">
        <div className="max-w-content mx-auto px-4 lg:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#2E3B33] font-medium">
          <span>© 2026 TrustSign · Hệ thống ký hợp đồng điện tử doanh nghiệp.</span>
          <span>Bảo mật PAdES · Xác thực OTP · Đối soát VietQR tự động</span>
        </div>
      </div>
    </footer>
  );
}
