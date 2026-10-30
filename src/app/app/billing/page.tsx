"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Check,
  CircleCheck,
  Copy,
  CreditCard,
  Download,
  Package,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { subscriptionApi, type Checkout, type Invoice, type Plan } from "@/lib/api/subscription";
import { ApiError } from "@/lib/api";
import { USE_MOCK } from "@/lib/mock";
import { useApi } from "@/lib/use-api";
import { daysUntil, formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/chart";
import { Dialog } from "@/components/ui/dialog";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

const INVOICE_STATUS: Record<Invoice["status"], { label: string; className: string }> = {
  Paid: { label: "Đã thanh toán", className: "bg-badge-completed-bg text-badge-completed-fg" },
  Pending: { label: "Chờ thanh toán", className: "bg-badge-pending-bg text-badge-pending-fg" },
  Expired: { label: "Hết hạn", className: "bg-badge-draft-bg text-badge-draft-fg" },
};

function useCountdown(expiresAt: string | null) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  if (!expiresAt) return "";
  const totalSeconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function BillingContent() {
  const searchParams = useSearchParams();
  const targetPlanId = searchParams.get("planId");

  const { toast } = useToast();
  const current = useApi("subscription", subscriptionApi.current);
  const plans = useApi("plans", subscriptionApi.plans);
  const invoices = useApi("invoices", subscriptionApi.invoices);

  const [checkoutPlan, setCheckoutPlan] = React.useState<Plan | null>(null);
  const [checkout, setCheckout] = React.useState<Checkout | null>(null);
  const [paid, setPaid] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [downloadingCode, setDownloadingCode] = React.useState<string | null>(null);

  const countdown = useCountdown(checkout?.expiresAt ?? null);

  const openCheckout = React.useCallback(async (plan: Plan) => {
    setCheckoutPlan(plan);
    setCheckout(null);
    setPaid(false);
    try {
      const res = await subscriptionApi.createInvoice(plan.id);
      setCheckout(res);
    } catch (err) {
      setCheckoutPlan(null);
      toast(err instanceof ApiError ? err.message : "Không tạo được hóa đơn thanh toán.", "error");
    }
  }, [toast]);

  // Nếu người dùng chuyển từ /pricing sang kèm ?planId=... thì tự động kích hoạt checkout
  const handledTargetRef = React.useRef(false);
  React.useEffect(() => {
    if (handledTargetRef.current || !targetPlanId || !plans.data) return;
    const found = plans.data.find((p) => p.id === targetPlanId && p.isActive && !p.isTrial);
    if (found) {
      handledTargetRef.current = true;
      const timer = setTimeout(() => {
        openCheckout(found);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [targetPlanId, plans.data, openCheckout]);

  // Tự động kiểm tra trạng thái hóa đơn mỗi 5 giây qua SePay
  React.useEffect(() => {
    if (!checkout || paid) return;
    const t = setInterval(async () => {
      try {
        const { status } = await subscriptionApi.invoiceStatus(checkout.invoiceCode);
        if (status === "Paid") {
          setPaid(true);
        }
      } catch {
        // bỏ qua lỗi kiểm tra ngầm
      }
    }, 5000);
    return () => clearInterval(t);
  }, [checkout, paid]);

  const closeCheckout = () => {
    if (paid) {
      current.reload();
      invoices.reload();
    }
    setCheckoutPlan(null);
    setCheckout(null);
    setCopiedKey(null);
  };

  const copy = (value: string, key: string, label: string) => {
    navigator.clipboard?.writeText(value);
    setCopiedKey(key);
    toast(`Đã sao chép ${label}.`, "info");
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const handleDownloadPdf = async (code: string) => {
    if (USE_MOCK) {
      toast("Dữ liệu mẫu không hỗ trợ xuất PDF.", "info");
      return;
    }
    setDownloadingCode(code);
    toast("Đang tải biên lai hóa đơn...", "info");
    try {
      const blob = await subscriptionApi.downloadInvoicePdf(code);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `TrustSign-Invoice-${code}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast("Tải hóa đơn thành công.", "success");
    } catch {
      toast("Không thể tải file PDF hóa đơn.", "error");
    } finally {
      setDownloadingCode(null);
    }
  };

  const sub = current.data;
  const daysLeft = sub ? daysUntil(sub.expiresAt) : 0;
  const quotaRatio = sub ? sub.quotaUsed / Math.max(1, sub.quotaLimit) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Gói dịch vụ & Thanh toán"
        description="Quản lý hạn mức hợp đồng, nâng cấp gói và đối soát thanh toán chuyển khoản VietQR tự động qua SePay"
      />

      {/* Current Subscription Card */}
      {current.error ? (
        <ErrorState error={current.error} onRetry={current.reload} />
      ) : (
        <Card title="Gói thuê bao hiện tại" icon={CreditCard}>
          {!sub ? (
            <Skeleton className="h-32 rounded-lg" />
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xl font-bold text-fg">Gói {sub.planName}</span>
                    <Badge subscriptionStatus={sub.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    Hết hạn: <span className="font-semibold text-fg">{formatDate(sub.expiresAt)}</span>{" "}
                    ({daysLeft > 0 ? `còn ${daysLeft} ngày hiệu lực` : "đã hết hạn"}) · Giá chu kỳ:{" "}
                    <span className="font-semibold text-fg">{formatMoney(sub.price)}</span> / {sub.durationDays} ngày
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => {
                    const plan = plans.data?.find((p) => p.id === sub.planId && !p.isTrial);
                    if (plan) openCheckout(plan);
                  }}
                  disabled={!plans.data || sub.status === "Trial"}
                  title={sub.status === "Trial" ? "Gói dùng thử không gia hạn, vui lòng chọn nâng cấp gói bên dưới" : undefined}
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  Gia hạn gói này
                </Button>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-fg mb-1.5">
                  <span>Hạn mức hợp đồng đã gửi trong tháng</span>
                  <span className="font-bold tabular-nums">
                    {sub.quotaUsed} / {sub.quotaLimit} lượt
                  </span>
                </div>
                <Progress
                  value={sub.quotaUsed}
                  max={sub.quotaLimit}
                  tone={quotaRatio >= 0.9 ? "danger" : quotaRatio >= 0.75 ? "warning" : "primary"}
                  label="Hạn mức hợp đồng đã dùng"
                />
              </div>

              {(daysLeft < 7 || quotaRatio >= 0.85) && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-badge-pending-bg/90 border border-warning/30 text-xs sm:text-sm text-badge-pending-fg motion-safe:animate-fade-in shadow-xs">
                  <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-warning" aria-hidden="true" />
                  <div className="leading-relaxed">
                    {daysLeft < 7 && <span>Gói dịch vụ chỉ còn {Math.max(0, daysLeft)} ngày hiệu lực. </span>}
                    {quotaRatio >= 0.85 && (
                      <span>Chỉ còn {Math.max(0, sub.quotaLimit - sub.quotaUsed)} lượt gửi hợp đồng trong tháng này. </span>
                    )}
                    <span>Gia hạn hoặc chuyển đổi sang gói cao hơn bên dưới để hoạt động ký kết không bị gián đoạn.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Available Plans Grid */}
      <Card title="Các gói dịch vụ khả dụng" icon={Package}>
        {plans.error ? (
          <ErrorState error={plans.error} onRetry={plans.reload} />
        ) : !plans.data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.data
              .filter((p) => p.isActive)
              .map((p) => {
                const isCurrent = p.id === sub?.planId;
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border p-5 flex flex-col justify-between transition-all ${
                      isCurrent
                        ? "border-primary bg-selected/50 shadow-card ring-1 ring-primary/20"
                        : "border-line bg-surface hover:shadow-card"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-fg">Gói {p.name}</h3>
                        {isCurrent ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold">
                            Đang dùng
                          </span>
                        ) : p.isTrial ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-badge-draft-bg text-badge-draft-fg text-[11px] font-semibold">
                            Dùng thử
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 pb-3 border-b border-line">
                        <span className="text-2xl font-extrabold text-fg">{formatMoney(p.price)}</span>
                        <span className="ml-1 text-xs text-muted font-medium">/ {p.durationDays} ngày</span>
                      </div>

                      <ul className="mt-4 flex flex-col gap-2 text-xs sm:text-sm text-fg">
                        <li className="flex items-center gap-2 font-semibold text-primary">
                          <Check className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                          <span>{p.monthlyQuota} hợp đồng gửi ký mỗi tháng</span>
                        </li>
                        <li className="flex items-center gap-2 text-muted">
                          <Check className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                          <span>Tối đa 5 bên ký mỗi hợp đồng</span>
                        </li>
                        <li className="flex items-center gap-2 text-muted">
                          <Check className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                          <span>Chuẩn chữ ký số PAdES & OTP email</span>
                        </li>
                      </ul>
                    </div>

                    <Button
                      className="mt-6 w-full"
                      variant={isCurrent ? "primary" : "secondary"}
                      disabled={p.isTrial}
                      onClick={() => openCheckout(p)}
                    >
                      {p.isTrial
                        ? "Gói tặng kèm khi tạo tổ chức"
                        : isCurrent
                        ? "Gia hạn gói này"
                        : `Chuyển sang gói ${p.name}`}
                    </Button>
                  </div>
                );
              })}
          </div>
        )}
      </Card>

      {/* Invoice History Table */}
      <Card title="Lịch sử hóa đơn & Biên lai thanh toán" icon={Receipt} bodyClassName="p-0">
        {invoices.error ? (
          <div className="p-5">
            <ErrorState error={invoices.error} onRetry={invoices.reload} />
          </div>
        ) : (
          <Table
            bare
            loading={invoices.isLoading}
            rows={invoices.data ?? []}
            getRowKey={(i) => i.code}
            empty={<p className="p-6 text-sm text-muted text-center">Chưa có hóa đơn nào.</p>}
            columns={[
              {
                key: "code",
                header: "Mã hóa đơn",
                primary: true,
                render: (i) => <span className="font-mono font-bold text-fg">{i.code}</span>,
              },
              { key: "plan", header: "Gói dịch vụ", render: (i) => `Gói ${i.planName}` },
              {
                key: "amount",
                header: "Số tiền",
                align: "right",
                render: (i) => <span className="font-bold">{formatMoney(i.amount)}</span>,
              },
              {
                key: "status",
                header: "Trạng thái",
                render: (i) => (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      INVOICE_STATUS[i.status].className
                    }`}
                  >
                    {INVOICE_STATUS[i.status].label}
                  </span>
                ),
              },
              { key: "date", header: "Ngày khởi tạo", render: (i) => formatDateTime(i.createdAt) },
              {
                key: "pdf",
                header: "Thao tác",
                align: "right",
                render: (i) =>
                  i.status === "Paid" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      isLoading={downloadingCode === i.code}
                      onClick={() => handleDownloadPdf(i.code)}
                      className="text-primary hover:bg-selected"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                      Tải PDF
                    </Button>
                  ) : null,
              },
            ]}
          />
        )}
      </Card>

      {/* Signature SePay VietQR Checkout Modal */}
      <Dialog
        open={checkoutPlan !== null}
        onClose={closeCheckout}
        title={paid ? "Thanh toán thành công" : `Thanh toán VietQR – Gói ${checkoutPlan?.name ?? ""}`}
        className="max-w-[520px]"
        footer={
          paid ? (
            <Button variant="primary" size="lg" className="w-full" onClick={closeCheckout}>
              Đóng và cập nhật hạn mức
            </Button>
          ) : (
            <div className="flex items-center justify-between w-full">
              {USE_MOCK && checkout ? (
                <Button variant="secondary" size="sm" onClick={() => setPaid(true)}>
                  Giả lập đã chuyển khoản
                </Button>
              ) : (
                <span className="text-xs text-muted">Hóa đơn có hiệu lực trong 24 giờ</span>
              )}
              <Button variant="secondary" onClick={closeCheckout}>
                Đóng
              </Button>
            </div>
          )
        }
      >
        {paid ? (
          <div className="flex flex-col items-center text-center gap-3 py-6 motion-safe:animate-pop-in">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-badge-completed-bg text-success border border-success/20 shadow-xs">
              <CircleCheck className="w-8 h-8" aria-hidden="true" />
            </span>
            <h3 className="text-lg font-bold text-fg">Gói {checkoutPlan?.name} đã được kích hoạt!</h3>
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              Hệ thống SePay đã ghi nhận thành công thanh toán cho hóa đơn{" "}
              <span className="font-mono font-bold text-fg">{checkout?.invoiceCode}</span>. Hạn mức hợp đồng đã sẵn sàng để sử dụng.
            </p>
          </div>
        ) : !checkout ? (
          <div className="flex flex-col gap-4 py-4">
            <Skeleton className="h-48 w-48 mx-auto rounded-xl" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
        ) : (
          <div className="flex flex-col gap-5 text-sm">
            {/* VietQR Frame */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative p-2.5 rounded-2xl bg-white border border-line shadow-card">
                <div className="w-48 h-48 rounded-xl bg-page flex items-center justify-center overflow-hidden">
                  {checkout.qrImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={checkout.qrImageUrl}
                      alt={`Mã VietQR thanh toán hóa đơn ${checkout.invoiceCode}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="px-4 text-center text-xs text-muted">
                      Đang kết nối cổng SePay để tạo mã QR…
                    </span>
                  )}
                </div>
              </div>

              {/* Status & Countdown Pill */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-selected border border-primary/15 text-xs text-primary font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Đang tự động đối soát SePay · còn {countdown}</span>
              </div>
            </div>

            {/* Transfer Details with 1-click Copy */}
            <dl className="rounded-xl border border-line bg-surface shadow-xs divide-y divide-line overflow-hidden">
              {[
                { label: "Ngân hàng nhận", value: checkout.bankName, key: "bank" },
                {
                  label: "Số tài khoản",
                  value: checkout.bankAccount,
                  copyValue: checkout.bankAccount,
                  key: "acc",
                  mono: true,
                  hint: "số tài khoản",
                },
                {
                  label: "Số tiền chuyển",
                  value: formatMoney(checkout.amount),
                  copyValue: String(checkout.amount),
                  key: "amt",
                  mono: true,
                  hint: "số tiền",
                },
                {
                  label: "Nội dung chuyển khoản",
                  value: checkout.invoiceCode,
                  copyValue: checkout.invoiceCode,
                  key: "memo",
                  mono: true,
                  hint: "nội dung chuyển khoản",
                  highlight: true,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between gap-3 px-4 py-2.5 text-xs sm:text-sm ${
                    row.highlight ? "bg-amber-500/5 font-semibold" : ""
                  }`}
                >
                  <dt className="text-muted font-medium">{row.label}</dt>
                  <dd className="flex items-center gap-2">
                    <span className={`text-fg ${row.mono ? "font-mono font-bold" : "font-semibold"}`}>
                      {row.value}
                    </span>
                    {row.copyValue && (
                      <button
                        type="button"
                        onClick={() => copy(row.copyValue!, row.key, row.hint!)}
                        className={`inline-flex items-center justify-center h-7 px-2 rounded-md border text-xs cursor-pointer transition-colors ${
                          copiedKey === row.key
                            ? "bg-badge-completed-bg text-success border-success/30 font-bold"
                            : "bg-surface border-line text-muted hover:text-fg hover:bg-strip"
                        }`}
                        aria-label={`Sao chép ${row.hint}`}
                      >
                        {copiedKey === row.key ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Đã chép
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Chép
                          </>
                        )}
                      </button>
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="p-3 rounded-lg bg-strip border border-line text-xs text-muted leading-relaxed">
              <span className="font-bold text-fg">Lưu ý quan trọng: </span>
              Vui lòng chuyển khoản chính xác <span className="font-bold text-fg">Số tiền</span> và giữ nguyên{" "}
              <span className="font-bold font-mono text-fg">{checkout.invoiceCode}</span> ở phần nội dung để hệ thống SePay tự động kích hoạt gói dịch vụ trong 10-30 giây.
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
