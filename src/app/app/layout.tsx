"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authApi, UserDto } from "@/lib/api/auth";
import { tenantsApi } from "@/lib/api/tenants";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  LayoutDashboard,
  FileText,
  FileSignature,
  CreditCard,
  Users,
  Menu,
  X,
  LogOut,
  UserCheck,
  Building2,
  PenTool,
  Shield,
  ChevronDown,
  ShieldCheck,
  Plus,
  ExternalLink,
} from "lucide-react";

function AppLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [user, setUser] = React.useState<UserDto | null>(null);
  const [selectedTenantId, setSelectedTenantId] = React.useState<string>("");
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [isSwitchingTenant, setIsSwitchingTenant] = React.useState(false);

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
      router.refresh();
    } catch {
      toast("Không thể chuyển doanh nghiệp làm việc", "error");
    } finally {
      setIsSwitchingTenant(false);
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    router.push("/login");
  };

  const currentRole =
    user?.tenants?.find((t) => t.id === selectedTenantId)?.role ?? "Employee";

  const navItems = [
    { href: "/app", label: "Bảng điều khiển", icon: LayoutDashboard, visible: true },
    { href: "/app/contracts", label: "Quản lý hợp đồng", icon: FileText, visible: true },
    {
      href: "/app/templates",
      label: "Mẫu hợp đồng",
      icon: PenTool,
      visible: currentRole === "TenantOwner" || currentRole === "ContractManager",
    },
    { href: "/app/signatures", label: "Chữ ký của tôi", icon: FileSignature, visible: true },
    {
      href: "/app/billing",
      label: "Gói và thanh toán",
      icon: CreditCard,
      visible: currentRole === "TenantOwner",
    },
    {
      href: "/app/members",
      label: "Thành viên & Vai trò",
      icon: Users,
      visible: currentRole === "TenantOwner",
    },
  ].filter((item) => item.visible);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page text-sm text-muted">
        Đang tải không gian làm việc…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-page text-fg">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-line flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 lg:static shrink-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="h-[72px] px-6 border-b border-line flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">
                <FileSignature className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-slate-900 leading-tight">
                  Chữ Tín <span className="text-primary font-semibold">TrustSign</span>
                </span>
                <span className="text-xs text-muted font-medium">Enterprise Workspace</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-muted hover:text-fg rounded-lg hover:bg-slate-100"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-line bg-slate-50/60">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>Doanh nghiệp làm việc</span>
            </label>
            <select
              value={selectedTenantId}
              disabled={isSwitchingTenant}
              onChange={(e) => handleSwitchTenant(e.target.value)}
              className="w-full bg-surface hover:border-slate-400 border border-slate-300 rounded-xl h-11 px-3.5 text-sm text-slate-900 font-semibold focus:outline-none focus:border-primary cursor-pointer"
            >
              {user?.tenants?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (
                  {t.role === "TenantOwner"
                    ? "Chủ DN"
                    : t.role === "ContractManager"
                    ? "Quản lý"
                    : "Nhân viên"}
                  )
                </option>
              ))}
              <option value="__create_new__">+ Tạo doanh nghiệp mới…</option>
            </select>
          </div>

          <div className="p-3.5">
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Menu nghiệp vụ
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/app"
                    ? pathname === "/app"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 h-11 rounded-xl text-sm transition-all ${
                      isActive
                        ? "bg-primary-light text-primary font-semibold border border-indigo-200/80"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <p className="px-3 mt-6 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cổng công khai & Hệ thống
            </p>
            <nav className="space-y-1">
              <Link
                href="/verify"
                className="flex items-center justify-between px-3.5 h-11 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-slate-400" />
                  <span>Xác minh chữ ký (/verify)</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </Link>
              {user?.role === "Admin" && (
                <Link
                  href="/admin"
                  className="flex items-center justify-between px-3.5 h-11 rounded-xl text-sm font-semibold text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/80 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <span>Quản trị nền tảng (/admin)</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-primary" />
                </Link>
              )}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-line bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3 truncate">
            <div className="w-10 h-10 rounded-full bg-primary-light border border-indigo-200 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {user?.fullName ? user.fullName.substring(0, 1).toUpperCase() : "U"}
            </div>
            <div className="truncate">
              <p className="font-semibold text-slate-900 truncate text-sm">
                {user?.fullName}
              </p>
              <p className="truncate text-slate-500 text-xs">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-2 hover:bg-rose-50 hover:text-danger rounded-lg text-slate-500 transition-colors shrink-0"
            aria-label="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

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
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                <Shield className="w-4 h-4 text-primary" />
                <span>Vai trò:</span>
                <strong className="text-slate-900 font-semibold">
                  {currentRole === "TenantOwner"
                    ? "Chủ doanh nghiệp"
                    : currentRole === "ContractManager"
                    ? "Quản lý hợp đồng"
                    : "Nhân viên"}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/app/contracts/new" className="hidden sm:block">
              <Button variant="primary" size="sm">
                <Plus className="w-4 h-4" />
                <span>Soạn hợp đồng</span>
              </Button>
            </Link>

            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-primary-light text-primary border border-indigo-200 flex items-center justify-center font-bold text-xs">
                  {user?.fullName ? user.fullName.substring(0, 1).toUpperCase() : "U"}
                </div>
                <span className="hidden md:inline font-semibold">{user?.fullName}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-surface border border-line shadow-lg py-1.5 z-50 text-sm">
                  <div className="px-4 py-2.5 border-b border-line">
                    <p className="font-semibold text-slate-900 truncate">{user?.fullName}</p>
                    <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/app/signatures"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <UserCheck className="w-4 h-4 text-slate-400" /> Chữ ký cá nhân
                  </Link>
                  <Link
                    href="/forgot-password"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <PenTool className="w-4 h-4 text-slate-400" /> Đổi mật khẩu
                  </Link>
                  <div className="border-t border-line my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-danger hover:bg-rose-50 text-left font-semibold"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-[1320px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-page text-sm text-muted">Đang tải không gian làm việc…</div>}>
      <AppLayoutShell>{children}</AppLayoutShell>
    </Suspense>
  );
}
