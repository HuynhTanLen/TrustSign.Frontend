import { apiFetch, setAccessToken } from "@/lib/api";

export interface UserTenantDto {
  id: string;
  name: string;
  role: "TenantOwner" | "ContractManager" | "Employee";
}

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  role?: "User" | "Admin" | string;
  emailVerified: boolean;
  hasTenant: boolean;
  activeTenantId?: string | null;
  tenants?: UserTenantDto[];
}

export interface AuthResponse {
  accessToken: string;
  expiresAt?: string;
  user: UserDto;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export const authApi = {
  /** Đăng ký tài khoản mới */
  async register(data: RegisterRequest): Promise<{ message: string; email: string }> {
    return apiFetch<{ message: string; email: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Đăng nhập */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.accessToken) {
      setAccessToken(res.accessToken);
    }
    return res;
  },

  /** Làm mới access token */
  async refresh(): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>("/api/auth/refresh", {
      method: "POST",
    });
    if (res.accessToken) {
      setAccessToken(res.accessToken);
    }
    return res;
  },

  /** Đăng xuất */
  async logout(): Promise<void> {
    try {
      await apiFetch<void>("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      setAccessToken(null);
    }
  },

  /** Lấy thông tin tài khoản hiện tại */
  async me(): Promise<UserDto> {
    return apiFetch<UserDto>("/api/auth/me");
  },

  /** Cập nhật hồ sơ cá nhân */
  async updateProfile(fullName: string): Promise<UserDto> {
    return apiFetch<UserDto>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ fullName }),
    });
  },

  /** Xác minh email */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  /** Gửi lại email xác minh */
  async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /** Yêu cầu đặt lại mật khẩu */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /** Đặt lại mật khẩu với token */
  async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
