/** Địa chỉ API Gateway: mọi request của frontend đi qua đây, không gọi thẳng service. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050";

/** Lỗi theo Problem Details (RFC 9457) mà gateway và các service trả về. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
    readonly correlationId: string | null,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Access token chỉ giữ trong bộ nhớ (BR10): tải lại trang là mất, phải gọi /api/auth/refresh để lấy lại.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    // Gửi kèm cookie refresh token (HttpOnly) cho các endpoint /api/auth.
    credentials: "include",
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      problem?.code,
      response.headers.get("X-Correlation-ID"),
      problem?.detail ?? problem?.title ?? `Yêu cầu thất bại (${response.status})`,
    );
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}
