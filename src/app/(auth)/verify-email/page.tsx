"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();

  const [status, setStatus] = React.useState<"loading" | "success" | "expired" | "no-token">(
    token ? "loading" : "no-token",
  );
  const [resendEmail, setResendEmail] = React.useState("");
  const [isResending, setIsResending] = React.useState(false);

  React.useEffect(() => {
    if (!token) return;

    let isMounted = true;
    authApi
      .verifyEmail(token)
      .then(() => {
        if (isMounted) setStatus("success");
      })
      .catch(() => {
        if (isMounted) setStatus("expired");
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setIsResending(true);
    try {
      await authApi.resendVerification(resendEmail);
      toast("Đã gửi lại thư xác minh", "success");
    } catch {
      toast("Không thể gửi lại thư xác minh", "error");
    } finally {
      setIsResending(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="text-center py-6">
        <h1 className="text-base font-semibold text-fg mb-1">
          Đang xác minh tài khoản…
        </h1>
        <p className="text-xs text-muted">Vui lòng chờ trong giây lát</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center py-2">
        <h1 className="text-base font-semibold text-fg mb-2">
          Xác minh tài khoản thành công
        </h1>
        <p className="text-xs text-muted mb-6 leading-relaxed">
          Địa chỉ thư điện tử của bạn đã được xác thực thành công.
        </p>

        <Link href="/login" className="block w-full">
          <Button variant="primary" className="w-full">
            Đăng nhập
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-2">
      <h1 className="text-base font-semibold text-fg mb-2">
        {status === "no-token" ? "Thiếu mã xác minh" : "Liên kết đã hết hạn hoặc không hợp lệ"}
      </h1>
      <p className="text-xs text-muted mb-4 leading-relaxed">
        Vui lòng nhập địa chỉ thư điện tử để nhận liên kết xác thực mới.
      </p>

      <form onSubmit={handleResend} className="space-y-3 text-left">
        <Input
          type="email"
          label="Email đã đăng ký"
          required
          placeholder="ten@doanhnghiep.vn"
          value={resendEmail}
          onChange={(e) => setResendEmail(e.target.value)}
        />
        <Button
          type="submit"
          variant="primary"
          className="w-full text-xs"
          isLoading={isResending}
          disabled={isResending}
        >
          Gửi lại thư xác minh
        </Button>
      </form>

      <div className="mt-4 pt-4 border-t border-line">
        <Link href="/login" className="text-xs text-primary hover:underline font-medium">
          Quay lại trang đăng nhập
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="py-6 text-center text-xs text-muted">Đang tải…</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
