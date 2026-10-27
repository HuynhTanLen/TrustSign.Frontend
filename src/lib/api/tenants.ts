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
}

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
