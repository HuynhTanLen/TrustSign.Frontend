import { apiFetch, setAccessToken } from "@/lib/api";
import { AuthResponse, UserDto } from "@/lib/api/auth";

export type TenantRole = "TenantOwner" | "ContractManager" | "Employee";

export interface TenantDto {
  id: string;
  name: string;
  taxCode?: string | null;
  address?: string | null;
  contactEmail?: string | null;
  status: string;
  role: TenantRole;
  createdAt: string;
  representativeName?: string | null;
  representativeTitle?: string | null;
  phone?: string | null;
  verificationStatus: TenantVerificationStatus;
  verificationRejectReason?: string | null;
}

/** Xác thực pháp nhân: chưa nộp → chờ duyệt → đã xác thực, hoặc bị từ chối và được nộp lại. */
export type TenantVerificationStatus = "Unverified" | "Pending" | "Verified" | "Rejected";

export const TENANT_VERIFICATION_LABELS: Record<TenantVerificationStatus, string> = {
  Unverified: "Chưa xác thực",
  Pending: "Chờ duyệt",
  Verified: "Đã xác thực",
  Rejected: "Bị từ chối",
};

/** Dung lượng tối đa của giấy đăng ký kinh doanh (khớp giới hạn của máy chủ). */
export const LICENSE_MAX_BYTES = 5 * 1024 * 1024;

export interface TenantSessionResponse {
  tenant: TenantDto;
  accessToken: string;
  expiresAt: string;
  user: UserDto;
}

export interface CreateTenantRequest {
  name: string;
  taxCode?: string;
  address?: string;
  contactEmail?: string;
  representativeName?: string;
  representativeTitle?: string;
  phone?: string;
}

export interface UpdateTenantRequest {
  name: string;
  taxCode?: string;
  address?: string;
  contactEmail?: string;
  phone?: string;
  representativeName?: string;
  representativeTitle?: string;
}

export interface TenantMemberDto {
  userId: string;
  fullName: string;
  email: string;
  role: TenantRole;
  joinedAt: string;
}

export interface TenantInvitationDto {
  id: string;
  email: string;
  role: TenantRole;
  createdAt: string;
  expiresAt: string;
}

export const tenantsApi = {
  async create(data: CreateTenantRequest): Promise<TenantSessionResponse> {
    const res = await apiFetch<TenantSessionResponse>("/api/tenants", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.accessToken) {
      setAccessToken(res.accessToken);
    }
    return res;
  },

  async mine(): Promise<TenantDto[]> {
    return apiFetch<TenantDto[]>("/api/tenants/mine");
  },

  /** Lấy thông tin chi tiết đầy đủ của doanh nghiệp hiện tại */
  async getCurrent(): Promise<TenantDto> {
    return apiFetch<TenantDto>("/api/tenants/current");
  },

  /** Cập nhật thông tin doanh nghiệp (chỉ Chủ doanh nghiệp) */
  async updateCurrent(data: UpdateTenantRequest): Promise<TenantDto> {
    return apiFetch<TenantDto>("/api/tenants/current", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /** Chủ doanh nghiệp nộp giấy đăng ký kinh doanh (PDF/JPEG/PNG, tối đa 5 MB) để xác thực pháp nhân. */
  async submitVerification(license: File): Promise<TenantDto> {
    const body = new FormData();
    body.append("license", license, license.name);
    return apiFetch<TenantDto>("/api/tenants/current/verification", { method: "POST", body });
  },

  async switchTenant(tenantId: string): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>(`/api/tenants/${tenantId}/switch`, {
      method: "POST",
    });
    if (res.accessToken) {
      setAccessToken(res.accessToken);
    }
    return res;
  },

  async getMembers(): Promise<TenantMemberDto[]> {
    return apiFetch<TenantMemberDto[]>("/api/tenants/current/members");
  },

  async changeMemberRole(userId: string, role: TenantRole): Promise<TenantMemberDto> {
    return apiFetch<TenantMemberDto>(`/api/tenants/current/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  async removeMember(userId: string): Promise<void> {
    return apiFetch<void>(`/api/tenants/current/members/${userId}`, {
      method: "DELETE",
    });
  },

  async inviteMember(email: string, role: TenantRole): Promise<TenantInvitationDto> {
    return apiFetch<TenantInvitationDto>("/api/tenants/current/invitations", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  },

  async getPendingInvitations(): Promise<TenantInvitationDto[]> {
    return apiFetch<TenantInvitationDto[]>("/api/tenants/current/invitations");
  },

  async revokeInvitation(invitationId: string): Promise<void> {
    return apiFetch<void>(`/api/tenants/current/invitations/${invitationId}`, {
      method: "DELETE",
    });
  },

  async acceptInvitation(token: string): Promise<TenantSessionResponse> {
    const res = await apiFetch<TenantSessionResponse>(
      `/api/invitations/${encodeURIComponent(token)}/accept`,
      { method: "POST" },
    );
    if (res.accessToken) {
      setAccessToken(res.accessToken);
    }
    return res;
  },
};
