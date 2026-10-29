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
import { CheckCircle2, CircleAlert, KeyRound, Lock } from "lucide-react";

// Planned endpoint (IDN-06, Tuần 5): POST /api/auth/reset-password.
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage("Thiếu mã xác nhận đặt lại mật khẩu.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Mật khẩu mới tối thiểu 8 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu nhập lại không khớp.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      setIsSuccess(true);
      toast("Đã đặt lại mật khẩu", "success");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Liên kết đã hết hạn hoặc không hợp lệ.");
      } else {
        setErrorMessage("Không kết nối được máy chủ API.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div>
        <header className="flex items-center gap-2 px-6 h-11 bg-strip border-b border-line">
          <CircleAlert className="w-4 h-4 text-danger shrink-0" aria-hidden="true" />
          <h1 className="text-base font-semibold text-fg">Liên kết không hợp lệ</h1>
        </header>
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-muted">Không tìm thấy mã xác thực để đặt lại mật khẩu.</p>
          <Link
            href="/login"
            className="text-sm text-primary font-semibold underline underline-offset-2 hover:text-primary-hover"
          >
            Quay về trang đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div>
        <header className="flex items-center gap-2 px-6 h-11 bg-strip border-b border-line">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
          <h1 className="text-base font-semibold text-fg">Đặt lại mật khẩu thành công</h1>
        </header>
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-muted">
            Mật khẩu đã được cập nhật. Hệ thống đang chuyển về trang đăng nhập…
          </p>
          <Link
            href="/login"
            className="text-sm text-primary font-semibold underline underline-offset-2 hover:text-primary-hover"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="flex items-center gap-2 px-6 h-11 bg-strip border-b border-line">
        <KeyRound className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
        <h1 className="text-base font-semibold text-fg">Đặt lại mật khẩu</h1>
      </header>

      <div className="p-6">
        <p className="text-sm text-muted mb-5">Nhập mật khẩu mới tối thiểu 8 ký tự.</p>

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-md border border-line bg-badge-declined-bg text-sm text-danger flex items-start gap-2"
          >
            <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Mật khẩu mới"
            type="password"
            required
            placeholder="Tối thiểu 8 ký tự"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
          />

          <Input
            label="Nhập lại mật khẩu"
            type="password"
            required
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Lưu mật khẩu
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 flex flex-col gap-3">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
