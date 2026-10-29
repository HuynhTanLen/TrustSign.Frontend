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
import { Building2, CircleAlert, FileText, LogOut, Mail, MapPin, Shield } from "lucide-react";

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

      toast("Đã tạo doanh nghiệp mới", "success");
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
      <header className="h-14 bg-primary text-white sticky top-0 z-30">
        <div className="h-full max-w-content mx-auto px-4 lg:px-6 flex items-center justify-between gap-3">
          <Wordmark href={hasExistingTenant ? "/app" : "/"} tone="light" />
          {currentUser && (
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden sm:inline text-topbar-muted truncate max-w-[240px]">
                {currentUser.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 h-control px-3 rounded-md text-white hover:bg-topbar-hover cursor-pointer"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-[560px] mx-auto px-4 py-10 motion-safe:animate-fade-up">
        {isCheckingSession ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-[320px] w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {currentUser?.role === "Admin" && (
              <div className="p-3 rounded-md border border-line bg-selected flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 text-fg">
                  <Shield className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                  <span>Tài khoản Quản trị nền tảng không bắt buộc thuộc doanh nghiệp.</span>
                </div>
                <Link
                  href="/admin"
                  className="text-primary font-semibold underline underline-offset-2 hover:text-primary-hover shrink-0"
                >
                  Vào khu quản trị
                </Link>
              </div>
            )}

            <PageHeader
              back={hasExistingTenant ? { href: "/app", label: "Quay lại không gian doanh nghiệp" } : undefined}
              title={hasExistingTenant ? "Tạo doanh nghiệp mới" : "Tạo doanh nghiệp đầu tiên"}
              description="Thiết lập thông tin đơn vị. Tài khoản khởi tạo sẽ giữ vai trò Chủ doanh nghiệp."
            />

            <Card title="Thông tin doanh nghiệp" icon={Building2} bodyClassName="p-6">
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-5 p-3 rounded-md border border-line bg-badge-declined-bg text-sm text-danger flex items-start gap-2.5"
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
                  label="Tên doanh nghiệp"
                  required
                  maxLength={200}
                  placeholder="Công ty TNHH Giải pháp Phần mềm…"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  leftIcon={<Building2 className="w-4 h-4" aria-hidden="true" />}
                />

                <Input
                  label="Mã số thuế"
                  placeholder="0101234567 (không bắt buộc)"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  leftIcon={<FileText className="w-4 h-4" aria-hidden="true" />}
                />

                <Input
                  label="Địa chỉ trụ sở"
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  leftIcon={<MapPin className="w-4 h-4" aria-hidden="true" />}
                />

                <Input
                  label="Email liên hệ"
                  type="email"
                  placeholder="lienhe@doanhnghiep.vn"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
                />

                <div className="flex justify-end gap-2 pt-2">
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
                    className={hasExistingTenant ? "" : "w-full"}
                    isLoading={isSubmitting}
                  >
                    Tạo doanh nghiệp
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
