import { apiFetch, apiFetchBlob } from "@/lib/api";
import { USE_MOCK, mockError, mockResponse } from "@/lib/mock";
import { mockDb } from "@/lib/mock/data";
import type { SubscriptionStatus } from "@/components/ui/badge";

// Endpoints M2 (FE-03): /api/subscription/plans, /current, /invoices, /admin/plans.

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  monthlyQuota: number;
  isTrial: boolean;
  isActive: boolean;
}

export interface CurrentSubscription {
  planId: string;
  planName: string;
  price: number;
  durationDays: number;
  status: SubscriptionStatus;
  expiresAt: string;
  quotaUsed: number;
  quotaLimit: number;
}

export type InvoiceStatus = "Pending" | "Paid" | "Expired";

export interface Invoice {
  code: string;
  planName: string;
  amount: number;
  status: InvoiceStatus;
  createdAt: string;
  paidAt: string | null;
}

export interface Checkout {
  invoiceCode: string;
  qrImageUrl: string | null;
  bankAccount: string;
  bankName: string;
  amount: number;
  expiresAt: string;
}

export type SavePlanRequest = Omit<Plan, "id">;

export const subscriptionApi = {
  /** Danh sách gói đang mở bán công khai (chỉ gồm gói isActive = true). */
  plans(): Promise<Plan[]> {
    if (USE_MOCK) return mockResponse(mockDb.plans.filter((p) => p.isActive));
    return apiFetch<Plan[]>("/api/subscription/plans");
  },

  /** Danh sách toàn bộ gói cho Quản trị nền tảng (gồm cả gói đang bán và ngừng bán). */
  adminPlans(): Promise<Plan[]> {
    if (USE_MOCK) return mockResponse(mockDb.plans);
    return apiFetch<Plan[]>("/api/subscription/admin/plans");
  },

  current(): Promise<CurrentSubscription> {
    if (USE_MOCK) return mockResponse(mockDb.subscription);
    return apiFetch<CurrentSubscription>("/api/subscription/current");
  },

  invoices(): Promise<Invoice[]> {
    if (USE_MOCK) return mockResponse(mockDb.invoices);
    return apiFetch<Invoice[]>("/api/subscription/invoices");
  },

  createInvoice(planId: string): Promise<Checkout> {
    if (USE_MOCK) {
      const plan = mockDb.plans.find((p) => p.id === planId);
      if (!plan) return mockError(404, "Không tìm thấy gói dịch vụ");
      return mockResponse({
        invoiceCode: `TS${Math.floor(1000000 + Math.random() * 8999999)}`,
        qrImageUrl: null,
        bankAccount: mockDb.bank.account,
        bankName: mockDb.bank.name,
        amount: plan.price,
        expiresAt: new Date(Date.now() + 24 * 3600_000).toISOString(),
      });
    }
    return apiFetch<Checkout>("/api/subscription/invoices", {
      method: "POST",
      body: JSON.stringify({ planId }),
    });
  },

  invoiceStatus(code: string): Promise<{ status: InvoiceStatus }> {
    if (USE_MOCK) return mockResponse({ status: "Pending" as InvoiceStatus });
    return apiFetch(`/api/subscription/invoices/${encodeURIComponent(code)}`);
  },

  savePlan(id: string | null, data: SavePlanRequest): Promise<Plan> {
    if (USE_MOCK) {
      const plan: Plan = { id: id ?? `plan-${Date.now()}`, ...data };
      const i = mockDb.plans.findIndex((p) => p.id === plan.id);
      if (i >= 0) mockDb.plans[i] = plan;
      else mockDb.plans.push(plan);
      return mockResponse(plan);
    }
    return id
      ? apiFetch<Plan>(`/api/subscription/admin/plans/${encodeURIComponent(id)}`, {
          method: "PUT",
          body: JSON.stringify(data),
        })
      : apiFetch<Plan>("/api/subscription/admin/plans", {
          method: "POST",
          body: JSON.stringify(data),
        });
  },

  async downloadInvoicePdf(code: string): Promise<Blob> {
    if (USE_MOCK) throw new Error("Dữ liệu mẫu không hỗ trợ xuất PDF");
    return apiFetchBlob(`/api/subscription/invoices/${encodeURIComponent(code)}/pdf`);
  },
};
