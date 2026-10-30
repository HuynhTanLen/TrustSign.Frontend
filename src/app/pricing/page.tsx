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
    <div className="min-h-screen flex flex-col bg-page text-fg">
      <PublicHeader />

      <main className="flex-1 w-full max-w-content mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-selected border border-primary/15 text-xs font-semibold text-primary mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Bảng giá dịch vụ ký hợp đồng điện tử Chữ Tín</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-fg">
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
              <Skeleton key={i} className="h-96 rounded-xl" />
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
                  className={`relative rounded-xl border flex flex-col bg-surface overflow-hidden motion-safe:animate-fade-up transition-shadow ${
                    isFeatured
                      ? "border-primary shadow-card-hover ring-2 ring-primary/20 md:-translate-y-1.5"
                      : "border-line shadow-card hover:shadow-card-hover"
                  }`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {isFeatured && (
                    <div className="bg-primary text-white text-[11px] font-bold uppercase tracking-wider py-1.5 px-4 text-center flex items-center justify-center gap-1.5 shadow-xs">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Lựa chọn phổ biến cho doanh nghiệp
                    </div>
                  )}

                  <div className="p-6 border-b border-line flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-lg font-bold text-fg">Gói {plan.name}</h2>
                      {plan.isTrial && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-badge-signing-bg text-badge-signing-fg border border-primary/20">
                          Dùng thử miễn phí
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pb-4 border-b border-line">
                      <span className="text-3xl font-extrabold text-fg tracking-tight">
                        {formatMoney(plan.price)}
                      </span>
                      <span className="ml-1 text-sm text-muted font-medium">
                        / {plan.durationDays} ngày
                      </span>
                    </div>

                    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted">
                      Quyền lợi gói bao gồm:
                    </p>

                    <ul className="mt-3 flex-1 flex flex-col gap-2.5 text-sm text-fg">
                      <li className="flex items-start gap-2.5 font-semibold text-primary">
                        <Check className="w-4 h-4 mt-0.5 text-accent shrink-0" aria-hidden="true" />
                        <span>{plan.monthlyQuota} lượt gửi ký hợp đồng / tháng</span>
                      </li>
                      {STANDARD_PERKS.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5 text-muted">
                          <Check className="w-4 h-4 mt-0.5 text-success shrink-0" aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8 pt-4">
                      <Link href={checkoutHref} className="block">
                        <Button
                          variant={isFeatured ? "primary" : "secondary"}
                          size="lg"
                          className="w-full"
                        >
                          {plan.isTrial ? "Bắt đầu dùng thử miễn phí" : `Đăng ký gói ${plan.name}`}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-strip/75 text-center text-xs text-muted flex items-center justify-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-primary" />
                    <span>Kích hoạt tự động qua VietQR SePay</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Feature Comparison Strip */}
        <div className="mt-16 p-8 rounded-2xl bg-surface border border-line shadow-card grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-selected text-primary border border-primary/10 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-fg">An toàn pháp lý 100%</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Mọi tài liệu ký đều áp dụng thuật toán băm SHA-256 và chữ ký PAdES mở chuẩn trên Adobe Reader.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-selected text-primary border border-primary/10 shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-fg">Đối soát SePay tức thời</p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Tự động kiểm tra giao dịch mỗi 5 giây ngay tại trang thanh toán và cập nhật hạn mức ngay khi nhận tiền.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-selected text-primary border border-primary/10 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-fg">Xuất hóa đơn biên lai PDF</p>
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
