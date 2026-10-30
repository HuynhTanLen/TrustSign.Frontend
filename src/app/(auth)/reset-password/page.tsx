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
      <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
        <header className="px-6 py-4 bg-strip/75 border-b border-line flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-badge-declined-bg text-danger border border-danger/15">
            <CircleAlert className="w-4 h-4" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-base font-bold text-fg">Liên kết không hợp lệ</h1>
            <p className="text-xs text-muted">Thiếu thông tin xác thực</p>
          </div>
        </header>
        <div className="p-6 flex flex-col gap-5">
          <p className="text-sm text-muted">Không tìm thấy mã xác thực để đặt lại mật khẩu.</p>
          <Link href="/login" className="block">
            <Button variant="primary" className="w-full">
              Quay về trang đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
        <header className="px-6 py-4 bg-strip/75 border-b border-line flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-badge-completed-bg text-success border border-success/15">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-base font-bold text-fg">Đặt lại mật khẩu thành công</h1>
            <p className="text-xs text-muted">Đang chuyển về trang đăng nhập…</p>
          </div>
        </header>
        <div className="p-6 flex flex-col gap-5">
          <p className="text-sm text-muted">
            Mật khẩu mới đã được cập nhật thành công. Bạn có thể đăng nhập ngay bây giờ.
          </p>
          <Link href="/login" className="block">
            <Button variant="primary" className="w-full">
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
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-selected text-primary border border-primary/10">
          <KeyRound className="w-4 h-4" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-base font-bold text-fg">Đặt lại mật khẩu mới</h1>
          <p className="text-xs text-muted">Nhập mật khẩu mới an toàn tối thiểu 8 ký tự</p>
        </div>
      </header>

      <div className="p-6">
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-lg border border-danger/25 bg-badge-declined-bg text-sm text-danger flex items-start gap-3"
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
            label="Nhập lại mật khẩu mới"
            type="password"
            required
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" aria-hidden="true" />}
          />

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
            Lưu mật khẩu mới
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
        <div className="p-6 rounded-xl border border-line bg-surface shadow-card flex flex-col gap-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
