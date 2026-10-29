"use client";

import * as React from "react";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { CheckCircle2, KeyRound, Mail } from "lucide-react";

// Planned endpoint (IDN-06, Tuần 5): POST /api/auth/forgot-password.
export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email.trim());
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
      <div>
        <header className="flex items-center gap-2 px-6 h-11 bg-strip border-b border-line">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
          <h1 className="text-base font-semibold text-fg">Kiểm tra hộp thư</h1>
        </header>
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-muted">
            Nếu địa chỉ <span className="font-semibold text-fg">{email}</span> tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi tới hộp thư.
          </p>
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

  return (
    <div>
      <header className="flex items-center gap-2 px-6 h-11 bg-strip border-b border-line">
        <KeyRound className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
        <h1 className="text-base font-semibold text-fg">Quên mật khẩu</h1>
      </header>

      <div className="p-6">
        <p className="text-sm text-muted mb-5">
          Nhập địa chỉ email đăng ký để nhận liên kết đặt lại mật khẩu.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            Gửi yêu cầu
          </Button>
        </form>

        <div className="mt-5 pt-4 border-t border-line text-center text-sm">
          <Link
            href="/login"
            className="text-primary font-semibold underline underline-offset-2 hover:text-primary-hover"
          >
            Quay về trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
