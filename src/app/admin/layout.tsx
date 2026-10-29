"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { authApi, UserDto } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { AppShell, UserMenu, menuItemClass, type ShellNavItem } from "@/components/app-shell";
import {
  ArrowLeftRight,
  LayoutDashboard,
  LogOut,
  UserCog,
} from "lucide-react";

function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = React.useState<UserDto | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [isForbidden, setIsForbidden] = React.useState(false);

  const [profileModalOpen, setProfileModalOpen] = React.useState(false);
  const [profileFullName, setProfileFullName] = React.useState("");
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

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

  const handleOpenProfile = () => {
    setProfileFullName(user?.fullName ?? "");
    setProfileModalOpen(true);
  };

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

  const nav: ShellNavItem[] = [
    { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  ];

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col bg-page text-fg">
        <div className="h-14 bg-primary" />
        <div className="max-w-content w-full mx-auto p-6 flex flex-col gap-4">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page p-4">
        <div className="max-w-md w-full bg-surface border border-line rounded-md p-6 flex flex-col gap-3">
          <h1 className="text-xl font-semibold text-fg">Không có quyền truy cập</h1>
          <p className="text-sm text-muted">
            Tài khoản <span className="font-semibold text-fg">{user?.email}</span> không có vai trò Quản trị nền tảng nên không mở được khu này.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="primary"
              onClick={() => router.push(user?.hasTenant ? "/app" : "/onboarding")}
            >
              Về khu doanh nghiệp
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const workspaceHref = user?.hasTenant ? "/app" : "/onboarding";

  return (
    <AppShell
      homeHref="/admin"
      wordmarkSuffix="Quản trị"
      nav={nav}
      secondaryNav={[
        {
          href: workspaceHref,
          label: user?.hasTenant ? "Khu doanh nghiệp" : "Tạo doanh nghiệp",
          icon: ArrowLeftRight,
        },
      ]}
      topbarLeft={
        <span>
          Vai trò: <span className="font-semibold text-white">Quản trị nền tảng</span>
        </span>
      }
      topbarRight={
        <UserMenu name={user?.fullName} email={user?.email}>
          {(close) => (
            <>
              <button
                type="button"
                className={menuItemClass}
                onClick={() => {
                  close();
                  handleOpenProfile();
                }}
              >
                <UserCog className="w-4 h-4 text-muted" aria-hidden="true" />
                Sửa hồ sơ cá nhân
              </button>
              <Link href={workspaceHref} onClick={close} className={menuItemClass}>
                <ArrowLeftRight className="w-4 h-4 text-muted" aria-hidden="true" />
                {user?.hasTenant ? "Sang khu doanh nghiệp" : "Tạo doanh nghiệp"}
              </Link>
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
      {children}

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
            <Button type="submit" form="admin-profile-form" variant="primary" isLoading={isSavingProfile}>
              Lưu thay đổi
            </Button>
          </>
        }
      >
        <form id="admin-profile-form" onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <Input label="Email đăng nhập" type="email" value={user?.email ?? ""} disabled />
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
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-page text-sm text-muted">
          Đang tải khu quản trị…
        </div>
      }
    >
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </Suspense>
  );
}
