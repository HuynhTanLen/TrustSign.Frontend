import { apiFetch } from "@/lib/api";
import { USE_MOCK, mockError, mockResponse } from "@/lib/mock";
import { mockDb } from "@/lib/mock/data";

// Planned endpoints (FE-06): /api/signing/{token}, /otp, /verify-otp, /sign, /decline. No account needed.

export type SigningState = "AwaitingOtp" | "ReadyToSign" | "Signed" | "Declined" | "NotYourTurn" | "Expired";

export interface SigningField {
  signerOrder: number;
  signerName: string;
  isMine: boolean;
  signed: boolean;
}

export interface SigningSession {
  contractCode: string;
  contractTitle: string;
  senderCompany: string;
  signerName: string;
  signerEmailMasked: string;
  order: number;
  totalSigners: number;
  state: SigningState;
  dueAt: string;
  fields: SigningField[];
  documentUrl: string | null;
}

export interface OtpResult {
  verified: boolean;
  attemptsLeft: number;
}

export const signingApi = {
  get(token: string): Promise<SigningSession> {
    if (USE_MOCK) {
      return token === mockDb.signingSession.token
        ? mockResponse(mockDb.signingSession.session)
        : mockError(404, "Link ký không tồn tại hoặc đã hết hạn");
    }
    return apiFetch<SigningSession>(`/api/signing/${encodeURIComponent(token)}`);
  },

  requestOtp(token: string): Promise<{ expiresAt: string }> {
    if (USE_MOCK) return mockResponse({ expiresAt: new Date(Date.now() + 5 * 60_000).toISOString() });
    return apiFetch(`/api/signing/${encodeURIComponent(token)}/otp`, { method: "POST" });
  },

  verifyOtp(token: string, code: string): Promise<OtpResult> {
    if (USE_MOCK) {
      return mockResponse({ verified: code === mockDb.signingSession.otp, attemptsLeft: code === mockDb.signingSession.otp ? 5 : 4 });
    }
    return apiFetch<OtpResult>(`/api/signing/${encodeURIComponent(token)}/verify-otp`, {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },

  sign(token: string, signaturePng: string, idempotencyKey: string): Promise<void> {
    if (USE_MOCK) return mockResponse(undefined, 800);
    return apiFetch<void>(`/api/signing/${encodeURIComponent(token)}/sign`, {
      method: "POST",
      body: JSON.stringify({ signaturePng, idempotencyKey }),
    });
  },

  decline(token: string, reason: string): Promise<void> {
    if (USE_MOCK) return mockResponse(undefined);
    return apiFetch<void>(`/api/signing/${encodeURIComponent(token)}/decline`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
};
