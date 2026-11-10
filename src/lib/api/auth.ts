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
  phoneNumber?: string | null;
  jobTitle?: string | null;
  hasPassword?: boolean;
  googleLinked?: boolean;
  /** URL ký (hết hạn sau vài giờ); null khi chưa có ảnh. */
  avatarUrl?: string | null;
}

export interface GoogleLoginRequest {
  idToken: string;
  acceptTerms?: boolean;
  /** Chỉ khi email Google trùng tài khoản có sẵn: mật khẩu hiện tại để xác nhận liên kết. */
  password?: string;
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
  acceptTerms: boolean;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string;
  jobTitle?: string;
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

  /** Đăng nhập bằng Google (Firebase ID token) */
  async googleLogin(data: GoogleLoginRequest): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.accessToken) {
      setAccessToken(res.accessToken);
    }
    return res;
  },

  async linkGoogle(idToken: string): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>("/api/auth/google/link", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  },

  async unlinkGoogle(): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>("/api/auth/google", {
      method: "DELETE",
    });
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
  async updateProfile(
    input: string | UpdateProfileRequest,
    phoneNumber?: string,
    jobTitle?: string,
  ): Promise<UserDto> {
    const body =
      typeof input === "string"
        ? { fullName: input, phoneNumber, jobTitle }
        : input;

    return apiFetch<UserDto>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  /** Thay ảnh đại diện (JPEG/PNG/WebP, ≤ 128 KB); trả về hồ sơ mới. */
  async uploadAvatar(image: Blob): Promise<UserDto> {
    const body = new FormData();
    body.append("file", image, "avatar.jpg");
    return apiFetch<UserDto>("/api/auth/me/avatar", { method: "PUT", body });
  },

  async removeAvatar(): Promise<UserDto> {
    return apiFetch<UserDto>("/api/auth/me/avatar", { method: "DELETE" });
  },

  /** Đổi mật khẩu */
  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
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
