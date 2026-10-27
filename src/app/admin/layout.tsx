"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authApi, UserDto } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Building2,
  Users,
  Award,
  ShieldAlert,
  Menu,
  X,
  LogOut,
  ArrowLeftRight,
  ExternalLink,
  ShieldCheck,
  Lock,
} from "lucide-react";

function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState<UserDto | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [isForbidden, setIsForbidden] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    authApi
      .me()
      .then((data) => {
        if (!isMounted) return;
        setUser(data);
        if (data.role !== "Admin") {
          setIsForbidden(true);
        }
        setIsInitializing(false);
      })
      .catch(() => {
        if (isMounted) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  const handleLogout = async () => {
    await authApi.logout();
    router.push("/login");
  };

  const navItems = [
    { href: "/admin", label: "Tổng quan & Doanh thu", icon: LayoutDashboard },
    { href: "/admin/plans", label: "Gói dịch vụ SaaS", icon: Package },
    { href: "/admin/tenants", label: "Doanh nghiệp thuê bao", icon: Building2, badge: "128" },
    { href: "/admin/users", label: "Người dùng hệ thống", icon: Users },
    { href: "/admin/certificates", label: "Chứng thư số PKI (CA)", icon: Award },
  ];

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page text-sm text-muted">
        Đang kiểm tra quyền Quản trị nền tảng…
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page p-6">
        <div className="max-w-md w-full bg-surface border border-line rounded-2xl p-8 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-danger/20 text-danger flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Không có quyền Quản trị Nền tảng (403)
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Tài khoản <strong className="text-slate-800">{user?.email}</strong> không mang vai trò{" "}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs">Admin</code>{" "}
            nên không được phép truy cập phân hệ Quản trị SaaS.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() => router.push(user?.hasTenant ? "/app" : "/onboarding")}
            >
              Về Khu Doanh nghiệp
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Đăng xuất đổi tài khoản
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const workspaceHref = user?.hasTenant ? "/app" : "/onboarding";
  const avatarInitials = user?.fullName
    ? user.fullName
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
    : "AD";

  return (
    <div className="min-h-screen flex bg-page text-fg">
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Quản trị nền tảng */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 lg:static shrink-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-[72px] px-6 border-b border-slate-800 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-white leading-tight">
                  Chữ Tín <span className="text-indigo-400 font-semibold">Admin</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Quản trị Nền tảng SaaS
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* System Status Banner */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider text-slate-400">
                Trạng thái PKI & CA
              </span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Online
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono truncate">
              TrustSign Issuing CA v1 (RSA-2048)
            </p>
          </div>

          {/* Navigation */}
          <div className="p-3.5">
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Vận hành nền tảng
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 h-11 rounded-xl text-sm transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white font-semibold shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-slate-800 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isActive ? "bg-indigo-800 text-indigo-100" : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <p className="px-3 mt-6 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Chuyển phân hệ
            </p>
            <nav className="space-y-1">
              <Link
                href={workspaceHref}
                className="flex items-center justify-between px-3.5 h-11 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
                  <span>{user?.hasTenant ? "Khu Doanh nghiệp (/app)" : "Tạo DN thử nghiệm"}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </Link>
              <Link
                href="/verify"
                className="flex items-center justify-between px-3.5 h-11 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Cổng xác minh (/verify)</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </Link>
            </nav>
          </div>
        </div>

        {/* Admin User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3 truncate">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {avatarInitials}
            </div>
            <div className="truncate">
              <p className="font-semibold text-white truncate text-sm">
                {user?.fullName || "Quản trị Hệ thống"}
              </p>
              <p className="truncate text-slate-400 text-xs">
                {user?.email || "admin@trustsign.local"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-2 hover:bg-slate-800 hover:text-rose-400 rounded-lg text-slate-400 transition-colors shrink-0"
            aria-label="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[72px] bg-surface border-b border-line px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-muted hover:text-fg hover:bg-slate-100"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>Quyền hạn: Quản trị Nền tảng (Admin)</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href={workspaceHref}>
              <Button variant="secondary" size="sm">
                <ArrowLeftRight className="w-4 h-4" />
                <span>{user?.hasTenant ? "Sang Khu Doanh nghiệp (/app)" : "Tạo DN thử nghiệm"}</span>
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-[1320px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-page text-sm text-muted">Đang tải khu quản trị…</div>}>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </Suspense>
  );
}
