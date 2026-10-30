"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, X } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";

const publicNav = [
  { href: "/#features", label: "Tính năng" },
  { href: "/#workflow", label: "Quy trình" },
  { href: "/pricing", label: "Bảng giá" },
  { href: "/#faq", label: "Câu hỏi thường gặp" },
];

/** Thanh điều hướng khu công khai chuẩn Enterprise SaaS (M1 + M2). */
export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-line">
      <div className="h-16 max-w-content mx-auto px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Wordmark />
          <nav className="hidden md:flex items-center gap-1" aria-label="Điều hướng chính">
            {publicNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    active
                      ? "bg-selected text-primary font-semibold"
                      : "text-muted hover:text-fg hover:bg-strip"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden sm:flex items-center gap-2.5">
          <Link href="/login">
            <Button variant="ghost">Đăng nhập</Button>
          </Link>
          <Link href="/register">
            <Button variant="primary">Dùng thử miễn phí</Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-line text-fg hover:bg-strip cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="sm:hidden border-t border-line bg-surface px-4 py-4 flex flex-col gap-2 shadow-menu motion-safe:animate-drop-in">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-md text-sm font-semibold text-fg hover:bg-strip"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 mt-1 border-t border-line grid grid-cols-2 gap-2">
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="secondary" className="w-full">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" className="w-full">
                Dùng thử
              </Button>
            </Link>
          </div>
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
    <footer className="bg-surface border-t border-line">
      <div className="max-w-content mx-auto px-4 lg:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-sm">
        <div className="lg:col-span-2">
          <Wordmark />
          <p className="mt-3 max-w-[360px] text-muted leading-relaxed">
            Nền tảng quản lý không gian pháp nhân, phân quyền nhân sự và ký kết hợp đồng điện tử chuẩn số PAdES dành cho doanh nghiệp Việt Nam.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-strip border border-line text-xs font-medium text-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
            Tuân thủ Luật Giao dịch điện tử 2023
          </div>
        </div>
        {footerColumns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-bold uppercase tracking-wider text-fg">{col.title}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted hover:text-primary font-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line bg-strip/60">
        <div className="max-w-content mx-auto px-4 lg:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted">
          <span>© 2026 Chữ Tín (TrustSign). Hệ thống quản lý và ký hợp đồng điện tử doanh nghiệp.</span>
          <span>Bảo mật PAdES · Xác thực OTP · Thanh toán VietQR tự động</span>
        </div>
      </div>
    </footer>
  );
}
