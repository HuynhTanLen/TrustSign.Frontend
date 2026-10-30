"use client";

import * as React from "react";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { CheckCircle2, KeyRound, Mail } from "lucide-react";

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
      <div className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
        <header className="px-6 py-4 bg-strip/75 border-b border-line flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-badge-completed-bg text-success border border-success/15">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-base font-bold text-fg">Kiểm tra hộp thư</h1>
            <p className="text-xs text-muted">Hướng dẫn khôi phục mật khẩu</p>
          </div>
        </header>
        <div className="p-6 flex flex-col gap-5">
          <p className="text-sm text-muted leading-relaxed">
            Nếu địa chỉ <span className="font-bold text-fg">{email}</span> tồn tại trong hệ thống, liên kết đặt lại mật khẩu đã được gửi tới hộp thư của bạn.
          </p>
          <Link href="/login" className="block">
            <Button variant="primary" className="w-full">
              Quay về trang đăng nhập
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
          <h1 className="text-base font-bold text-fg">Quên mật khẩu</h1>
          <p className="text-xs text-muted">Khôi phục quyền truy cập vào tài khoản</p>
        </div>
      </header>

      <div className="p-6">
        <p className="text-sm text-muted mb-5 leading-relaxed">
          Nhập địa chỉ email đăng ký tài khoản để nhận liên kết xác thực đặt lại mật khẩu mới.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email tài khoản"
            type="email"
            required
            autoComplete="email"
            placeholder="ten@doanhnghiep.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
          />

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
            Gửi liên kết khôi phục
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-line text-center text-sm">
          <Link
            href="/login"
            className="text-primary font-bold underline underline-offset-4 hover:text-primary-hover"
          >
            Quay về trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
