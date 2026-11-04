"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authApi, UserDto } from "@/lib/api/auth";
import { type TenantRole } from "@/lib/api/tenants";
import { ApiError } from "@/lib/api";
import { TENANT_ROLE_LABELS, WorkspaceContext } from "@/lib/workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { AppShell, UserMenu, menuItemClass, type ShellNavItem } from "@/components/app-shell";
import {
  Building2,
  CreditCard,
  FilePenLine,
  FileText,
  LayoutDashboard,
  LogOut,
  Shield,
  Tag,
  UserCog,
} from "lucide-react";

function AppLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const [profileModalOpen, setProfileModalOpen] = React.useState(false);
  const [profileFullName, setProfileFullName] = React.useState("");
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
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

  const handleOpenProfileModal = React.useCallback(() => {
    setProfileFullName(user?.fullName ?? "");
    setProfileModalOpen(true);
  }, [user?.fullName]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = profileFullName.trim();
    if (!trimmed || trimmed.length > 100) {
      toast("Họ và tên là bắt buộc và tối đa 100 ký tự", "error");
      return;
    }
    setIsSavingProfile(true);
    try {
      const updated = await authApi.updateProfile(trimmed);
      setUser(updated);
      setProfileModalOpen(false);
      toast("Đã cập nhật hồ sơ cá nhân", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể cập nhật hồ sơ", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

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
        openProfileModal: handleOpenProfileModal,
        refreshUser: loadUser,
      }}
    >
      <AppShell
        homeHref="/app"
        nav={nav}
        secondaryNav={secondaryNav}
        sidebarTop={
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Doanh nghiệp của bạn
            </span>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-md border border-line bg-page">
              <Building2 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-fg truncate">
                  {activeTenantInfo?.name ?? "Doanh nghiệp"}
                </p>
                <p className="text-[11px] text-muted truncate">
                  {TENANT_ROLE_LABELS[currentRole] ?? "Chủ doanh nghiệp"}
                </p>
              </div>
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
          <UserMenu name={user.fullName} email={user.email}>
            {(close) => (
              <>
                <button
                  type="button"
                  className={menuItemClass}
                  onClick={() => {
                    close();
                    handleOpenProfileModal();
                  }}
                >
                  <UserCog className="w-4 h-4 text-muted" aria-hidden="true" />
                  Sửa hồ sơ cá nhân
                </button>
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

        <Dialog
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          title="Sửa hồ sơ cá nhân"
          footer={
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setProfileModalOpen(false)}
                disabled={isSavingProfile}
              >
                Hủy
              </Button>
              <Button type="submit" form="profile-form" variant="primary" isLoading={isSavingProfile}>
                Lưu thay đổi
              </Button>
            </>
          }
        >
          <form id="profile-form" onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <Input label="Email đăng nhập" type="email" value={user.email} disabled />
            <Input
              label="Họ và tên"
              required
              maxLength={100}
              value={profileFullName}
              onChange={(e) => setProfileFullName(e.target.value)}
              helperText="Họ và tên của bạn sẽ được hiển thị khi ký các biên bản và hợp đồng."
            />
          </form>
        </Dialog>
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
