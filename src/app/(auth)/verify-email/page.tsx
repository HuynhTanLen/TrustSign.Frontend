"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

const verificationRequests = new Map<string, Promise<{ success: boolean; message: string }>>();

function verifyTokenOnce(token: string) {
  let req = verificationRequests.get(token);
  if (!req) {
    req = authApi.verifyEmail(token);
    verificationRequests.set(token, req);
  }
  return req;
}

const emptySubscribe = () => () => {};

function getLoginHrefClient(): string {
  const savedRedirect = window.sessionStorage.getItem("trustsign_post_verify_redirect");
  if (savedRedirect && savedRedirect.startsWith("/") && !savedRedirect.startsWith("//")) {
    return `/login?redirect=${encodeURIComponent(savedRedirect)}`;
  }
  return "/login";
}

/** Minh họa chúc mừng hoàn tất xác thực (phong cách tối giản giống mẫu 2). */
function VerifiedCelebrationIllustration() {
  return (
    <svg viewBox="0 0 96 96" className="w-20 h-20 mx-auto" fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="36" fill="#FEF3C7" opacity="0.5" />
      <path d="M35 28L41 50C42 54 38 58 34 59C30 60 26 57 25 53L21 31L35 28Z" fill="#FCD34D" stroke="#1E293B" strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M34 59L37 74M31 75L43 73" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M61 28L55 50C54 54 58 58 62 59C66 60 70 57 71 53L75 31L61 28Z" fill="#FCD34D" stroke="#1E293B" strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M62 59L59 74M53 73L65 75" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="48" y1="14" x2="48" y2="21" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="39" y1="17" x2="42" y2="23" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="57" y1="17" x2="54" y2="23" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Minh họa cần nhận lại liên kết xác minh (phong cách tối giản giống mẫu 2). */
function ResendMailIllustration() {
  return (
    <svg viewBox="0 0 96 96" className="w-20 h-20 mx-auto" fill="none" aria-hidden="true">
      <rect x="24" y="14" width="38" height="68" rx="7" fill="#F5F4EF" stroke="#1A2922" strokeWidth="3" />
      <line x1="37" y1="21" x2="49" y2="21" stroke="#1A2922" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="43" cy="74" r="2.2" fill="#1A2922" />
      <rect x="44" y="34" width="36" height="24" rx="4" fill="#1B4332" stroke="#1A2922" strokeWidth="2.8" />
      <path d="M46 37L62 49L78 37" stroke="#DCEBC7" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();

  const loginHref = React.useSyncExternalStore(
    emptySubscribe,
    getLoginHrefClient,
    () => "/login",
  );

  const [verifiedState, setVerifiedState] = React.useState<{
    token: string;
    outcome: "success" | "expired";
    errorDetail?: string;
  } | null>(null);

  const [resendEmail, setResendEmail] = React.useState("");
  const [isResending, setIsResending] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  React.useEffect(() => {
    if (!token) return;

    let isMounted = true;
    verifyTokenOnce(token)
      .then(() => {
        if (isMounted) {
          setVerifiedState({ token, outcome: "success" });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setVerifiedState({
          token,
          outcome: "expired",
          errorDetail: err instanceof ApiError ? err.message : undefined,
        });
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const status: "loading" | "success" | "expired" | "no-token" = !token
    ? "no-token"
    : verifiedState?.token === token
    ? verifiedState.outcome
    : "loading";

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim() || resendCooldown > 0) return;

    setIsResending(true);
    try {
      await authApi.resendVerification(resendEmail.trim());
      setResendCooldown(60);
      toast("Đã gửi lại email xác minh", "success");
    } catch {
      toast("Không thể gửi lại email xác minh", "error");
    } finally {
      setIsResending(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="text-center py-6">
        <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#2E3B33] mb-6">
          Xác thực tài khoản
        </p>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-[#EFF5E8] text-[#1B4332]">
          <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
          Đang xác minh email…
        </h1>
        <p className="mt-2 text-sm text-[#2E3B33]">
          Hệ thống đang kiểm tra tính hợp lệ của liên kết xác thực.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center py-2">
        <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#2E3B33] mb-6">
          Xác thực tài khoản
        </p>

        <VerifiedCelebrationIllustration />

        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
          Xác minh email hoàn tất
        </h1>

        <p className="mt-2.5 text-sm text-[#2E3B33] leading-relaxed max-w-xs mx-auto">
          Tài khoản của bạn đã được kích hoạt thành công. Bạn có thể đăng nhập ngay để bắt đầu sử dụng TrustSign.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href={loginHref}
            className="w-full max-w-[240px] h-11 rounded-lg bg-[#1B4332] hover:bg-[#143326] text-white text-sm font-semibold inline-flex items-center justify-center shadow-sm transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-2">
      <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#2E3B33] mb-6">
        Xác thực tài khoản
      </p>

      <ResendMailIllustration />

      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
        {status === "no-token" ? "Thiếu mã xác minh" : "Liên kết đã hết hạn"}
      </h1>

      <p className="mt-2 text-sm text-[#2E3B33] leading-relaxed max-w-xs mx-auto">
        {verifiedState?.errorDetail ??
          "Liên kết không còn hiệu lực hoặc đã được sử dụng. Nhập email đã đăng ký để nhận liên kết mới."}
      </p>

      <form onSubmit={handleResend} className="mt-6 flex flex-col items-center gap-4">
        <input
          type="email"
          required
          placeholder="Nhập email đã đăng ký"
          value={resendEmail}
          onChange={(e) => setResendEmail(e.target.value)}
          className="w-full max-w-[300px] h-11 border-b-2 border-slate-200 focus:border-[#1B4332] bg-transparent px-2 text-center text-sm text-[#1A2922] placeholder:text-[#2E3B33] focus:outline-none transition-colors"
        />

        <button
          type="submit"
          disabled={resendCooldown > 0 || isResending}
          className="w-full max-w-[240px] h-11 rounded-lg bg-[#1B4332] hover:bg-[#143326] disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center justify-center shadow-sm transition-colors cursor-pointer"
        >
          {resendCooldown > 0
            ? `Gửi lại sau ${resendCooldown} giây`
            : isResending
            ? "Đang gửi..."
            : "Gửi lại email xác minh"}
        </button>
      </form>

      <div className="mt-6">
        <Link
          href={loginHref}
          className="text-xs font-semibold text-[#2E3B33] hover:text-slate-900 underline underline-offset-4 transition-colors"
        >
          Quay lại trang đăng nhập
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-4 py-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-11 w-56 rounded-full" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
