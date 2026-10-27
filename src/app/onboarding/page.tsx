"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { authApi, UserDto } from "@/lib/api/auth";
import { tenantsApi } from "@/lib/api/tenants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Building2, FileText, MapPin, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = React.useState<UserDto | null>(null);
  const [companyName, setCompanyName] = React.useState("");
  const [taxCode, setTaxCode] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    authApi
      .me()
      .then((data) => {
        if (isMounted) setCurrentUser(data);
      })
      .catch(() => {
        if (isMounted) router.replace("/login?redirect=%2Fonboarding");
      });
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await tenantsApi.create({
        name: companyName,
        taxCode: taxCode || undefined,
        address: address || undefined,
        contactEmail: contactEmail || undefined,
      });

      toast("Tạo doanh nghiệp thành công", "success");
      router.push("/app");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Không thể tạo doanh nghiệp");
      } else {
        setError("Không thể kết nối tới máy chủ API. Vui lòng kiểm tra backend đang chạy ở cổng 5050.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-page text-fg">
      <div className="sm:mx-auto sm:w-full sm:max-w-[520px]">
        {currentUser?.role === "Admin" && (
          <div className="mb-5 p-3.5 rounded-xl border border-indigo-200 bg-primary-light/70 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-800">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Tài khoản Quản trị viên không bắt buộc tạo doanh nghiệp.</span>
            </div>
            <Link
              href="/admin"
              className="text-primary font-semibold hover:underline shrink-0"
            >
              Vào /admin →
            </Link>
          </div>
        )}

        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-light border border-indigo-200 text-primary flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Tạo doanh nghiệp đầu tiên
          </h1>
          <p className="text-sm text-muted mt-1.5">
            Thiết lập thông tin pháp nhân để kích hoạt không gian ký số. Doanh nghiệp mới được tặng ngay{" "}
            <strong className="text-primary">Gói Dùng thử 14 ngày</strong>.
          </p>
        </div>

        <div className="bg-surface py-8 px-6 sm:px-9 border border-line rounded-2xl shadow-sm">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl border border-danger/30 bg-rose-50 text-sm text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Tên doanh nghiệp / Tổ chức"
              required
              maxLength={200}
              placeholder="Công ty TNHH Giải pháp Phần mềm..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              leftIcon={<Building2 className="w-4 h-4" />}
            />

            <Input
              label="Mã số thuế"
              placeholder="0101234567 (không bắt buộc)"
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
              leftIcon={<FileText className="w-4 h-4" />}
            />

            <Input
              label="Địa chỉ trụ sở"
              placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
            />

            <Input
              label="Email liên hệ chính thức"
              type="email"
              placeholder="lienhe@doanhnghiep.vn"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                <span>Hoàn tất & Vào Bảng điều khiển</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
