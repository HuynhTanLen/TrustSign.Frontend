"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, PanelLeftClose, PanelLeftOpen, ShieldCheck, Sparkles, X, type LucideIcon } from "lucide-react";
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
  variant?: "topbar" | "sidebar";
  nav: ShellNavItem[];
  secondaryNav?: ShellNavItem[];
  sidebarTop?: React.ReactNode;
  topbarLeft?: React.ReactNode;
  topbarRight?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({
  homeHref,
  wordmarkSuffix,
  variant = "topbar",
  nav,
  secondaryNav,
  sidebarTop,
  topbarLeft,
  topbarRight,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  if (variant === "sidebar") {
    return (
      <div className="min-h-screen flex bg-[#F5F4EF] text-[#1A2922]">
        {/* METIS COLLAPSIBLE LEFT SIDEBAR (Desktop: 256px <-> 72px) */}
        <aside
          className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-[#E6E4DC] z-40 transition-all duration-200 ${
            sidebarCollapsed ? "lg:w-[72px]" : "lg:w-64"
          }`}
        >
          <div
            className={`h-16 flex items-center border-b border-[#E6E4DC] ${
              sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"
            }`}
          >
            {!sidebarCollapsed && (
              <Wordmark href={homeHref} suffix={wordmarkSuffix} tone="dark" />
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((v) => !v)}
              title={sidebarCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
              aria-label={sidebarCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
              className="inline-flex items-center justify-center w-8 h-8 rounded-sm text-[#2E3B33] hover:bg-[#F5F4EF] hover:text-[#1B4332] transition-colors cursor-pointer"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2.5 py-5 flex flex-col justify-between gap-6">
            <div>
              {!sidebarCollapsed && (
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2E3B33]">
                  Điều hướng quản trị
                </p>
              )}
              <nav className="flex flex-col gap-1" aria-label="Điều hướng quản trị">
                {nav.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={sidebarCollapsed ? item.label : undefined}
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex items-center h-10 rounded-sm text-sm transition-colors ${
                        sidebarCollapsed ? "justify-center px-0" : "gap-3 px-3"
                      } ${
                        isActive
                          ? "bg-[#EFF5E8] text-[#1B4332] font-bold border-l-2 border-[#1B4332]"
                          : "text-[#2E3B33] font-medium hover:bg-[#F5F4EF] hover:text-[#1A2922]"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-[#1B4332]" : "text-[#2E3B33] group-hover:text-[#1B4332]"
                        }`}
                        aria-hidden="true"
                      />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {secondaryNav && secondaryNav.length > 0 && (
              <div className="pt-4 border-t border-[#E6E4DC]">
                {!sidebarCollapsed && (
                  <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2E3B33]">
                    Chuyển đổi
                  </p>
                )}
                <div className="flex flex-col gap-1">
                  {secondaryNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={`flex items-center h-9 rounded-sm text-xs font-semibold text-[#2E3B33] hover:bg-[#F5F4EF] hover:text-[#1B4332] transition-colors ${
                          sidebarCollapsed ? "justify-center px-0" : "gap-3 px-3"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT MAIN SHELL */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
            sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
          }`}
        >
          <header className="h-16 bg-white border-b border-[#E6E4DC] sticky top-0 z-30">
            <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-sm bg-[#F5F4EF] border border-[#E6E4DC] text-[#1A2922] hover:bg-[#EFF5E8] transition-colors cursor-pointer"
                  aria-label="Mở menu điều hướng"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="lg:hidden">
                  <Wordmark href={homeHref} suffix={wordmarkSuffix} tone="dark" />
                </div>
                {topbarLeft && (
                  <div className="hidden lg:flex items-center text-xs text-[#2E3B33]">
                    {topbarLeft}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">{topbarRight}</div>
            </div>
          </header>

          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="fixed inset-0 bg-[#1A2922]/40 backdrop-blur-xs"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white border-r border-[#E6E4DC] p-5 flex flex-col justify-between shadow-xl">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E6E4DC]">
                    <Wordmark href={homeHref} suffix={wordmarkSuffix} tone="dark" />
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1.5 rounded-sm text-[#2E3B33] hover:bg-[#F5F4EF]"
                      aria-label="Đóng menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <nav className="flex flex-col gap-1">
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
                          className={`flex items-center gap-3 h-10 px-3 rounded-sm text-sm font-semibold transition-colors ${
                            isActive
                              ? "bg-[#EFF5E8] text-[#1B4332] font-bold"
                              : "text-[#1A2922] hover:bg-[#F5F4EF]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>
            </div>
          )}

          <main
            key={pathname}
            className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 motion-safe:animate-fade-up"
          >
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4EF] text-[#1A2922]">
      {/* UNIFIED SINGLE TOPBAR (Brand + Organization + Nav + Profile) */}
      <header className="h-16 bg-white border-b border-[#E6E4DC] sticky top-0 z-40">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Logo + Tenant Switcher */}
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-sm bg-[#F5F4EF] border border-[#E6E4DC] text-[#1A2922] hover:bg-[#EFF5E8] transition-colors cursor-pointer"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Wordmark href={homeHref} suffix={wordmarkSuffix} tone="dark" />

            {sidebarTop && (
              <div className="hidden xl:flex items-center pl-3 border-l border-[#E6E4DC]">
                <div className="max-w-[220px]">{sidebarTop}</div>
              </div>
            )}
          </div>

          {/* Center: Unified Horizontal Navigation */}
          <nav
            className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar"
            aria-label="Thanh điều hướng chính"
          >
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
                  className={`group inline-flex items-center gap-1.5 h-9 px-3 rounded-sm text-xs sm:text-[13px] transition-colors whitespace-nowrap select-none ${
                    isActive
                      ? "bg-[#EFF5E8] text-[#1B4332] font-bold"
                      : "text-[#2E3B33] font-medium hover:text-[#1A2922] hover:bg-[#F5F4EF]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-[#1B4332]" : "text-[#2E3B33] group-hover:text-[#1B4332]"
                    }`}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`inline-flex items-center px-1.5 py-0.2 rounded-sm text-[10px] font-bold ${
                        isActive ? "bg-[#1B4332] text-white" : "bg-[#F5F4EF] text-[#1A2922]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Secondary Nav + Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {secondaryNav && secondaryNav.length > 0 && (
              <div className="hidden xl:flex items-center gap-1 mr-1">
                {secondaryNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-sm text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-[#EFF5E8] text-[#1B4332]"
                          : "text-[#2E3B33] hover:text-[#1A2922] hover:bg-[#F5F4EF]"
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
                  className="p-1.5 rounded-lg text-[#2E3B33] hover:bg-slate-100"
                  aria-label="Đóng menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {sidebarTop && <div className="pb-3 border-b border-slate-100">{sidebarTop}</div>}

              <nav className="flex flex-col gap-1">
                <p className="px-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-[#2E3B33]">
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
                      className={`flex items-center gap-3 h-10 px-3 rounded-sm text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-[#1B4332] text-white font-bold"
                          : "text-[#1A2922] hover:bg-[#F5F4EF]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#DCEBC7]" : "text-[#2E3B33]"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {secondaryNav && secondaryNav.length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-1">
                  <p className="px-2 mb-1 text-[11px] font-bold uppercase tracking-wider text-[#2E3B33]">
                    Tiện ích
                  </p>
                  {secondaryNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 h-9 px-3 rounded-lg text-sm text-[#2E3B33] hover:bg-slate-100 font-medium"
                      >
                        <Icon className="w-4 h-4 text-[#2E3B33]" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-[#2E3B33] font-medium">
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
        className="group flex items-center gap-2.5 h-10 pl-1.5 pr-3 rounded-sm bg-[#F5F4EF] border border-[#E6E4DC] text-sm text-[#1A2922] hover:bg-[#EFF5E8] transition-colors cursor-pointer"
      >
        <Avatar name={name} src={avatarUrl} className="h-7 w-7 text-xs ring-2 ring-white" />
        <span className="hidden md:inline font-bold max-w-[160px] truncate">{name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#2E3B33] transition-transform duration-200 ${
            open ? "rotate-180 text-[#1B4332]" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-68 origin-top-right rounded-sm bg-white border border-[#E6E4DC] shadow-lg py-1.5 z-50 text-sm text-[#1A2922] motion-safe:animate-drop-in overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-[#E6E4DC] bg-[#F5F4EF]">
            <p className="font-extrabold text-[#1A2922] truncate">{name}</p>
            <p className="text-xs text-[#2E3B33] truncate mt-0.5 font-medium">{email}</p>
          </div>
          <div className="py-1">{children(() => setOpen(false))}</div>
        </div>
      )}
    </div>
  );
}

export const menuItemClass =
  "w-full flex items-center gap-2.5 px-4 h-9 text-left text-sm font-semibold text-[#1A2922] hover:bg-[#EFF5E8] hover:text-[#1B4332] transition-colors cursor-pointer";
