"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { subscriptionApi } from "@/lib/api/subscription";
import { useApi } from "@/lib/use-api";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { PublicHeader, PublicFooter } from "@/components/public-header";
import { Skeleton } from "@/components/ui/skeleton";

const COMMON_FEATURES = ["Tối đa 5 người ký mỗi hợp đồng", "Xác thực OTP qua email", "Chữ ký số và nhật ký thao tác"];

export default function PricingPage() {
  const { data, error, isLoading, reload } = useApi("public-plans", subscriptionApi.plans);
  const plans = (data ?? []).filter((p) => p.isActive);
  const featured = plans.filter((p) => !p.isTrial).sort((a, b) => a.price - b.price)[0]?.id;

  return (
    <div className="min-h-screen flex flex-col bg-page text-fg">
      <PublicHeader />

      <main className="flex-1 w-full max-w-content mx-auto px-4 lg:px-6 py-12">
        <h1 className="text-xl font-semibold text-fg">Bảng giá</h1>
        <p className="mt-1 text-sm text-muted">
          Giá đã gồm mọi chức năng của gói. Thanh toán bằng chuyển khoản VietQR; gói được kích hoạt khi nhận tiền.
        </p>

        <div className="mt-6">
          {error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan, i) => {
                const primary = plan.id === featured;
                return (
                  <div
                    key={plan.id}
                    className={`bg-surface border rounded-md flex flex-col overflow-hidden motion-safe:animate-fade-up ${
                      primary ? "border-primary" : "border-line"
                    }`}
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <div className={`px-6 py-3 flex items-center justify-between ${primary ? "bg-primary text-white" : "bg-strip border-b border-line"}`}>
                      <h2 className="text-base font-semibold">Gói {plan.name}</h2>
                      {plan.isTrial && (
                        <span className="inline-flex items-center h-[22px] px-2 rounded-sm bg-badge-draft-bg text-badge-draft-fg text-xs font-semibold">
                          Miễn phí
                        </span>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <p className="pb-4 border-b border-line">
                        <span className="text-2xl font-semibold text-fg">{formatMoney(plan.price)}</span>
                        <span className="ml-1 text-sm text-muted">/ {plan.durationDays} ngày</span>
                      </p>
                      <ul className="mt-4 flex-1 flex flex-col gap-2 text-sm text-fg">
                        {[`${plan.monthlyQuota} hợp đồng gửi ký mỗi tháng`, ...COMMON_FEATURES].map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <Check className="w-4 h-4 mt-0.5 text-success shrink-0" aria-hidden="true" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href={plan.isTrial ? "/register" : "/app/billing"} className="mt-6 block">
                        <Button variant={primary ? "primary" : "secondary"} className="w-full">
                          {plan.isTrial ? "Bắt đầu dùng thử" : `Chọn gói ${plan.name}`}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
