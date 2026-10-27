"use client";

import * as React from "react";
import Link from "next/link";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { User, Mail, Lock, CheckCircle2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const { toast } = useToast();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [isSuccess, setIsSuccess] = React.useState(false);
  const [registeredEmail, setRegisteredEmail] = React.useState("");
  const [resendCooldown, setResendCooldown] = React.useState(0);

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return { label: "Yếu", color: "bg-danger" };
      case 2:
        return { label: "Trung bình", color: "bg-warning" };
      case 3:
      case 4:
        return { label: "Mạnh", color: "bg-success" };
      default:
        return { label: "", color: "bg-line" };
    }
  };

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (fullName.trim().length > 100) {
      setErrorMessage("Họ và tên tối đa 100 ký tự");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Mật khẩu tối thiểu 8 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu nhập lại không khớp");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.register({ fullName, email, password });
      setRegisteredEmail(res.email || email);
      setIsSuccess(true);
      setResendCooldown(60);
      toast("Đăng ký thành công", "success");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Đăng ký không thành công");
      } else {
        setErrorMessage("Không thể kết nối tới máy chủ API. Vui lòng kiểm tra backend đang chạy ở cổng 5050.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authApi.resendVerification(registeredEmail);
      setResendCooldown(60);
      toast("Đã gửi lại thư xác minh", "success");
    } catch {
      toast("Không thể gửi lại thư xác minh", "error");
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Kiểm tra email để xác minh tài khoản
        </h1>
        <p className="text-sm text-muted mb-6 leading-relaxed">
          Chúng tôi đã gửi liên kết xác thực đến địa chỉ <strong>{registeredEmail}</strong>.
          Vui lòng mở hộp thư (Mailpit: <code className="text-xs">http://localhost:8025</code> ở máy phát triển) và nhấn nút kích hoạt tài khoản.
        </p>

        <div className="space-y-3">
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            disabled={resendCooldown > 0}
            onClick={handleResend}
          >
            {resendCooldown > 0
              ? `Gửi lại sau ${resendCooldown} giây`
              : "Gửi lại email xác minh"}
          </Button>

          <Link href="/login" className="block">
            <Button variant="primary" size="md" className="w-full">
              Đến trang đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { label: strengthLabel, color: strengthColor } = getStrengthLabel(strength);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Đăng ký tài khoản</h1>
        <p className="text-sm text-muted mt-1">Bắt đầu dùng thử miễn phí 14 ngày dịch vụ ký kết</p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl border border-danger/30 bg-rose-50 text-sm text-danger font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Họ và tên"
          required
          maxLength={100}
          placeholder="Nguyễn Văn An"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Email công việc"
          type="email"
          required
          autoComplete="email"
          placeholder="ten@doanhnghiep.vn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <div>
          <Input
            label="Mật khẩu"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Tối thiểu 8 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          {password.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Độ mạnh mật khẩu:</span>
                <span className="font-semibold text-slate-800">{strengthLabel}</span>
              </div>
              <div className="flex h-2 gap-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 transition-all ${
                      strength >= step ? strengthColor : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Input
          label="Nhập lại mật khẩu"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
          disabled={isLoading}
        >
          <span>Tạo tài khoản mới</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-line text-center text-sm text-muted">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-primary hover:underline font-semibold">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
