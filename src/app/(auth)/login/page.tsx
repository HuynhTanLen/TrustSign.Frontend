"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, type UserDto } from "@/lib/api/auth";
import { ApiError, tryRestoreSession } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GoogleSignIn } from "@/components/google-sign-in";
import { useToast } from "@/components/ui/toast";
import { ArrowUpRight, CircleAlert, Loader2 } from "lucide-react";

function safeRedirect(value: string | null): string | null {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\") ||
    value === "/login" ||
    value.startsWith("/login?") ||
    value === "/register" ||
    value.startsWith("/register?")
  ) {
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
  const [isUnverified, setIsUnverified] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [isResending, setIsResending] = React.useState(false);

  const goHome = React.useCallback(
    (user: UserDto) => {
      const isAdmin = user.role === "Admin";
      let target = "/app";
      if (redirectParam && (isAdmin || !redirectParam.startsWith("/admin"))) {
        target = redirectParam;
      } else if (isAdmin) {
        target = "/admin";
      } else if (!user.hasTenant) {
        target = "/onboarding";
      }

      if (typeof window !== "undefined") {
        window.location.href = target;
      } else {
        router.push(target);
      }
    },
    [redirectParam, router],
  );

  React.useEffect(() => {
    let alive = true;
    tryRestoreSession()
      .then((ok) => (ok ? authApi.me() : null))
      .then((user) => alive && user && goHome(user))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [goHome]);

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
    setIsUnverified(false);

    try {
      const res = await authApi.login({ email: email.trim(), password });
      toast("Đăng nhập thành công", "success");

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("trustsign_post_verify_redirect");
      }

      goHome(res.user);
    } catch (err) {
      if (err instanceof ApiError) {
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
      <div className="mb-7">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#2E3B33]">
          01 / Đăng nhập
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          Chào mừng trở lại.
        </h1>
        <p className="mt-1.5 text-sm text-[#2E3B33]">
          Đăng nhập để quản lý và ký kết hợp đồng của bạn.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-lg border border-rose-200 bg-rose-50 text-sm text-rose-800 flex items-start gap-2.5"
        >
          <CircleAlert className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="font-medium leading-snug">{errorMessage}</p>
            {isUnverified && (
              <div className="mt-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
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
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-slate-800 mb-1.5">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            placeholder="ten@doanhnghiep.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-[#1A2922] placeholder:text-[#2E3B33] transition-all focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/15"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-semibold text-slate-800 mb-1.5">
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-lg border border-slate-300 bg-white pl-3.5 pr-14 text-sm text-[#1A2922] placeholder:text-[#2E3B33] transition-all focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 px-3.5 text-xs font-semibold text-[#2E3B33] hover:text-slate-900 transition-colors cursor-pointer"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? "Ẩn" : "Hiện"}
            </button>
          </div>
          <div className="mt-1.5 flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#2E3B33] hover:text-slate-900 underline underline-offset-4 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 w-full h-11 rounded-lg bg-[#1B4332] hover:bg-[#143326] disabled:opacity-60 text-white text-sm font-semibold px-4 flex items-center justify-between transition-colors cursor-pointer shadow-xs"
        >
          <span>{isLoading ? "Đang đăng nhập..." : "Đăng nhập"}</span>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#2E3B33]">hoặc</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleSignIn onSuccess={goHome} />

      <div className="mt-6 pt-5 border-t border-slate-200 text-center text-sm text-[#2E3B33]">
        Chưa có tài khoản?{" "}
        <Link
          href={registerHref}
          className="text-[#1B4332] font-bold underline underline-offset-4 hover:text-[#143326] transition-colors"
        >
          Đăng ký
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
