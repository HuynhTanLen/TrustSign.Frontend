"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authApi, UserDto } from "@/lib/api/auth";
import { tenantsApi, type TenantRole } from "@/lib/api/tenants";
import { ApiError } from "@/lib/api";
import { TENANT_ROLE_LABELS, WorkspaceContext } from "@/lib/workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { AppShell, UserMenu, menuItemClass, type ShellNavItem } from "@/components/app-shell";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Shield,
  UserCog,
  Users,
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
  const [isSwitchingTenant, setIsSwitchingTenant] = React.useState(false);

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

  const handleSwitchTenant = async (newTenantId: string) => {
    if (newTenantId === "__create_new__") {
      router.push("/onboarding");
      return;
    }
    if (!newTenantId || newTenantId === selectedTenantId) return;

    setIsSwitchingTenant(true);
    try {
      const res = await tenantsApi.switchTenant(newTenantId);
      setUser(res.user);
      setSelectedTenantId(newTenantId);
      toast("Đã chuyển doanh nghiệp làm việc", "success");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Không thể chuyển doanh nghiệp làm việc",
        "error",
      );
    } finally {
      setIsSwitchingTenant(false);
    }
  };

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

  const nav: ShellNavItem[] = [
    { href: "/app", label: "Tổng quan", icon: LayoutDashboard, exact: true },
    ...(currentRole === "TenantOwner"
      ? [{ href: "/app/members", label: "Thành viên", icon: Users }]
      : []),
  ];

  const secondaryNav: ShellNavItem[] = [
    { href: "/onboarding", label: "Tạo doanh nghiệp mới", icon: Building2 },
    ...(user?.role === "Admin"
      ? [{ href: "/admin", label: "Quản trị nền tảng", icon: Shield }]
      : []),
  ];

  if (isInitializing || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-page text-fg">
        <div className="h-14 bg-primary" />
        <div className="max-w-content w-full mx-auto p-6 flex flex-col gap-4">
          <Skeleton className="h-6 w-56" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-56" />
        </div>
      </div>
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
          <Select
            label="Doanh nghiệp đang làm việc"
            value={selectedTenantId}
            disabled={isSwitchingTenant}
            onChange={(e) => handleSwitchTenant(e.target.value)}
          >
            {user.tenants?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {TENANT_ROLE_LABELS[t.role] ?? t.role}
              </option>
            ))}
            <option value="__create_new__">+ Tạo doanh nghiệp mới…</option>
          </Select>
        }
        topbarLeft={
          <span>
            Vai trò:{" "}
            <span className="font-semibold text-white">
              {TENANT_ROLE_LABELS[currentRole] ?? currentRole}
            </span>
          </span>
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
                <Link href="/onboarding" onClick={close} className={menuItemClass}>
                  <Building2 className="w-4 h-4 text-muted" aria-hidden="true" />
                  Tạo doanh nghiệp mới
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
                  className={`${menuItemClass} text-danger`}
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
