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
import { CheckCircle2, CircleAlert, Mail, MailCheck } from "lucide-react";

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
    correlationId?: string | null;
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
          correlationId: err instanceof ApiError ? err.correlationId : null,
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
      <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
        <header className="px-6 py-4 bg-strip/75 border-b border-line flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-selected text-primary border border-primary/10">
            <MailCheck className="w-4 h-4 text-primary" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-base font-bold text-fg">Xác minh tài khoản</h1>
            <p className="text-xs text-muted">Đang kiểm tra tính hợp lệ của liên kết…</p>
          </div>
        </header>
        <div className="p-6 flex flex-col gap-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full mt-2" />
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
        <header className="px-6 py-4 bg-strip/75 border-b border-line flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-badge-completed-bg text-success border border-success/15">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-base font-bold text-fg">Xác minh thành công</h1>
            <p className="text-xs text-muted">Tài khoản của bạn đã được kích hoạt</p>
          </div>
        </header>
        <div className="p-6 flex flex-col gap-5">
          <p className="text-sm text-muted leading-relaxed">
            Địa chỉ email của bạn đã hoàn tất kích hoạt an toàn. Bạn có thể đăng nhập ngay để thiết lập không gian doanh nghiệp.
          </p>
          <Link href={loginHref} className="block">
            <Button variant="primary" size="lg" className="w-full">
              Đăng nhập ngay
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
      <header className="px-6 py-4 bg-strip/75 border-b border-line flex items-center gap-2.5">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-badge-declined-bg text-danger border border-danger/15">
          <CircleAlert className="w-4 h-4" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-base font-bold text-fg">
            {status === "no-token" ? "Thiếu mã xác minh" : "Liên kết đã hết hạn"}
          </h1>
          <p className="text-xs text-muted">Vui lòng nhận liên kết xác thực mới</p>
        </div>
      </header>

      <div className="p-6 flex flex-col gap-5">
        <div className="text-sm text-muted">
          <p>
            {verifiedState?.errorDetail ??
              "Liên kết xác minh không còn hiệu lực hoặc đã được sử dụng trước đó. Vui lòng nhập email để nhận liên kết mới."}
          </p>
          {verifiedState?.correlationId && (
            <p className="mt-1.5 font-mono text-xs text-muted">
              Mã theo dõi: {verifiedState.correlationId}
            </p>
          )}
        </div>

        <form onSubmit={handleResend} className="flex flex-col gap-4">
          <Input
            type="email"
            label="Email đã đăng ký"
            required
            placeholder="ten@doanhnghiep.vn"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isResending}
            disabled={resendCooldown > 0 || isResending}
          >
            {resendCooldown > 0
              ? `Gửi lại sau ${resendCooldown} giây`
              : "Gửi lại email xác minh"}
          </Button>
        </form>

        <div className="pt-4 border-t border-line text-center text-sm">
          <Link
            href={loginHref}
            className="text-primary font-bold underline underline-offset-4 hover:text-primary-hover"
          >
            Quay lại trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 rounded-xl border border-line bg-surface shadow-card flex flex-col gap-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
