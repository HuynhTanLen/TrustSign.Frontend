/** Địa chỉ backend TrustSign.Api: frontend chỉ gọi một địa chỉ này. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050";

/** Lỗi theo Problem Details (RFC 9457) mà backend trả về. */
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
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function requestRefreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        setAccessToken(null);
        return null;
      }

      const data = (await response.json()) as { accessToken?: string };
      const newToken = data.accessToken ?? null;
      setAccessToken(newToken);
      return newToken;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function shouldRedirectOnUnauthorized(pathname: string): boolean {
  return (
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/register") &&
    !pathname.startsWith("/verify-email") &&
    !pathname.startsWith("/invitations/")
  );
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retryCount = 0): Promise<T> {
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

  // Khi API trả 401, gọi POST /api/auth/refresh một lần rồi thử lại; vẫn 401 thì đưa về trang đăng nhập
  if (
    response.status === 401 &&
    retryCount === 0 &&
    !path.startsWith("/api/auth/login") &&
    !path.startsWith("/api/auth/refresh")
  ) {
    const newToken = await requestRefreshToken();
    if (newToken) {
      return apiFetch<T>(path, init, 1);
    } else if (typeof window !== "undefined" && shouldRedirectOnUnauthorized(window.location.pathname)) {
      const target = `${window.location.pathname}${window.location.search}`;
      window.location.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }

  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    const correlationId =
      response.headers.get("X-Correlation-ID") ??
      (typeof problem?.correlationId === "string" ? problem.correlationId : null);
    throw new ApiError(
      response.status,
      problem?.code,
      correlationId,
      problem?.detail ?? problem?.title ?? `Yêu cầu thất bại (${response.status})`,
    );
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}
