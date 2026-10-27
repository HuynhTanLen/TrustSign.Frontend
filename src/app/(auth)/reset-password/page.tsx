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
      setErrorMessage("Thiếu mã xác nhận đặt lại mật khẩu");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Mật khẩu mới tối thiểu 8 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu nhập lại không khớp");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      setIsSuccess(true);
      toast("Đã đổi mật khẩu thành công", "success");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Liên kết đã hết hạn hoặc không hợp lệ");
      } else {
        setErrorMessage("Lỗi hệ thống khi đặt lại mật khẩu");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-4">
        <h1 className="text-base font-semibold text-fg mb-2">Liên kết không hợp lệ</h1>
        <p className="text-xs text-muted mb-4">
          Không tìm thấy mã xác thực để đặt lại mật khẩu.
        </p>
        <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
          Yêu cầu gửi lại liên kết mới
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-2">
        <h1 className="text-base font-semibold text-fg mb-2">Đặt lại mật khẩu thành công</h1>
        <p className="text-xs text-muted mb-4">
          Mật khẩu đã được cập nhật. Hệ thống đang chuyển hướng về trang đăng nhập…
        </p>
        <Link href="/login" className="text-xs text-primary hover:underline font-medium">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-base font-semibold text-fg mb-2">Đặt lại mật khẩu</h1>
      <p className="text-xs text-muted mb-4">
        Nhập mật khẩu mới (tối thiểu 8 ký tự).
      </p>

      {errorMessage && (
        <div className="mb-4 p-2.5 rounded-[4px] border border-danger bg-[#fdf2f2] text-xs text-danger">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Mật khẩu mới"
          type="password"
          required
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <Input
          label="Nhập lại mật khẩu"
          type="password"
          required
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Lưu mật khẩu
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="py-6 text-center text-xs text-muted">Đang tải…</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
