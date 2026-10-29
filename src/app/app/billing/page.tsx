"use client";

import * as React from "react";
import { AlertTriangle, Check, CircleCheck, Clock, Copy, CreditCard, Download, Package, Receipt } from "lucide-react";
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
  const left = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
  return `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
}

export default function BillingPage() {
  const { toast } = useToast();
  const current = useApi("subscription", subscriptionApi.current);
  const plans = useApi("plans", subscriptionApi.plans);
  const invoices = useApi("invoices", subscriptionApi.invoices);

  const [checkoutPlan, setCheckoutPlan] = React.useState<Plan | null>(null);
  const [checkout, setCheckout] = React.useState<Checkout | null>(null);
  const [paid, setPaid] = React.useState(false);
  const countdown = useCountdown(checkout?.expiresAt ?? null);

  const openCheckout = async (plan: Plan) => {
    setCheckoutPlan(plan);
    setCheckout(null);
    setPaid(false);
    try {
      setCheckout(await subscriptionApi.createInvoice(plan.id));
    } catch (err) {
      setCheckoutPlan(null);
      toast(err instanceof ApiError ? err.message : "Không tạo được hóa đơn.", "error");
    }
  };

  // Ask for the invoice status every 5 seconds until it is paid (FE-03).
  React.useEffect(() => {
    if (!checkout || paid) return;
    const t = setInterval(async () => {
      const { status } = await subscriptionApi.invoiceStatus(checkout.invoiceCode);
      if (status === "Paid") setPaid(true);
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
  };

  const copy = (value: string, label: string) => {
    navigator.clipboard?.writeText(value);
    toast(`Đã sao chép ${label}.`, "info");
  };

  const handleDownloadPdf = async (code: string) => {
    if (USE_MOCK) {
      toast("Dữ liệu mẫu không có file PDF.", "info");
      return;
    }
    toast("Đang tải hóa đơn...", "info");
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
    }
  };

  const sub = current.data;
  const daysLeft = sub ? daysUntil(sub.expiresAt) : 0;
  const quotaRatio = sub ? sub.quotaUsed / Math.max(1, sub.quotaLimit) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Gói và thanh toán" description="Hạn mức hợp đồng hằng tháng và thanh toán bằng chuyển khoản VietQR" />

      {current.error ? (
        <ErrorState error={current.error} onRetry={current.reload} />
      ) : (
        <Card title="Gói đang dùng" icon={CreditCard}>
          {!sub ? (
            <Skeleton className="h-28" />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-base font-semibold text-fg">
                    Gói {sub.planName} <Badge subscriptionStatus={sub.status} />
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Hết hạn {formatDate(sub.expiresAt)} ({daysLeft > 0 ? `còn ${daysLeft} ngày` : "đã hết hạn"}) ·{" "}
                    {formatMoney(sub.price)} / {sub.durationDays} ngày
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => {
                    const plan = plans.data?.find((p) => p.id === sub.planId);
                    if (plan) openCheckout(plan);
                  }}
                  disabled={!plans.data}
                >
                  Gia hạn
                </Button>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-fg">Hợp đồng đã gửi trong tháng</span>
                  <span className="font-semibold text-fg tabular-nums">
                    {sub.quotaUsed} / {sub.quotaLimit}
                  </span>
                </div>
                <Progress value={sub.quotaUsed} max={sub.quotaLimit} tone={quotaRatio >= 0.9 ? "warning" : "primary"} label="Hạn mức đã dùng" />
              </div>
              {(daysLeft < 7 || quotaRatio >= 0.9) && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-badge-pending-bg text-sm text-badge-pending-fg motion-safe:animate-fade-in">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    {daysLeft < 7 && `Gói còn ${Math.max(0, daysLeft)} ngày. `}
                    {quotaRatio >= 0.9 && `Còn ${Math.max(0, sub.quotaLimit - sub.quotaUsed)} lượt gửi ký trong tháng. `}
                    Gia hạn hoặc nâng gói để không bị gián đoạn.
                  </span>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      <Card title="Các gói dịch vụ" icon={Package}>
        {plans.error ? (
          <ErrorState error={plans.error} onRetry={plans.reload} />
        ) : !plans.data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.data
              .filter((p) => p.isActive)
              .map((p) => {
                const isCurrent = p.id === sub?.planId;
                return (
                  <div
                    key={p.id}
                    className={`rounded-md border p-4 flex flex-col ${isCurrent ? "border-primary bg-selected/40" : "border-line"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-fg">Gói {p.name}</h3>
                      {isCurrent && (
                        <span className="inline-flex items-center h-[22px] px-2 rounded-sm bg-primary text-white text-xs font-semibold">
                          Đang dùng
                        </span>
                      )}
                    </div>
                    <p className="mt-2">
                      <span className="text-xl font-semibold text-fg">{formatMoney(p.price)}</span>
                      <span className="ml-1 text-sm text-muted">/ {p.durationDays} ngày</span>
                    </p>
                    <ul className="mt-3 flex-1 flex flex-col gap-1 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                        {p.monthlyQuota} hợp đồng gửi ký mỗi tháng
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
                        Tối đa 5 người ký mỗi hợp đồng
                      </li>
                    </ul>
                    <Button
                      className="mt-4 w-full"
                      variant={isCurrent ? "primary" : "secondary"}
                      disabled={p.isTrial}
                      onClick={() => openCheckout(p)}
                    >
                      {p.isTrial ? "Chỉ dùng khi mới đăng ký" : isCurrent ? "Gia hạn gói này" : `Chuyển sang gói ${p.name}`}
                    </Button>
                  </div>
                );
              })}
          </div>
        )}
      </Card>

      <Card title="Lịch sử hóa đơn" icon={Receipt} bodyClassName="p-0">
        {invoices.error ? (
          <div className="p-4">
            <ErrorState error={invoices.error} onRetry={invoices.reload} />
          </div>
        ) : (
          <Table
            bare
            loading={invoices.isLoading}
            rows={invoices.data ?? []}
            getRowKey={(i) => i.code}
            empty={<p className="p-4 text-sm text-muted">Chưa có hóa đơn nào.</p>}
            columns={[
              { key: "code", header: "Mã hóa đơn", primary: true, render: (i) => <span className="font-mono">{i.code}</span> },
              { key: "plan", header: "Gói", render: (i) => `Gói ${i.planName}` },
              { key: "amount", header: "Số tiền", align: "right", render: (i) => formatMoney(i.amount) },
              {
                key: "status",
                header: "Trạng thái",
                render: (i) => (
                  <span className={`inline-flex items-center h-[22px] px-2 rounded-sm text-xs font-semibold ${INVOICE_STATUS[i.status].className}`}>
                    {INVOICE_STATUS[i.status].label}
                  </span>
                ),
              },
              { key: "date", header: "Ngày tạo", render: (i) => formatDateTime(i.createdAt) },
              {
                key: "pdf",
                header: "",
                align: "right",
                render: (i) =>
                  i.status === "Paid" ? (
                    <Button variant="ghost" onClick={() => handleDownloadPdf(i.code)}>
                      <Download className="w-4 h-4" aria-hidden="true" />
                      Tải PDF
                    </Button>
                  ) : null,
              },
            ]}
          />
        )}
      </Card>

      <Dialog
        open={checkoutPlan !== null}
        onClose={closeCheckout}
        title={paid ? "Đã nhận thanh toán" : `Thanh toán gói ${checkoutPlan?.name ?? ""}`}
        footer={
          paid ? (
            <Button variant="primary" onClick={closeCheckout}>
              Đóng
            </Button>
          ) : (
            <>
              {USE_MOCK && checkout && (
                <Button variant="secondary" onClick={() => setPaid(true)}>
                  Giả lập đã thanh toán
                </Button>
              )}
              <Button variant="secondary" onClick={closeCheckout}>
                Để sau
              </Button>
            </>
          )
        }
      >
        {paid ? (
          <div className="flex flex-col items-center text-center gap-2 py-4 motion-safe:animate-pop-in">
            <CircleCheck className="w-10 h-10 text-success" aria-hidden="true" />
            <p className="text-base font-semibold text-fg">Gói {checkoutPlan?.name} đã được kích hoạt</p>
            <p className="text-sm text-muted">Hóa đơn {checkout?.invoiceCode} đã thanh toán.</p>
          </div>
        ) : !checkout ? (
          <Skeleton className="h-64" />
        ) : (
          <div className="flex flex-col gap-4 text-sm">
            <div className="mx-auto w-44 h-44 rounded-md border border-line bg-page flex items-center justify-center overflow-hidden">
              {checkout.qrImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={checkout.qrImageUrl} alt={`Mã VietQR cho hóa đơn ${checkout.invoiceCode}`} className="w-full h-full object-contain" />
              ) : (
                <span className="px-4 text-center text-xs text-muted">Mã QR hiện ở đây khi máy chủ trả về ảnh VietQR</span>
              )}
            </div>
            <p className="flex items-center justify-center gap-1 text-xs text-muted">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              Đang chờ thanh toán · còn {countdown}
            </p>
            <dl className="rounded-md border border-line divide-y divide-line">
              {[
                { label: "Ngân hàng", value: checkout.bankName },
                { label: "Số tài khoản", value: checkout.bankAccount, copy: "số tài khoản", mono: true },
                { label: "Số tiền", value: formatMoney(checkout.amount), copy: "số tiền", raw: String(checkout.amount) },
                { label: "Nội dung chuyển khoản", value: checkout.invoiceCode, copy: "nội dung", mono: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 px-3 h-row">
                  <dt className="text-muted">{row.label}</dt>
                  <dd className="flex items-center gap-2">
                    <span className={`font-semibold text-fg ${row.mono ? "font-mono" : ""}`}>{row.value}</span>
                    {row.copy && (
                      <button
                        type="button"
                        onClick={() => copy(row.raw ?? row.value, row.copy!)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-page hover:text-fg"
                        aria-label={`Sao chép ${row.copy}`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted">
              Nội dung chuyển khoản phải đúng mã hóa đơn để hệ thống tự kích hoạt gói.
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
