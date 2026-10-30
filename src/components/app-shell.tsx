"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, ShieldCheck, X, type LucideIcon } from "lucide-react";
import { Wordmark } from "@/components/wordmark";

export interface ShellNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Chỉ khớp đường dẫn chính xác (dành cho trang gốc như /app hoặc /admin). */
  exact?: boolean;
  badge?: string;
}

interface AppShellProps {
  homeHref: string;
  wordmarkSuffix?: string;
  nav: ShellNavItem[];
  secondaryNav?: ShellNavItem[];
  /** Hiển thị phía trên thanh điều hướng bên trái, ví dụ bộ chuyển đổi doanh nghiệp. */
  sidebarTop?: React.ReactNode;
  /** Hiển thị bên trái thanh trên cùng (nền tối). */
  topbarLeft?: React.ReactNode;
  topbarRight?: React.ReactNode;
  children: React.ReactNode;
}

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

  const renderItem = (item: ShellNavItem) => {
    const Icon = item.icon;
    const isActive = item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileMenuOpen(false)}
        aria-current={isActive ? "page" : undefined}
        className={`group flex items-center gap-3 h-10 px-3 rounded-md text-sm transition-colors ${
          isActive
            ? "bg-selected text-primary font-semibold shadow-[inset_3px_0_0_var(--color-primary)]"
            : "text-muted font-medium hover:bg-strip hover:text-fg"
        }`}
      >
        <Icon
          className={`w-[18px] h-[18px] shrink-0 ${
            isActive ? "text-primary" : "text-muted group-hover:text-fg"
          }`}
          aria-hidden="true"
        />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && (
          <span className="inline-flex items-center h-5 px-2 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-page text-fg">
      <header className="h-16 navy-panel text-white sticky top-0 z-30 border-b border-white/10 shadow-xs">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md text-white hover:bg-topbar-hover cursor-pointer"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Wordmark href={homeHref} suffix={wordmarkSuffix} tone="light" />
            {topbarLeft && (
              <div className="hidden md:flex items-center pl-4 border-l border-white/15 text-xs text-topbar-muted">
                {topbarLeft}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2.5">{topbarRight}</div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-overlay backdrop-blur-[2px] lg:hidden motion-safe:animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[272px] bg-surface border-r border-line flex flex-col transition-transform duration-200 ease-out lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:z-auto lg:translate-x-0 shrink-0 ${
            mobileMenuOpen ? "translate-x-0 shadow-dialog" : "-translate-x-full"
          }`}
        >
          <div className="lg:hidden h-16 px-4 navy-panel flex items-center justify-between border-b border-white/10">
            <Wordmark href={homeHref} suffix={wordmarkSuffix} tone="light" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-white hover:bg-topbar-hover cursor-pointer"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {sidebarTop && (
            <div className="p-4 bg-strip/60 border-b border-line">{sidebarTop}</div>
          )}

          <nav
            className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5"
            aria-label="Menu điều hướng"
          >
            <div>
              <p className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted/85">
                Không gian làm việc
              </p>
              <div className="flex flex-col gap-1">{nav.map(renderItem)}</div>
            </div>

            {secondaryNav && secondaryNav.length > 0 && (
              <div className="pt-4 border-t border-line">
                <p className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted/85">
                  Tiện ích & Hệ thống
                </p>
                <div className="flex flex-col gap-1">{secondaryNav.map(renderItem)}</div>
              </div>
            )}
          </nav>

          <div className="p-3.5 border-t border-line bg-strip/50">
            <div className="flex items-center gap-2 text-xs text-muted">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <span className="truncate">Chuẩn Luật Giao dịch điện tử 2023</span>
            </div>
          </div>
        </aside>

        <main
          key={pathname}
          className="flex-1 min-w-0 w-full max-w-content mx-auto p-4 sm:p-6 lg:p-8 motion-safe:animate-fade-up"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

/** Nút tài khoản người dùng trên thanh trên cùng kèm menu thả xuống. */
export function UserMenu({
  name,
  email,
  children,
}: {
  name?: string;
  email?: string;
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
        className="flex items-center gap-2.5 h-10 pl-1.5 pr-3 rounded-full bg-white/10 border border-white/15 text-sm text-white hover:bg-white/18 cursor-pointer"
      >
        <span className="w-7 h-7 rounded-full bg-white text-primary flex items-center justify-center text-xs font-bold shadow-xs">
          {name ? name.trim().slice(0, 1).toUpperCase() : "?"}
        </span>
        <span className="hidden md:inline font-semibold max-w-[160px] truncate">{name}</span>
        <ChevronDown
          className={`w-4 h-4 text-topbar-muted transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-68 origin-top-right rounded-lg bg-surface border border-line shadow-menu py-1.5 z-50 text-sm text-fg motion-safe:animate-drop-in"
        >
          <div className="px-4 py-3 border-b border-line bg-strip/60">
            <p className="font-bold text-fg truncate">{name}</p>
            <p className="text-xs text-muted truncate mt-0.5">{email}</p>
          </div>
          <div className="py-1">{children(() => setOpen(false))}</div>
        </div>
      )}
    </div>
  );
}

export const menuItemClass =
  "w-full flex items-center gap-2.5 px-4 h-9 text-left text-sm font-medium text-fg hover:bg-selected/60 cursor-pointer";
