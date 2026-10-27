"use client";

import * as React from "react";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      setIsSubmitted(true);
      toast("Đã gửi hướng dẫn đặt lại mật khẩu", "success");
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-2">
        <h1 className="text-base font-semibold text-fg mb-2">Kiểm tra hộp thư</h1>
        <p className="text-xs text-muted leading-relaxed mb-4">
          Nếu địa chỉ <strong>{email}</strong> tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến bạn.
        </p>
        <Link href="/login" className="text-xs text-primary hover:underline font-medium">
          Quay về trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-base font-semibold text-fg mb-2">Quên mật khẩu</h1>
      <p className="text-xs text-muted mb-4">
        Nhập địa chỉ email đăng ký để nhận liên kết đặt lại mật khẩu.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="ten@doanhnghiep.vn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Gửi yêu cầu
        </Button>
      </form>

      <div className="mt-4 pt-4 border-t border-line text-center">
        <Link href="/login" className="text-xs text-primary hover:underline font-medium">
          Quay về trang đăng nhập
        </Link>
      </div>
    </div>
  );
}
