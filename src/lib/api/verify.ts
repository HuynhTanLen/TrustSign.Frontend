import { apiFetch } from "@/lib/api";
import { USE_MOCK, mockResponse } from "@/lib/mock";
import { mockDb } from "@/lib/mock/data";

// Planned endpoints (FE-08): GET /api/verify/{contractCode}, POST /api/verify/file (multipart). Public.

export type VerifyOutcome = "Valid" | "Tampered" | "NotFound";

export interface VerifiedSignature {
  signerName: string;
  issuer: string;
  serial: string;
  signedAt: string;
  intact: boolean;
  certificateStatus: "Valid" | "Revoked";
}

export interface VerifiedEvent {
  index: number;
  title: string;
  prevHash: string;
  hash: string;
  ok: boolean;
}

export interface VerifyResult {
  outcome: VerifyOutcome;
  contractCode: string | null;
  contractTitle: string | null;
  signatures: VerifiedSignature[];
  events: VerifiedEvent[];
}

const notFound = (code: string | null): VerifyResult => ({
  outcome: "NotFound",
  contractCode: code,
  contractTitle: null,
  signatures: [],
  events: [],
});

export const verifyApi = {
  byCode(code: string): Promise<VerifyResult> {
    if (USE_MOCK) return mockResponse(mockDb.verifyResults[code.trim().toUpperCase()] ?? notFound(code), 600);
    return apiFetch<VerifyResult>(`/api/verify/${encodeURIComponent(code.trim())}`);
  },

  byFile(file: File): Promise<VerifyResult> {
    if (USE_MOCK) return mockResponse(Object.values(mockDb.verifyResults)[0], 900);
    const body = new FormData();
    body.append("file", file);
    return apiFetch<VerifyResult>("/api/verify/file", { method: "POST", body });
  },
};
