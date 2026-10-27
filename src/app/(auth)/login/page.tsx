"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

// Chỉ nhận đường dẫn nội bộ. "//host" và "/\host" bị trình duyệt hiểu là sang trang khác (open redirect).
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

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isUnverified, setIsUnverified] = React.useState(false);
  const [isLocked, setIsLocked] = React.useState(false);
  const [lockoutRemaining, setLockoutRemaining] = React.useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setIsUnverified(false);
    setIsLocked(false);

    try {
      const res = await authApi.login({ email, password });
      toast("Đăng nhập thành công", "success");

      const redirectUrl = safeRedirect(searchParams.get("redirect"));
      const isAdmin = res.user.role === "Admin";
      if (redirectUrl && (isAdmin || !redirectUrl.startsWith("/admin"))) {
        router.push(redirectUrl);
      } else if (isAdmin) {
        router.push("/admin");
      } else if (!res.user.hasTenant) {
        router.push("/onboarding");
      } else {
        router.push("/app");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "Auth.EmailNotVerified") {
          setIsUnverified(true);
          setErrorMessage("Tài khoản chưa được xác minh email");
        } else if (err.code === "Auth.AccountLocked" || err.status === 429) {
          setIsLocked(true);
          setLockoutRemaining(15);
          setErrorMessage(err.message || "Tài khoản tạm thời bị khóa do nhiều lần nhập sai");
        } else if (err.code === "Auth.AccountDisabled") {
          setErrorMessage("Tài khoản đã bị khóa bởi quản trị viên");
        } else {
          setErrorMessage("Email hoặc mật khẩu không đúng");
        }
      } else {
        setErrorMessage("Không thể kết nối tới máy chủ API. Vui lòng kiểm tra backend đang chạy ở cổng 5050.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast("Vui lòng nhập địa chỉ email", "error");
      return;
    }
    try {
      await authApi.resendVerification(email);
      toast("Đã gửi lại thư xác minh", "success");
    } catch {
      toast("Không thể gửi lại thư xác minh", "error");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Đăng nhập tài khoản</h1>
        <p className="text-sm text-muted mt-1">Truy cập không gian làm việc của doanh nghiệp bạn</p>
      </div>

      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl border border-danger/30 bg-rose-50 text-sm text-danger">
          <p className="font-semibold">{errorMessage}</p>
          {isUnverified && (
            <button
              type="button"
              onClick={handleResendVerification}
              className="mt-2 text-sm text-primary hover:underline font-semibold block"
            >
              → Gửi lại thư xác minh tài khoản
            </button>
          )}
          {isLocked && lockoutRemaining && (
            <p className="mt-1 text-xs">
              Thời gian khóa tối đa: {lockoutRemaining} phút
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email công việc"
          type="email"
          required
          autoComplete="email"
          placeholder="ten@doanhnghiep.vn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Mật khẩu <span className="text-danger">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline font-semibold"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted hover:text-slate-800 transition"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        <div className="pt-2 space-y-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            <span>Đăng nhập vào hệ thống</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>

      <div className="mt-6 pt-5 border-t border-line text-center text-sm text-muted">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-primary hover:underline font-semibold">
          Đăng ký dùng thử miễn phí
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-6 text-center text-sm text-muted">Đang tải trang đăng nhập…</div>}>
      <LoginForm />
    </Suspense>
  );
}
