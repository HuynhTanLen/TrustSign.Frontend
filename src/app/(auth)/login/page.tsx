"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, type UserDto } from "@/lib/api/auth";
import { ApiError, tryRestoreSession } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { GoogleSignIn } from "@/components/google-sign-in";
import { useToast } from "@/components/ui/toast";
import { CircleAlert, Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";

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
  const [correlationId, setCorrelationId] = React.useState<string | null>(null);
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

      // Điều hướng dứt khoát sang trang đích; dùng window.location.href để nạp trang
      // sạch sẽ qua Cloudflare Tunnel, tránh tình trạng client-router Next.js bị kẹt trong dev mode
      if (typeof window !== "undefined") {
        window.location.href = target;
      } else {
        router.push(target);
      }
    },
    [redirectParam, router],
  );

  // Còn cookie refresh hợp lệ (vd. vừa từ trang Bảng giá bấm Đăng nhập) thì vào thẳng, không bắt nhập lại mật khẩu.
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
    setCorrelationId(null);
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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
      <header className="px-6 py-5 bg-slate-50/90 border-b border-slate-200 flex items-center gap-3.5">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shadow-xs shrink-0">
          <LogIn className="w-5 h-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-base font-extrabold text-slate-900">Đăng nhập tài khoản</h1>
          <p className="text-xs text-slate-500 font-medium">Truy cập không gian làm việc doanh nghiệp</p>
        </div>
      </header>

      <div className="p-6 sm:p-8">
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-sm text-rose-800 flex items-start gap-3"
          >
            <CircleAlert className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{errorMessage}</p>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
          <Input
            label="Email đăng nhập"
            type="email"
            required
            autoComplete="email"
            placeholder="ten@doanhnghiep.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-semibold text-slate-800">
                Mật khẩu <span className="text-rose-600">*</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors group-focus-within:text-blue-600">
                <Lock className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Nhập mật khẩu của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 rounded-xl border border-slate-300 bg-white pl-10 pr-10 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 transition-all focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            glow
            className="w-full mt-2 shadow-md shadow-blue-600/20"
            isLoading={isLoading}
          >
            Đăng nhập
          </Button>
        </form>

        <div className="mt-5">
          <GoogleSignIn onSuccess={goHome} />
        </div>

        <div className="mt-6 pt-5 border-t border-slate-200 text-center text-sm text-slate-600">
          Chưa có tài khoản doanh nghiệp?{" "}
          <Link
            href={registerHref}
            className="text-blue-600 font-extrabold underline underline-offset-4 hover:text-blue-800 transition-colors"
          >
            Đăng ký dùng thử 14 ngày
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
        <div className="p-6 rounded-xl border border-line bg-surface shadow-card flex flex-col gap-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
