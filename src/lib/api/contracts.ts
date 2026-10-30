import { apiFetch } from "@/lib/api";
import { USE_MOCK, mockError, mockResponse } from "@/lib/mock";
import { mockDb } from "@/lib/mock/data";
import type { ContractStatus } from "@/components/ui/badge";

export interface ContractListItem {
  id: string;
  code: string;
  title: string;
  /** The party the contract is sent to (first external signer or company). */
  partner: string;
  creatorName: string;
  status: ContractStatus;
  sentAt: string | null;
  dueAt: string | null;
  /** Name of the signer whose turn it is, while Pending/Signing. */
  currentSigner?: string | null;
}

export type SignerStatus = "Waiting" | "Current" | "Signed" | "Declined";

export interface ContractSigner {
  order: number;
  fullName: string;
  email: string;
  status: SignerStatus;
  signedAt: string | null;
  declineReason: string | null;
  pageNumber?: number;
  boxX?: number;
  boxY?: number;
  boxWidth?: number;
  boxHeight?: number;
}

export interface ContractSignature {
  signerName: string;
  signerEmail: string;
  issuer: string;
  serial: string;
  signedAt: string;
  timestampAuthority: string | null;
  valid: boolean;
}

export interface ContractEvent {
  at: string;
  title: string;
  detail: string;
  hash: string;
}

export interface ContractDetail extends ContractListItem {
  signers: ContractSigner[];
  signatures: ContractSignature[];
  events: ContractEvent[];
  /** Short-lived URL of the current PDF, if one exists. */
  documentUrl: string | null;
}

export interface ContractListQuery {
  query?: string;
  status?: ContractStatus | "";
}

export interface NewSigner {
  fullName: string;
  email: string;
  pageNumber: number;
  boxX: number;
  boxY: number;
  boxWidth: number;
  boxHeight: number;
}

export const contractsApi = {
  list(params: ContractListQuery = {}): Promise<ContractListItem[]> {
    if (USE_MOCK) {
      const q = (params.query ?? "").trim().toLowerCase();
      return mockResponse(
        mockDb.contracts.filter(
          (c) =>
            (!params.status || c.status === params.status) &&
            (!q || [c.title, c.partner, c.code].some((v) => v.toLowerCase().includes(q))),
        ),
      );
    }
    const search = new URLSearchParams();
    if (params.query) search.set("query", params.query);
    if (params.status) search.set("status", params.status);
    return apiFetch<ContractListItem[]>(`/api/contracts?${search}`);
  },

  get(id: string): Promise<ContractDetail> {
    if (USE_MOCK) {
      const found = mockDb.contractDetails.find((c) => c.id === id);
      return found ? mockResponse(found) : mockError(404, "Không tìm thấy hợp đồng");
    }
    return apiFetch<ContractDetail>(`/api/contracts/${encodeURIComponent(id)}`);
  },

  cancel(id: string): Promise<void> {
    if (USE_MOCK) {
      for (const c of [...mockDb.contracts, ...mockDb.contractDetails]) if (c.id === id) c.status = "Cancelled";
      return mockResponse(undefined);
    }
    return apiFetch<void>(`/api/contracts/${encodeURIComponent(id)}/cancel`, { method: "POST" });
  },

  /** Step 1 of the wizard: a Draft from a template; returns its id. */
  createFromTemplate(templateId: string, title: string, values: Record<string, string>): Promise<{ contractId: string }> {
    if (USE_MOCK) return mockResponse({ contractId: mockDb.contractDetails[0].id });
    return apiFetch(`/api/contracts/from-template`, {
      method: "POST",
      body: JSON.stringify({ templateId, title, values }),
    });
  },

  /** Step 1 alternative: a Draft from an uploaded PDF (≤ 10 MB). */
  upload(file: File, title: string): Promise<{ contractId: string }> {
    if (USE_MOCK) return mockResponse({ contractId: mockDb.contractDetails[0].id }, 800);
    const body = new FormData();
    body.append("file", file);
    body.append("title", title);
    return apiFetch(`/api/contracts/upload`, { method: "POST", body });
  },

  setSigners(id: string, signers: NewSigner[]): Promise<void> {
    if (USE_MOCK) return mockResponse(undefined);
    return apiFetch<void>(`/api/contracts/${encodeURIComponent(id)}/signers`, {
      method: "PUT",
      body: JSON.stringify({
        signers: signers.map((s, i) => ({
          fullName: s.fullName,
          email: s.email,
          order: i + 1,
          pageNumber: s.pageNumber,
          boxX: Math.round(s.boxX),
          boxY: Math.round(s.boxY),
          boxWidth: Math.round(s.boxWidth),
          boxHeight: Math.round(s.boxHeight),
        })),
      }),
    });
  },

  send(id: string, dueAt: string): Promise<void> {
    if (USE_MOCK) return mockResponse(undefined);
    return apiFetch<void>(`/api/contracts/${encodeURIComponent(id)}/send`, {
      method: "POST",
      body: JSON.stringify({ dueAt }),
    });
  },
};
