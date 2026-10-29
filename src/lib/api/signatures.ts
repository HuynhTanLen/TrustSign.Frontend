import { apiFetch } from "@/lib/api";
import { USE_MOCK, mockResponse } from "@/lib/mock";
import { mockDb } from "@/lib/mock/data";

// Planned endpoints (FE-09): GET/POST /api/signatures, PUT /{id}/default, DELETE /{id}.

export type SignatureKind = "Draw" | "Type" | "Upload";

export interface SavedSignature {
  id: string;
  label: string;
  kind: SignatureKind;
  /** Transparent PNG as a data URL or a short-lived URL. */
  imageUrl: string;
  isDefault: boolean;
  createdAt: string;
}

export const signaturesApi = {
  list(): Promise<SavedSignature[]> {
    if (USE_MOCK) return mockResponse(mockDb.signatures);
    return apiFetch<SavedSignature[]>("/api/signatures");
  },

  create(label: string, kind: SignatureKind, pngDataUrl: string): Promise<SavedSignature> {
    if (USE_MOCK) {
      const created: SavedSignature = {
        id: `sig-${Date.now()}`,
        label,
        kind,
        imageUrl: pngDataUrl,
        isDefault: mockDb.signatures.length === 0,
        createdAt: new Date().toISOString(),
      };
      mockDb.signatures.push(created);
      return mockResponse(created);
    }
    return apiFetch<SavedSignature>("/api/signatures", {
      method: "POST",
      body: JSON.stringify({ label, kind, png: pngDataUrl }),
    });
  },

  setDefault(id: string): Promise<void> {
    if (USE_MOCK) {
      for (const s of mockDb.signatures) s.isDefault = s.id === id;
      return mockResponse(undefined);
    }
    return apiFetch<void>(`/api/signatures/${id}/default`, { method: "PUT" });
  },

  remove(id: string): Promise<void> {
    if (USE_MOCK) {
      mockDb.signatures = mockDb.signatures.filter((s) => s.id !== id);
      return mockResponse(undefined);
    }
    return apiFetch<void>(`/api/signatures/${id}`, { method: "DELETE" });
  },
};
