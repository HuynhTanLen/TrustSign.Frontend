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

// Tránh gọi trùng một token dùng 1 lần khi React 19 chạy hiệu ứng 2 lần ở chế độ phát triển.
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
      <div>
        <header className="flex items-center gap-2 px-6 h-11 bg-strip border-b border-line">
          <MailCheck className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          <h1 className="text-base font-semibold text-fg">Xác minh tài khoản</h1>
        </header>
        <div className="p-6 flex flex-col gap-3">
          <p className="text-sm text-muted">Đang kiểm tra liên kết xác minh tài khoản…</p>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-9 w-full mt-2" />
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div>
        <header className="flex items-center gap-2 px-6 h-11 bg-strip border-b border-line">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
          <h1 className="text-base font-semibold text-fg">Xác minh tài khoản thành công</h1>
        </header>
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-muted">
            Địa chỉ email của bạn đã được kích hoạt. Bạn có thể đăng nhập để bắt đầu sử dụng hệ thống.
          </p>
          <Link href={loginHref} className="block">
            <Button variant="primary" className="w-full">
              Đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="flex items-center gap-2 px-6 h-11 bg-strip border-b border-line">
        <CircleAlert className="w-4 h-4 text-danger shrink-0" aria-hidden="true" />
        <h1 className="text-base font-semibold text-fg">
          {status === "no-token" ? "Thiếu mã xác minh" : "Liên kết xác minh hết hạn hoặc không hợp lệ"}
        </h1>
      </header>

      <div className="p-6 flex flex-col gap-4">
        <div className="text-sm text-muted">
          <p>
            {verifiedState?.errorDetail ??
              "Liên kết xác minh không còn hiệu lực hoặc đã được sử dụng trước đó. Nhập địa chỉ email đăng ký để nhận liên kết mới."}
          </p>
          {verifiedState?.correlationId && (
            <p className="mt-1 font-mono text-xs text-muted">
              Mã theo dõi: {verifiedState.correlationId}
            </p>
          )}
        </div>

        <form onSubmit={handleResend} className="flex flex-col gap-3">
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
            className="w-full"
            isLoading={isResending}
            disabled={resendCooldown > 0 || isResending}
          >
            {resendCooldown > 0
              ? `Gửi lại sau ${resendCooldown} giây`
              : "Gửi lại email xác minh"}
          </Button>
        </form>

        <div className="pt-3 border-t border-line text-center text-sm">
          <Link
            href={loginHref}
            className="text-primary font-semibold underline underline-offset-2 hover:text-primary-hover"
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
        <div className="p-6 flex flex-col gap-3">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-9 w-full" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
