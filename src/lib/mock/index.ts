import { ApiError } from "@/lib/api";

/**
 * Sample data switch (UI-PROMPT.md): pages never hold sample data themselves.
 * Set NEXT_PUBLIC_USE_MOCK=true in .env.local to fill the screens while the backend
 * endpoints are not built; otherwise every call goes to the real API.
 */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

/** Resolve with a copy after a short delay, so loading states are visible in mock mode too. */
export function mockResponse<T>(data: T, delayMs = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), delayMs));
}

export function mockError(status: number, message: string, delayMs = 350): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new ApiError(status, undefined, "mock", message)), delayMs),
  );
}
