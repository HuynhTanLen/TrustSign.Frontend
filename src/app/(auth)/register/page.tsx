"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi, type UserDto } from "@/lib/api/auth";
import { ApiError } from "@/lib/api";
import { GoogleSignIn } from "@/components/google-sign-in";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { PASSWORD_MAX_LENGTH, PASSWORD_RULE, isAcceptablePassword } from "@/lib/password-policy";
import { ArrowUpRight, CircleAlert, Loader2 } from "lucide-react";

function safeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return null;
  }
  return value;
}

function getPasswordStrength(pwd: string): number {
  let score = 0;
  if (pwd.length >= 8 && pwd.length <= PASSWORD_MAX_LENGTH) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

function getStrengthMeta(score: number): { label: string; color: string } {
  switch (score) {
    case 0:
    case 1:
      return { label: "Yếu", color: "bg-rose-500" };
    case 2:
      return { label: "Trung bình", color: "bg-amber-500" };
    case 3:
    case 4:
      return { label: "Mạnh", color: "bg-emerald-600" };
    default:
      return { label: "", color: "bg-slate-200" };
  }
}

/** Minh họa hộp thư xác minh theo phong cách tối giản gọn nhẹ. */
function MailSentIllustration() {
  return (
    <svg viewBox="0 0 96 96" className="w-20 h-20 mx-auto" fill="none" aria-hidden="true">
      <rect x="24" y="14" width="38" height="68" rx="7" fill="#F8FAFC" stroke="#1E293B" strokeWidth="3" />
      <line x1="37" y1="21" x2="49" y2="21" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="43" cy="74" r="2.2" fill="#1E293B" />
      <rect x="44" y="34" width="36" height="24" rx="4" fill="#1B4332" stroke="#1A2922" strokeWidth="2.8" />
      <path d="M46 37L62 49L78 37" stroke="#DCEBC7" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="68" y1="26" x2="78" y2="26" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="72" y1="65" x2="80" y2="65" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const redirectParam = safeRedirect(searchParams.get("redirect"));

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

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [acceptTerms, setAcceptTerms] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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

    if (!acceptTerms) {
      setErrorMessage("Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo vệ dữ liệu cá nhân.");
      return;
    }

    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length > 100) {
      setErrorMessage("Họ và tên là bắt buộc và tối đa 100 ký tự.");
      return;
    }

    if (phoneNumber.trim() && !/^(0|\+84)\d{9}$/.test(phoneNumber.trim())) {
      setErrorMessage("Số điện thoại không đúng định dạng Việt Nam (10 chữ số, bắt đầu bằng 0 hoặc +84).");
      return;
    }

    if (!isAcceptablePassword(password, email.trim(), trimmedName)) {
      setErrorMessage(PASSWORD_RULE);
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
        acceptTerms: true,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      if (redirectParam && typeof window !== "undefined") {
        window.sessionStorage.setItem("trustsign_post_verify_redirect", redirectParam);
      }
      setRegisteredEmail(res.email || email.trim());
      setIsSuccess(true);
      setResendCooldown(60);
      toast("Đăng ký tài khoản thành công. Vui lòng kiểm tra email!", "success");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "Auth.EmailAlreadyExists") {
          setErrorMessage("Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.");
        } else if (err.status === 429) {
          setErrorMessage("Bạn gửi yêu cầu đăng ký quá nhanh. Vui lòng chờ 1 phút rồi thử lại.");
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage("Không thể kết nối máy chủ API.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail || resendCooldown > 0 || isResending) return;
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
      <div className="text-center py-2">
        <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#2E3B33] mb-6">
          Xác thực tài khoản
        </p>

        <MailSentIllustration />

        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
          Kiểm tra hộp thư của bạn
        </h1>

        <p className="mt-2.5 text-sm text-[#2E3B33] leading-relaxed max-w-xs mx-auto">
          Liên kết xác minh đã được gửi đến{" "}
          <span className="font-semibold text-slate-800">{registeredEmail}</span>. Mở hộp thư và nhấn vào liên kết để kích hoạt tài khoản.
        </p>

        {process.env.NODE_ENV !== "production" && (
          <div className="mt-5 p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-[#2E3B33]">
            Môi trường thử nghiệm cục bộ: xem email tại{" "}
            <code className="font-mono font-bold text-slate-900">http://localhost:8025</code>
          </div>
        )}

        <div className="mt-7 flex flex-col items-center gap-3">
          <Link
            href={loginHref}
            className="w-full max-w-[260px] h-11 rounded-lg bg-[#1B4332] hover:bg-[#143326] text-white text-sm font-semibold inline-flex items-center justify-center shadow-sm transition-colors"
          >
            Đến trang đăng nhập
          </Link>

          <p className="text-xs text-[#2E3B33] mt-1">
            Chưa nhận được email?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              className="font-semibold text-[#1B4332] hover:underline disabled:opacity-50 cursor-pointer"
            >
              {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : isResending ? "Đang gửi..." : "Gửi lại"}
            </button>
          </p>

          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              setResendCooldown(0);
            }}
            className="text-xs text-[#2E3B33] hover:text-slate-900 underline underline-offset-4 cursor-pointer"
          >
            Nhập sai email? Đăng ký lại
          </button>
        </div>
      </div>
    );
  }

  const strength = getPasswordStrength(password);
  const { label: strengthLabel, color: strengthColor } = getStrengthMeta(strength);

  return (
    <div>
      <div className="mb-6">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#2E3B33]">
          02 / Đăng ký
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
          Tạo tài khoản mới.
        </h1>
        <p className="mt-1.5 text-sm text-[#2E3B33]">
          Khởi tạo tài khoản cá nhân trên nền tảng TrustSign.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-lg border border-rose-200 bg-rose-50 text-sm text-rose-800 flex items-start gap-2.5"
        >
          <CircleAlert className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="font-medium leading-snug">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div>
          <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-800 mb-1.5">
            Họ và tên <span className="text-rose-600">*</span>
          </label>
          <input
            id="reg-name"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Nguyễn Văn An"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-[#2E3B33] transition-all focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/15"
          />
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-800 mb-1.5">
            Email công việc <span className="text-rose-600">*</span>
          </label>
          <input
            id="reg-email"
            type="email"
            required
            autoComplete="email"
            placeholder="ten@doanhnghiep.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-[#2E3B33] transition-all focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/15"
          />
        </div>

        <div>
          <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-800 mb-1.5">
            Số điện thoại <span className="text-[#2E3B33] font-normal">(không bắt buộc)</span>
          </label>
          <input
            id="reg-phone"
            type="tel"
            autoComplete="tel"
            placeholder="0912345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-[#2E3B33] transition-all focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/15"
          />
        </div>

        <div>
          <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-800 mb-1.5">
            Mật khẩu <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Tối thiểu 8 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-lg border border-slate-300 bg-white pl-3.5 pr-14 text-sm text-slate-900 placeholder:text-[#2E3B33] transition-all focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/15"
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

          {password.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5" aria-live="polite">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#2E3B33]">Độ an toàn mật khẩu</span>
                <span className="font-semibold text-slate-800">{strengthLabel}</span>
              </div>
              <div className="flex h-1.5 gap-1.5 w-full">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full ${
                      strength >= step ? strengthColor : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="reg-confirm" className="block text-xs font-semibold text-slate-800 mb-1.5">
            Nhập lại mật khẩu <span className="text-rose-600">*</span>
          </label>
          <input
            id="reg-confirm"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-[#2E3B33] transition-all focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/15"
          />
        </div>

        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="accept-terms"
            type="checkbox"
            required
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#1B4332] cursor-pointer"
          />
          <label htmlFor="accept-terms" className="text-xs text-[#2E3B33] leading-relaxed cursor-pointer select-none">
            Tôi đồng ý với{" "}
            <span className="text-slate-800 font-semibold underline underline-offset-2">Điều khoản sử dụng</span> và{" "}
            <span className="text-slate-800 font-semibold underline underline-offset-2">
              Chính sách bảo vệ dữ liệu cá nhân (NĐ 13/2023)
            </span>.
          </label>
        </div>

        <button
          type="submit"
          disabled={!acceptTerms || isLoading}
          className="mt-1 w-full h-11 rounded-lg bg-[#1B4332] hover:bg-[#143326] disabled:opacity-50 text-white text-sm font-semibold px-4 flex items-center justify-between transition-colors cursor-pointer shadow-xs"
        >
          <span>{isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}</span>
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
        Đã có tài khoản?{" "}
        <Link
          href={loginHref}
          className="text-[#1B4332] font-bold underline underline-offset-4 hover:text-[#143326] transition-colors"
        >
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
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
      <RegisterForm />
    </Suspense>
  );
}
