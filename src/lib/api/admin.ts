import { API_URL, apiFetch } from "@/lib/api";
import { USE_MOCK, mockResponse } from "@/lib/mock";
import { mockDb } from "@/lib/mock/data";

// Planned endpoints (FE-08): /api/admin/tenants, /api/admin/users, /api/admin/certificates, /api/pki/root-ca.

export interface AdminTenant {
  id: string;
  name: string;
  taxCode: string | null;
  ownerEmail: string;
  planName: string;
  subscriptionStatus: "Trial" | "Active" | "Expired";
  membersCount: number;
  isLocked: boolean;
  lockReason: string | null;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  tenantsCount: number;
  emailVerified: boolean;
  isLocked: boolean;
  lockReason: string | null;
}

export interface Certificate {
  serial: string;
  subject: string;
  subjectEmail: string;
  tenantName: string;
  validFrom: string;
  validTo: string;
  revoked: boolean;
  revokeReason: string | null;
}

export interface CertificateAuthorityInfo {
  rootName: string;
  issuingName: string;
  algorithm: string;
}

export const ROOT_CA_URL = `${API_URL}/api/pki/root-ca`;

function setLock<T extends { isLocked: boolean; lockReason: string | null }>(item: T | undefined, reason: string | null) {
  if (item) {
    item.isLocked = reason !== null;
    item.lockReason = reason;
  }
}

export const adminApi = {
  tenants(): Promise<AdminTenant[]> {
    if (USE_MOCK) return mockResponse(mockDb.adminTenants);
    return apiFetch<AdminTenant[]>("/api/admin/tenants");
  },

  lockTenant(id: string, reason: string): Promise<void> {
    if (USE_MOCK) {
      setLock(mockDb.adminTenants.find((t) => t.id === id), reason);
      return mockResponse(undefined);
    }
    return apiFetch<void>(`/api/admin/tenants/${id}/lock`, { method: "POST", body: JSON.stringify({ reason }) });
  },

  unlockTenant(id: string): Promise<void> {
    if (USE_MOCK) {
      setLock(mockDb.adminTenants.find((t) => t.id === id), null);
      return mockResponse(undefined);
    }
    return apiFetch<void>(`/api/admin/tenants/${id}/unlock`, { method: "POST" });
  },

  users(): Promise<AdminUser[]> {
    if (USE_MOCK) return mockResponse(mockDb.adminUsers);
    return apiFetch<AdminUser[]>("/api/admin/users");
  },

  lockUser(id: string, reason: string): Promise<void> {
    if (USE_MOCK) {
      setLock(mockDb.adminUsers.find((u) => u.id === id), reason);
      return mockResponse(undefined);
    }
    return apiFetch<void>(`/api/admin/users/${id}/lock`, { method: "POST", body: JSON.stringify({ reason }) });
  },

  unlockUser(id: string): Promise<void> {
    if (USE_MOCK) {
      setLock(mockDb.adminUsers.find((u) => u.id === id), null);
      return mockResponse(undefined);
    }
    return apiFetch<void>(`/api/admin/users/${id}/unlock`, { method: "POST" });
  },

  certificates(): Promise<{ authority: CertificateAuthorityInfo; items: Certificate[] }> {
    if (USE_MOCK) return mockResponse({ authority: mockDb.certificateAuthority, items: mockDb.certificates });
    return apiFetch("/api/admin/certificates");
  },

  revokeCertificate(serial: string, reason: string): Promise<void> {
    if (USE_MOCK) {
      const c = mockDb.certificates.find((x) => x.serial === serial);
      if (c) {
        c.revoked = true;
        c.revokeReason = reason;
      }
      return mockResponse(undefined);
    }
    return apiFetch<void>(`/api/admin/certificates/${encodeURIComponent(serial)}/revoke`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
};
