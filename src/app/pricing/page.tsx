"use client";

import Link from "next/link";
import { Check, CheckCircle2, QrCode, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { subscriptionApi } from "@/lib/api/subscription";
import { useApi } from "@/lib/use-api";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Skeleton } from "@/components/ui/skeleton";

const STANDARD_PERKS = [
  "Quản lý đa doanh nghiệp và phân quyền vai trò (RBAC)",
  "Ký tuần tự đa bên tối đa 5 người ký mỗi hợp đồng",
  "Xác thực mã OTP 6 số qua email người ký",
  "Đóng dấu chữ ký số PAdES và nhật ký chuỗi băm",
  "Thanh toán chuyển khoản VietQR tự động qua SePay",
];

export default function PricingPage() {
  const { data, error, isLoading, reload } = useApi("public-plans", subscriptionApi.plans);
  const plans = (data ?? []).filter((p) => p.isActive);

  // Gói nổi bật khuyến nghị (gói trả phí thấp nhất hoặc có giá trị trung bình)
  const paidPlans = plans.filter((p) => !p.isTrial);
  const featuredPlanId = paidPlans.sort((a, b) => a.price - b.price)[0]?.id;

  return (
    <div className="min-h-screen flex flex-col bg-page text-fg overflow-x-hidden">
      <PublicHeader />

      <main className="flex-1 w-full max-w-content mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-bold text-blue-700 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
            <span>Bảng giá dịch vụ ký hợp đồng điện tử Chữ Tín</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-fg">
            Gói thuê bao minh bạch, không phí ẩn
          </h1>
          <p className="mt-3 text-muted text-sm sm:text-base leading-relaxed">
            Kích hoạt tự động ngay sau khi quét mã VietQR. Không bắt buộc thẻ tín dụng quốc tế, đối soát giao dịch tức thời qua cổng SePay.
          </p>
        </div>

        {error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan, i) => {
              const isFeatured = plan.id === featuredPlanId;
              const checkoutHref = plan.isTrial
                ? "/register"
                : `/app/billing?planId=${encodeURIComponent(plan.id)}`;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border flex flex-col bg-surface overflow-hidden motion-safe:animate-fade-up card-interactive ${
                    isFeatured
                      ? "border-blue-500 shadow-xl shadow-blue-500/10 ring-4 ring-blue-500/15 md:-translate-y-2 z-10"
                      : "border-line shadow-card hover:shadow-card-hover"
                  }`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {isFeatured && (
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-[11px] font-bold uppercase tracking-wider py-2 px-4 text-center flex items-center justify-center gap-1.5 shadow-xs">
                      <Zap className="w-3.5 h-3.5 fill-current text-amber-300" />
                      Lựa chọn phổ biến cho doanh nghiệp
                    </div>
                  )}

                  <div className="p-6 sm:p-7 border-b border-line flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-xl font-extrabold text-fg">Gói {plan.name}</h2>
                      {plan.isTrial && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Dùng thử miễn phí
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pb-4 border-b border-line">
                      <span className="text-3xl sm:text-4xl font-extrabold text-fg tracking-tight">
                        {formatMoney(plan.price)}
                      </span>
                      <span className="ml-1 text-sm text-muted font-semibold">
                        / {plan.durationDays} ngày
                      </span>
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">
                      Quyền lợi gói bao gồm:
                    </p>

                    <ul className="mt-3.5 flex-1 flex flex-col gap-3 text-sm text-fg">
                      <li className="flex items-start gap-2.5 font-bold text-blue-700">
                        <Check className="w-4 h-4 mt-0.5 text-blue-600 shrink-0" aria-hidden="true" />
                        <span>{plan.monthlyQuota} lượt gửi ký hợp đồng / tháng</span>
                      </li>
                      {STANDARD_PERKS.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-muted">
                          <Check className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8 pt-4">
                      <Link href={checkoutHref} className="block">
                        <Button
                          variant={isFeatured ? "accent" : "secondary"}
                          size="lg"
                          glow={isFeatured}
                          className="w-full"
                        >
                          {plan.isTrial ? "Bắt đầu dùng thử miễn phí" : `Đăng ký gói ${plan.name}`}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-strip/75 text-center text-xs text-muted flex items-center justify-center gap-1.5 font-medium">
                    <QrCode className="w-3.5 h-3.5 text-blue-600" />
                    <span>Kích hoạt tự động qua VietQR SePay</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Feature Comparison Strip */}
        <div className="mt-16 p-8 rounded-2xl bg-surface border border-line shadow-card grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-fg group-hover:text-primary transition-colors">An toàn pháp lý 100%</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Mọi tài liệu ký đều áp dụng thuật toán băm SHA-256 và chữ ký PAdES mở chuẩn trên Adobe Reader.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-fg group-hover:text-primary transition-colors">Đối soát SePay tức thời</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Tự động kiểm tra giao dịch mỗi 5 giây ngay tại trang thanh toán và cập nhật hạn mức ngay khi nhận tiền.
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-violet-50 text-violet-600 border border-violet-200/80 shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-fg group-hover:text-primary transition-colors">Xuất hóa đơn biên lai PDF</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Hệ thống tự động tạo file biên lai hóa đơn định dạng PDF kèm mã giao dịch để doanh nghiệp lưu trữ thuế.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
