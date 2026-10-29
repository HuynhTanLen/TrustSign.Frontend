"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { CheckCircle2, CircleAlert, Eye, EyeOff, Lock, Mail, User, UserPlus } from "lucide-react";

function safeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return null;
  }
  return value;
}

function getPasswordStrength(pwd: string): number {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

function getStrengthMeta(score: number): { label: string; color: string } {
  switch (score) {
    case 0:
    case 1:
      return { label: "Yếu", color: "bg-danger" };
    case 2:
      return { label: "Trung bình", color: "bg-warning" };
    case 3:
    case 4:
      return { label: "Mạnh", color: "bg-success" };
    default:
      return { label: "", color: "bg-line" };
  }
}

function RegisterForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const redirectParam = safeRedirect(searchParams.get("redirect"));

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [correlationId, setCorrelationId] = React.useState<string | null>(null);

  const [isSuccess, setIsSuccess] = React.useState(false);
  const [registeredEmail, setRegisteredEmail] = React.useState("");
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [isResending, setIsResending] = React.useState(false);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const loginHref = redirectParam
    ? `/login?redirect=${encodeURIComponent(redirectParam)}`
    : "/login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setCorrelationId(null);

    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length > 100) {
      setErrorMessage("Họ và tên là bắt buộc và tối đa 100 ký tự.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu nhập lại không khớp.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.register({
        fullName: trimmedName,
        email: email.trim(),
        password,
      });
      if (redirectParam && typeof window !== "undefined") {
        window.sessionStorage.setItem("trustsign_post_verify_redirect", redirectParam);
      }
      setRegisteredEmail(res.email || email.trim());
      setIsSuccess(true);
      setResendCooldown(60);
      toast("Đăng ký tài khoản thành công", "success");
    } catch (err) {
      if (err instanceof ApiError) {
        setCorrelationId(err.correlationId);
        if (err.status === 429) {
          setErrorMessage("Quá nhiều yêu cầu đăng ký trong thời gian ngắn. Vui lòng thử lại sau 1 phút.");
        } else {
          setErrorMessage(err.message || "Đăng ký tài khoản không thành công.");
        }
      } else {
        setErrorMessage("Không kết nối được máy chủ API. Vui lòng kiểm tra backend đang chạy.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      await authApi.resendVerification(registeredEmail);
      setResendCooldown(60);
      toast("Đã gửi lại email xác minh", "success");
    } catch {
      toast("Không thể gửi lại email xác minh", "error");
    } finally {
      setIsResending(false);
    }
  };

  if (isSuccess) {
    return (
      <div>
        <header className="flex items-center gap-2 px-6 h-11 bg-strip border-b border-line">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
          <h1 className="text-base font-semibold text-fg">Kiểm tra email để xác minh tài khoản</h1>
        </header>

        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-muted">
            Hệ thống đã gửi liên kết kích hoạt tài khoản tới địa chỉ{" "}
            <span className="font-semibold text-fg">{registeredEmail}</span>. Mở email và bấm vào liên kết để hoàn tất xác minh.
          </p>

          {process.env.NODE_ENV !== "production" && (
            <p className="p-3 rounded-md border border-line bg-page text-xs text-muted">
              Môi trường phát triển: kiểm tra thư xác minh tại hộp thư thử nghiệm{" "}
              <code className="font-mono text-fg">http://localhost:8025</code> (Mailpit).
            </p>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              isLoading={isResending}
              disabled={resendCooldown > 0 || isResending}
              onClick={handleResend}
            >
              {resendCooldown > 0
                ? `Gửi lại sau ${resendCooldown} giây`
                : "Gửi lại email xác minh"}
            </Button>

            <Link href={loginHref} className="block">
              <Button type="button" variant="primary" className="w-full">
                Đến trang đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const strength = getPasswordStrength(password);
  const { label: strengthLabel, color: strengthColor } = getStrengthMeta(strength);

  return (
    <div>
      <header className="flex items-center gap-2 px-6 h-11 bg-strip border-b border-line">
        <UserPlus className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
        <h1 className="text-base font-semibold text-fg">Đăng ký tài khoản</h1>
      </header>

      <div className="p-6">
        <p className="text-sm text-muted mb-5">
          Tạo tài khoản cá nhân để khởi tạo hoặc tham gia doanh nghiệp trên Chữ Tín.
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
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Họ và tên"
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Nguyễn Văn An"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="w-4 h-4" aria-hidden="true" />}
          />

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

          <div>
            <Input
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Tối thiểu 8 ký tự"
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

            {password.length > 0 && (
              <div className="mt-2 flex flex-col gap-1.5" aria-live="polite">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Độ mạnh mật khẩu</span>
                  <span className="font-semibold text-fg">{strengthLabel}</span>
                </div>
                <div className="flex h-1.5 gap-1 w-full">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 rounded-sm ${strength >= step ? strengthColor : "bg-line"}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <Input
            label="Nhập lại mật khẩu"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
          />

          <Button type="submit" variant="primary" className="w-full mt-1" isLoading={isLoading}>
            Đăng ký tài khoản
          </Button>
        </form>

        <div className="mt-5 pt-4 border-t border-line text-center text-sm text-muted">
          Đã có tài khoản?{" "}
          <Link
            href={loginHref}
            className="text-primary font-semibold underline underline-offset-2 hover:text-primary-hover"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
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
      <RegisterForm />
    </Suspense>
  );
}
