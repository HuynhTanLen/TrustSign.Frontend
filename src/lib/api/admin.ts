import { API_URL, apiFetch, apiFetchBlob } from "@/lib/api";
import { USE_MOCK, mockError, mockResponse } from "@/lib/mock";
import type { ContractStatus, SubscriptionStatus } from "@/components/ui/badge";
import type { TenantRole, TenantVerificationStatus } from "@/lib/api/tenants";
import { mockDb } from "@/lib/mock/data";

// Planned endpoints (FE-08): /api/admin/tenants, /api/admin/users, /api/admin/certificates, /api/pki/root-ca.

export interface AdminTenant {
  id: string;
  name: string;
  taxCode: string | null;
  ownerEmail: string;
  planName: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  membersCount: number;
  isLocked: boolean;
  lockReason: string | null;
  verificationStatus?: TenantVerificationStatus;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  tenantsCount: number;
  emailVerified: boolean;
  isAdmin?: boolean;
  isLocked: boolean;
  lockReason: string | null;
}

export interface AdminHistoryItem {
  at: string;
  title: string;
  actorEmail: string | null;
  reason: string | null;
}

/** Hồ sơ doanh nghiệp cho quản trị nền tảng: chỉ đếm hợp đồng, không đọc nội dung hợp đồng của khách. */
export interface AdminTenantProfile {
  id: string;
  name: string;
  taxCode: string | null;
  address: string | null;
  phone: string | null;
  contactEmail: string | null;
  representativeName: string | null;
  representativeTitle: string | null;
  createdAt: string;
  isLocked: boolean;
  lockReason: string | null;
  lockedAt: string | null;
  subscription: {
    planName: string;
    status: SubscriptionStatus;
    startedAt: string;
    expiresAt: string;
    quotaUsed: number;
    quotaLimit: number;
  } | null;
  members: { userId: string; fullName: string; email: string; role: TenantRole; joinedAt: string; isLocked: boolean }[];
  contractCounts: Record<ContractStatus, number>;
  history: AdminHistoryItem[];
  verification?: {
    status: TenantVerificationStatus;
    submittedAt: string | null;
    verifiedAt: string | null;
    rejectReason: string | null;
    hasLicense: boolean;
  } | null;
}

/** Hồ sơ người dùng: không có mật khẩu, phiên đăng nhập hay ảnh CCCD; số CCCD đã che. */
export interface AdminUserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  jobTitle: string | null;
  isAdmin: boolean;
  status: "Pending" | "Active" | "Locked";
  emailVerified: boolean;
  createdAt: string;
  termsAcceptedAt: string | null;
  failedLoginCount: number;
  temporarilyLockedUntil: string | null;
  isLocked: boolean;
  lockReason: string | null;
  lockedAt: string | null;
  tenants: { tenantId: string; tenantName: string; role: TenantRole; joinedAt: string; tenantLocked: boolean }[];
  ekyc: { status: "Verified" | "Revoked"; citizenIdMasked: string; fullName: string; verifiedAt: string } | null;
  history: AdminHistoryItem[];
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

  tenant(id: string): Promise<AdminTenantProfile> {
    if (USE_MOCK) {
      const t = mockDb.adminTenants.find((x) => x.id === id);
      if (!t) return mockError(404, "Không tìm thấy doanh nghiệp.");
      return mockResponse({
        ...t,
        address: null,
        phone: null,
        contactEmail: t.ownerEmail,
        representativeName: null,
        representativeTitle: null,
        createdAt: new Date().toISOString(),
        lockedAt: null,
        subscription: null,
        members: [],
        contractCounts: { Draft: 0, Pending: 0, Signing: 0, Completed: 0, Declined: 0, Cancelled: 0, Expired: 0 },
        history: [],
      });
    }
    return apiFetch<AdminTenantProfile>(`/api/admin/tenants/${id}`);
  },

  lockTenant(id: string, reason: string): Promise<void> {
    if (USE_MOCK) {
      setLock(mockDb.adminTenants.find((t) => t.id === id), reason);
      return mockResponse(undefined);
    }
    return apiFetch<void>(`/api/admin/tenants/${id}/lock`, { method: "POST", body: JSON.stringify({ reason }) });
  },

  approveVerification(id: string): Promise<void> {
    if (USE_MOCK) return mockError(501, "Chế độ mock chưa hỗ trợ xác thực doanh nghiệp.");
    return apiFetch<void>(`/api/admin/tenants/${id}/verification/approve`, { method: "POST" });
  },

  rejectVerification(id: string, reason: string): Promise<void> {
    if (USE_MOCK) return mockError(501, "Chế độ mock chưa hỗ trợ xác thực doanh nghiệp.");
    return apiFetch<void>(`/api/admin/tenants/${id}/verification/reject`, { method: "POST", body: JSON.stringify({ reason }) });
  },

  /** Giấy đăng ký kinh doanh do máy chủ giải mã; mở trong tab mới và nhớ thu hồi URL khi xong. */
  async businessLicenseUrl(id: string): Promise<string> {
    if (USE_MOCK) return mockError(501, "Chế độ mock chưa hỗ trợ xác thực doanh nghiệp.");
    return URL.createObjectURL(await apiFetchBlob(`/api/admin/tenants/${id}/business-license`));
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

  user(id: string): Promise<AdminUserProfile> {
    if (USE_MOCK) {
      const u = mockDb.adminUsers.find((x) => x.id === id);
      if (!u) return mockError(404, "Không tìm thấy người dùng.");
      return mockResponse({
        ...u,
        phoneNumber: null,
        jobTitle: null,
        isAdmin: false,
        status: u.isLocked ? "Locked" : u.emailVerified ? "Active" : "Pending",
        createdAt: new Date().toISOString(),
        termsAcceptedAt: null,
        failedLoginCount: 0,
        temporarilyLockedUntil: null,
        lockedAt: null,
        tenants: [],
        ekyc: null,
        history: [],
      });
    }
    return apiFetch<AdminUserProfile>(`/api/admin/users/${id}`);
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
