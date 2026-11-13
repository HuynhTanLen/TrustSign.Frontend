"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authApi, UserDto } from "@/lib/api/auth";
import { type TenantRole } from "@/lib/api/tenants";
import { TENANT_ROLE_LABELS, WorkspaceContext } from "@/lib/workspace-context";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell, UserMenu, menuItemClass, type ShellNavItem } from "@/components/app-shell";
import {
  Building2,
  CreditCard,
  FilePenLine,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Tag,
} from "lucide-react";

function AppLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = React.useState<UserDto | null>(null);
  const [selectedTenantId, setSelectedTenantId] = React.useState<string>("");
  const [isInitializing, setIsInitializing] = React.useState(true);

  const loadUser = React.useCallback(async () => {
    const data = await authApi.me();
    setUser(data);
    if (data.activeTenantId) {
      setSelectedTenantId(data.activeTenantId);
    } else if (data.tenants && data.tenants.length > 0) {
      setSelectedTenantId(data.tenants[0].id);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    authApi
      .me()
      .then((data) => {
        if (!isMounted) return;
        setUser(data);
        if (!data.hasTenant || !data.tenants || data.tenants.length === 0) {
          router.replace(data.role === "Admin" ? "/admin" : "/onboarding");
          return;
        }
        setSelectedTenantId(data.activeTenantId ?? data.tenants[0].id);
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

  const handleOpenSettings = React.useCallback(() => {
    router.push("/app/settings");
  }, [router]);

  const currentRole: TenantRole =
    user?.tenants?.find((t) => t.id === selectedTenantId)?.role ?? "Employee";

  const activeTenantInfo =
    user?.tenants?.find((t) => t.id === selectedTenantId) ?? user?.tenants?.[0];

  // Navigation M1 + M2 + M3 (Mô hình 1 tài khoản = 1 doanh nghiệp duy nhất):
  const nav: ShellNavItem[] = [
    { href: "/app", label: "Tổng quan", icon: LayoutDashboard, exact: true },
    { href: "/app/contracts", label: "Hợp đồng", icon: FileText },
    { href: "/app/templates", label: "Mẫu hợp đồng", icon: FilePenLine },
    { href: "/app/billing", label: "Gói và thanh toán", icon: CreditCard },
    { href: "/app/settings", label: "Cài đặt", icon: Settings },
  ];

  const secondaryNav: ShellNavItem[] = [
    { href: "/pricing", label: "Bảng giá dịch vụ", icon: Tag },
    ...(user?.role === "Admin"
      ? [{ href: "/admin", label: "Quản trị nền tảng", icon: Shield }]
      : []),
  ];

  if (isInitializing || !user) {
    return (
      <AppShell homeHref="/app" nav={nav} secondaryNav={secondaryNav}>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="hidden" aria-hidden="true">
          {children}
        </div>
      </AppShell>
    );
  }

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        activeTenantId: selectedTenantId,
        currentRole,
        openProfileModal: handleOpenSettings,
        refreshUser: loadUser,
      }}
    >
      <AppShell
        homeHref="/app"
        nav={nav}
        secondaryNav={secondaryNav}
        sidebarTop={
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="p-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
              <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                {activeTenantInfo?.name ?? "Doanh nghiệp"}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold truncate leading-tight">
                {TENANT_ROLE_LABELS[currentRole] ?? "Chủ doanh nghiệp"}
              </p>
            </div>
          </div>
        }
        topbarLeft={
          <div className="flex items-center gap-2">
            <span>Vai trò của bạn:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/15 text-white font-semibold text-xs border border-white/20">
              {TENANT_ROLE_LABELS[currentRole] ?? currentRole}
            </span>
          </div>
        }
        topbarRight={
          <UserMenu name={user.fullName} email={user.email} avatarUrl={user.avatarUrl}>
            {(close) => (
              <>
                <Link
                  href="/app/settings"
                  onClick={close}
                  className={menuItemClass}
                >
                  <Settings className="w-4 h-4 text-muted" aria-hidden="true" />
                  Cài đặt tài khoản
                </Link>
                {user.role === "Admin" && (
                  <Link href="/admin" onClick={close} className={menuItemClass}>
                    <Shield className="w-4 h-4 text-muted" aria-hidden="true" />
                    Quản trị nền tảng
                  </Link>
                )}
                <div className="border-t border-line my-1" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`${menuItemClass} text-danger hover:bg-badge-declined-bg`}
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Đăng xuất
                </button>
              </>
            )}
          </UserMenu>
        }
      >
        <div key={selectedTenantId}>{children}</div>
      </AppShell>
    </WorkspaceContext.Provider>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-page text-sm text-muted">
          Đang tải không gian làm việc…
        </div>
      }
    >
      <AppLayoutShell>{children}</AppLayoutShell>
    </Suspense>
  );
}
