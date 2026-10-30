"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { authApi, UserDto } from "@/lib/api/auth";
import { tenantsApi } from "@/lib/api/tenants";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  Building2,
  CircleAlert,
  FileText,
  LogOut,
  Mail,
  MapPin,
  Shield,
  Sparkles,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = React.useState<UserDto | null>(null);
  const [isCheckingSession, setIsCheckingSession] = React.useState(true);
  const [companyName, setCompanyName] = React.useState("");
  const [taxCode, setTaxCode] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [correlationId, setCorrelationId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    authApi
      .me()
      .then((data) => {
        if (!isMounted) return;
        setCurrentUser(data);
        setIsCheckingSession(false);
      })
      .catch(() => {
        if (isMounted) router.replace("/login?redirect=%2Fonboarding");
      });
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await authApi.logout();
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setCorrelationId(null);

    const trimmedName = companyName.trim();
    if (!trimmedName || trimmedName.length > 200) {
      setErrorMessage("Tên doanh nghiệp là bắt buộc và tối đa 200 ký tự.");
      return;
    }

    setIsSubmitting(true);
    try {
      await tenantsApi.create({
        name: trimmedName,
        taxCode: taxCode.trim() || undefined,
        address: address.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
      });

      toast("Đã khởi tạo không gian doanh nghiệp mới", "success");
      router.push("/app");
    } catch (err) {
      if (err instanceof ApiError) {
        setCorrelationId(err.correlationId);
        setErrorMessage(err.message || "Không thể tạo doanh nghiệp.");
      } else {
        setErrorMessage("Không kết nối được máy chủ API. Vui lòng kiểm tra backend đang chạy.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasExistingTenant = Boolean(currentUser?.hasTenant);

  return (
    <div className="min-h-screen flex flex-col bg-page text-fg">
      <header className="h-16 navy-panel text-white sticky top-0 z-30 border-b border-white/10 shadow-xs">
        <div className="h-full max-w-content mx-auto px-4 lg:px-6 flex items-center justify-between gap-4">
          <Wordmark href={hasExistingTenant ? "/app" : "/"} tone="light" />
          {currentUser && (
            <div className="flex items-center gap-3 text-xs">
              <span className="hidden sm:inline text-topbar-muted truncate max-w-[240px]">
                {currentUser.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-white/10 border border-white/15 text-white hover:bg-white/18 cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-[620px] mx-auto px-4 py-10 lg:py-14 motion-safe:animate-fade-up">
        {isCheckingSession ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-[360px] w-full rounded-xl" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {currentUser?.role === "Admin" && (
              <div className="p-4 rounded-xl border border-line bg-selected flex items-center justify-between gap-3 text-sm shadow-xs">
                <div className="flex items-center gap-2.5 text-fg">
                  <Shield className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                  <span>Tài khoản Quản trị nền tảng có thể vào thẳng trung tâm điều hành.</span>
                </div>
                <Link
                  href="/admin"
                  className="text-primary font-bold underline underline-offset-4 hover:text-primary-hover shrink-0"
                >
                  Vào khu quản trị →
                </Link>
              </div>
            )}

            <PageHeader
              back={hasExistingTenant ? { href: "/app", label: "Quay lại không gian làm việc" } : undefined}
              title={hasExistingTenant ? "Tạo thêm doanh nghiệp" : "Thiết lập doanh nghiệp đầu tiên"}
              description="Khởi tạo không gian pháp nhân. Bạn sẽ giữ vai trò Chủ doanh nghiệp (TenantOwner)."
            />

            {/* Trial Banner Callout */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-selected via-surface to-strip border border-primary/20 shadow-xs flex items-start gap-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white shrink-0 mt-0.5 shadow-xs">
                <Sparkles className="w-4 h-4 text-accent" />
              </span>
              <div className="text-xs leading-relaxed">
                <p className="font-bold text-fg text-sm">Tự động kích hoạt Gói dùng thử 14 ngày</p>
                <p className="text-muted mt-0.5">
                  Doanh nghiệp mới sẽ được tặng ngay hạn mức hợp đồng gửi ký để bạn và đồng nghiệp trải nghiệm toàn bộ tính năng mà không cần thanh toán trước.
                </p>
              </div>
            </div>

            <Card
              title="Thông tin pháp nhân"
              icon={Building2}
              bodyClassName="p-6"
            >
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-5 p-3.5 rounded-lg border border-danger/25 bg-badge-declined-bg text-sm text-danger flex items-start gap-3"
                >
                  <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{errorMessage}</p>
                    {correlationId && (
                      <p className="mt-1 font-mono text-xs text-muted">Mã theo dõi: {correlationId}</p>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Tên doanh nghiệp / Đơn vị"
                  required
                  maxLength={200}
                  placeholder="Công ty TNHH Công nghệ & Giải pháp Chữ Tín"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  leftIcon={<Building2 className="w-4 h-4" aria-hidden="true" />}
                  helperText="Tên pháp nhân sẽ hiển thị trên thông tin hợp đồng và thư mời ký."
                />

                <Input
                  label="Mã số thuế"
                  placeholder="0101234567 (không bắt buộc)"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  leftIcon={<FileText className="w-4 h-4" aria-hidden="true" />}
                />

                <Input
                  label="Địa chỉ trụ sở chính"
                  placeholder="Tầng 5, Tòa nhà Landmark, Hà Nội"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" aria-hidden="true" />}
                />

                <Input
                  label="Email liên hệ doanh nghiệp"
                  type="email"
                  placeholder="lienhe@doanhnghiep.vn"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
                />

                <div className="flex items-center justify-end gap-3 pt-3">
                  {hasExistingTenant && (
                    <Link href="/app">
                      <Button type="button" variant="secondary" disabled={isSubmitting}>
                        Hủy
                      </Button>
                    </Link>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className={hasExistingTenant ? "" : "w-full"}
                    isLoading={isSubmitting}
                  >
                    Hoàn tất & Khởi tạo doanh nghiệp
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
