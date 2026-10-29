"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { CircleAlert, Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";

// Chỉ nhận đường dẫn nội bộ để tránh open redirect.
function safeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return null;
  }
  return value;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const redirectParam = safeRedirect(searchParams.get("redirect"));

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [correlationId, setCorrelationId] = React.useState<string | null>(null);
  const [isUnverified, setIsUnverified] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [isResending, setIsResending] = React.useState(false);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setCorrelationId(null);
    setIsUnverified(false);

    try {
      const res = await authApi.login({ email: email.trim(), password });
      toast("Đăng nhập thành công", "success");

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("trustsign_post_verify_redirect");
      }

      const isAdmin = res.user.role === "Admin";
      if (redirectParam && (isAdmin || !redirectParam.startsWith("/admin"))) {
        router.push(redirectParam);
      } else if (isAdmin) {
        router.push("/admin");
      } else if (!res.user.hasTenant) {
        router.push("/onboarding");
      } else {
        router.push("/app");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setCorrelationId(err.correlationId);
        if (err.code === "Auth.EmailNotVerified") {
          setIsUnverified(true);
          setErrorMessage("Tài khoản chưa được xác minh email. Vui lòng mở hộp thư hoặc gửi lại liên kết xác minh.");
        } else if (err.code === "Auth.AccountLocked") {
          setErrorMessage("Tài khoản tạm thời bị khóa do đăng nhập sai nhiều lần. Thời gian khóa tối đa 15 phút.");
        } else if (err.status === 429) {
          setErrorMessage("Quá nhiều yêu cầu đăng nhập trong thời gian ngắn. Vui lòng chờ 1 phút rồi thử lại.");
        } else if (err.code === "Auth.AccountDisabled") {
          setErrorMessage("Tài khoản đã bị khóa bởi quản trị viên.");
        } else {
          setErrorMessage("Email hoặc mật khẩu không đúng.");
        }
      } else {
        setErrorMessage("Không kết nối được máy chủ API. Vui lòng kiểm tra backend đang chạy.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      toast("Vui lòng nhập địa chỉ email", "error");
      return;
    }
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      await authApi.resendVerification(email.trim());
      setResendCooldown(60);
      toast("Đã gửi lại email xác minh", "success");
    } catch {
      toast("Không thể gửi lại email xác minh", "error");
    } finally {
      setIsResending(false);
    }
  };

  const registerHref = redirectParam
    ? `/register?redirect=${encodeURIComponent(redirectParam)}`
    : "/register";

  return (
    <div>
      <header className="flex items-center gap-2 px-6 h-11 bg-strip border-b border-line">
        <LogIn className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
        <h1 className="text-base font-semibold text-fg">Đăng nhập</h1>
      </header>

      <div className="p-6">
        <p className="text-sm text-muted mb-5">
          Nhập thông tin tài khoản để truy cập không gian làm việc của doanh nghiệp.
        </p>

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
              {isUnverified && (
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleResendVerification}
                    isLoading={isResending}
                    disabled={resendCooldown > 0 || isResending}
                  >
                    {resendCooldown > 0
                      ? `Gửi lại sau ${resendCooldown} giây`
                      : "Gửi lại email xác minh"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            placeholder="ten@doanhnghiep.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
          />

          <Input
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="inline-flex items-center justify-center w-6 h-6 rounded-sm text-muted hover:text-fg cursor-pointer"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            }
          />

          <Button type="submit" variant="primary" className="w-full mt-1" isLoading={isLoading}>
            Đăng nhập
          </Button>
        </form>

        <div className="mt-5 pt-4 border-t border-line text-center text-sm text-muted">
          Chưa có tài khoản?{" "}
          <Link
            href={registerHref}
            className="text-primary font-semibold underline underline-offset-2 hover:text-primary-hover"
          >
            Đăng ký tài khoản
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 flex flex-col gap-3">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
