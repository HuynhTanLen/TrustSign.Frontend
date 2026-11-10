"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, ShieldCheck, Sparkles, X, type LucideIcon } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { Avatar } from "@/components/avatar";

export interface ShellNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
}

interface AppShellProps {
  homeHref: string;
  wordmarkSuffix?: string;
  nav: ShellNavItem[];
  secondaryNav?: ShellNavItem[];
  sidebarTop?: React.ReactNode;
  topbarLeft?: React.ReactNode;
  topbarRight?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * AppShell — Phong cách Stripe / Mercury FinTech (Top Navigation).
 * Loại bỏ hoàn toàn thanh bên (Sidebar) 276px cồng kềnh, sử dụng thanh điều hướng ngang tinh gọn trên đỉnh
 * giúp mở rộng 100% không gian làm việc cho văn bản hợp đồng và bảng điều khiển.
 */
export function AppShell({
  homeHref,
  wordmarkSuffix,
  nav,
  secondaryNav,
  sidebarTop,
  topbarLeft,
  topbarRight,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-fg">
      {/* ==========================================================
          LEVEL 1: PRIMARY TOPBAR (Brand + Organization + Profile)
          ========================================================== */}
      <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Cụm trái: Logo + Doanh nghiệp hiện tại */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-fg hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Wordmark href={homeHref} suffix={wordmarkSuffix} tone="dark" />

            {/* Doanh nghiệp & Vai trò hiện tại (Stripe Workspace Switcher pill) */}
            {sidebarTop && (
              <div className="hidden md:flex items-center pl-3 border-l border-slate-200">
                <div className="max-w-[280px]">{sidebarTop}</div>
              </div>
            )}
          </div>

          {/* Cụm giữa: Huy hiệu chuẩn bảo mật */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>PAdES · Luật Giao dịch điện tử 2023</span>
          </div>

          {/* Cụm phải: Tiện ích phụ + Menu tài khoản */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {secondaryNav && secondaryNav.length > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 mr-2">
                {secondaryNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {topbarRight}
          </div>
        </div>
      </header>

      {/* ==========================================================
          LEVEL 2: STRIPE / MERCURY SUBNAV TABS (Horizontal Navigation)
          ========================================================== */}
      <nav
        className="h-12 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-16 z-30 shadow-2xs"
        aria-label="Thanh điều hướng chính"
      >
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Dãy Tab chính nằm ngang */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group inline-flex items-center gap-2 h-9 px-3 sm:px-3.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap select-none ${
                    isActive
                      ? "bg-slate-900 text-white font-bold shadow-xs hover:bg-slate-800"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                      isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isActive
                          ? "bg-blue-500 text-white"
                          : "bg-slate-200 text-slate-700 group-hover:bg-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Shortcut bên phải subnav trên màn hình lớn */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ký số PAdES sẵn sàng</span>
          </div>
        </div>
      </nav>

      {/* ==========================================================
          MOBILE SHEET MENU (Trượt mượt mà trên điện thoại)
          ========================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm motion-safe:animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white border-r border-slate-200 p-5 flex flex-col justify-between shadow-2xl motion-safe:animate-slide-in">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <Wordmark href={homeHref} suffix={wordmarkSuffix} tone="dark" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Đóng menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {sidebarTop && <div className="pb-3 border-b border-slate-100">{sidebarTop}</div>}

              <nav className="flex flex-col gap-1">
                <p className="px-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Điều hướng chính
                </p>
                {nav.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-slate-900 text-white font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {secondaryNav && secondaryNav.length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-1">
                  <p className="px-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Tiện ích
                  </p>
                  {secondaryNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 h-9 px-3 rounded-lg text-sm text-slate-600 hover:bg-slate-100 font-medium"
                      >
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Chuẩn Luật Giao dịch điện tử 2023</span>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          MAIN WORKSPACE: TOÀN MÀN HÌNH RỘNG RÃI (100% WIDTH)
          ========================================================== */}
      <main
        key={pathname}
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 motion-safe:animate-fade-up"
      >
        {children}
      </main>
    </div>
  );
}

export function UserMenu({
  name,
  email,
  avatarUrl,
  children,
}: {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="group flex items-center gap-2.5 h-10 pl-1.5 pr-3.5 rounded-full bg-slate-100/90 border border-slate-200 text-sm text-fg hover:bg-slate-200/70 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      >
        <Avatar name={name} src={avatarUrl} className="h-7 w-7 text-xs ring-2 ring-white" />
        <span className="hidden md:inline font-bold max-w-[160px] truncate">{name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180 text-blue-600" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-68 origin-top-right rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-sm text-fg motion-safe:animate-drop-in overflow-hidden"
        >
          <div className="px-4.5 py-3 border-b border-slate-100 bg-slate-50/70">
            <p className="font-extrabold text-fg truncate">{name}</p>
            <p className="text-xs text-muted truncate mt-0.5 font-medium">{email}</p>
          </div>
          <div className="py-1">{children(() => setOpen(false))}</div>
        </div>
      )}
    </div>
  );
}

export const menuItemClass =
  "w-full flex items-center gap-2.5 px-4 h-9 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer";
