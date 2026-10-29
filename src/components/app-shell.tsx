"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, type LucideIcon } from "lucide-react";
import { Wordmark } from "@/components/wordmark";

export interface ShellNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match only the exact path (for section roots such as /app). */
  exact?: boolean;
}

interface AppShellProps {
  homeHref: string;
  wordmarkSuffix?: string;
  nav: ShellNavItem[];
  secondaryNav?: ShellNavItem[];
  /** Rendered above the menu, e.g. the tenant switcher. */
  sidebarTop?: React.ReactNode;
  /** Sits on the navy top bar: use light text. */
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
        className={`flex items-center gap-2 h-row px-3 rounded-md text-sm ${
          isActive
            ? "bg-selected text-primary font-semibold shadow-[inset_3px_0_0_var(--color-primary)]"
            : "text-fg hover:bg-page"
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-page text-fg">
      <header className="h-14 bg-primary text-white sticky top-0 z-30">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-8 h-8 rounded-md text-white hover:bg-topbar-hover"
              aria-label="Mở menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <Wordmark href={homeHref} suffix={wordmarkSuffix} tone="light" />
            {topbarLeft && (
              <div className="hidden md:flex items-center pl-4 border-l border-topbar-hover text-sm text-topbar-muted">
                {topbarLeft}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">{topbarRight}</div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-overlay lg:hidden motion-safe:animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-line flex flex-col transition-transform duration-200 ease-out lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:z-auto lg:translate-x-0 shrink-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="lg:hidden h-14 px-4 bg-primary flex items-center justify-between">
            <Wordmark href={homeHref} suffix={wordmarkSuffix} tone="light" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-white hover:bg-topbar-hover"
              aria-label="Đóng menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {sidebarTop && <div className="p-4 border-b border-line">{sidebarTop}</div>}

          <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1" aria-label="Menu chính">
            {nav.map(renderItem)}
            {secondaryNav && secondaryNav.length > 0 && (
              <div className="mt-3 pt-3 border-t border-line flex flex-col gap-1">{secondaryNav.map(renderItem)}</div>
            )}
          </nav>
        </aside>

        <main key={pathname} className="flex-1 min-w-0 w-full max-w-content mx-auto p-4 lg:p-6 motion-safe:animate-fade-up">
          {children}
        </main>
      </div>
    </div>
  );
}

/** Avatar initial + name on the top bar with a dropdown; closes on outside click and Escape. */
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
        className="flex items-center gap-2 h-control px-2 rounded-md text-sm text-white hover:bg-topbar-hover"
      >
        <span className="w-7 h-7 rounded-full bg-white text-primary flex items-center justify-center text-xs font-semibold">
          {name ? name.trim().slice(0, 1).toUpperCase() : "?"}
        </span>
        <span className="hidden md:inline font-semibold">{name}</span>
        <ChevronDown
          className={`w-4 h-4 text-topbar-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-64 origin-top-right rounded-md bg-surface border border-line shadow-menu py-1 z-50 text-sm text-fg motion-safe:animate-drop-in"
        >
          <div className="px-4 py-2 border-b border-line">
            <p className="font-semibold text-fg truncate">{name}</p>
            <p className="text-xs text-muted truncate">{email}</p>
          </div>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export const menuItemClass = "w-full flex items-center gap-2 px-4 h-control text-left text-fg hover:bg-page";
