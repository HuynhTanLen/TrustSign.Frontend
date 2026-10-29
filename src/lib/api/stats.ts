import { apiFetch } from "@/lib/api";
import { USE_MOCK, mockResponse } from "@/lib/mock";
import { mockDb } from "@/lib/mock/data";
import type { ContractStatus } from "@/components/ui/badge";
import type { ContractListItem } from "@/lib/api/contracts";
import type { AdminTenant } from "@/lib/api/admin";

// Planned endpoints (FE-08): GET /api/stats/tenant, GET /api/admin/stats.

export interface TenantStats {
  totalContracts: number;
  pending: number;
  /** Pending contracts whose deadline is within 24 hours. */
  pendingDueSoon: number;
  completedThisMonth: number;
  quotaUsed: number;
  quotaLimit: number;
  /** Last 6 months, oldest first; month as "yyyy-MM". */
  monthly: { month: string; count: number }[];
  byStatus: { status: ContractStatus; count: number }[];
  dueSoon: ContractListItem[];
}

export interface AdminStats {
  tenants: number;
  newTenantsThisMonth: number;
  revenueThisMonth: number;
  paidInvoicesThisMonth: number;
  subscriptionsByPlan: { planName: string; price: number; count: number }[];
  certificatesIssued: number;
  certificatesRevoked: number;
  /** Last 12 months, oldest first. */
  revenue12m: { month: string; amount: number }[];
  recentTenants: AdminTenant[];
}

export const statsApi = {
  tenant(): Promise<TenantStats> {
    if (USE_MOCK) return mockResponse(mockDb.tenantStats);
    return apiFetch<TenantStats>("/api/stats/tenant");
  },

  admin(): Promise<AdminStats> {
    if (USE_MOCK) return mockResponse({ ...mockDb.adminStats, recentTenants: mockDb.adminTenants.slice(0, 3) });
    return apiFetch<AdminStats>("/api/admin/stats");
  },
};
