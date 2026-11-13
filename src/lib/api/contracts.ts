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

export type RecipientRole = "Signer" | "Approver" | "Cc" | "Coordinator";

/** Người ký có ô ký; người điều phối giữ sẵn ô ký cho người ký bên đối tác mà họ sẽ chỉ định. */
export const hasSignatureBox = (role?: RecipientRole) => (role ?? "Signer") === "Signer" || role === "Coordinator";

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
  role?: RecipientRole;
  phone?: string | null;
  organization?: string | null;
  title?: string | null;
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
  role?: RecipientRole;
  phone?: string;
  organization?: string;
  title?: string;
}

/** Phải khớp EmailValidator phía backend; chặt hơn một chút ở vài dạng hiếm như "a"@x.vn. */
export function isValidEmail(email: string): boolean {
  const v = email.trim();
  return (
    v.length <= 254 &&
    !v.includes("..") &&
    /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:".]{2,}$/.test(v)
  );
}

function toSignerPayload(signers: NewSigner[]) {
  return signers.map((s, i) => ({
    fullName: s.fullName,
    email: s.email.trim(),
    order: i + 1,
    pageNumber: s.pageNumber,
    boxX: Math.round(s.boxX),
    boxY: Math.round(s.boxY),
    boxWidth: Math.round(s.boxWidth),
    boxHeight: Math.round(s.boxHeight),
    role: s.role ?? "Signer",
    phone: s.phone || undefined,
    organization: s.organization || undefined,
    title: s.title || undefined,
  }));
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
    if (USE_MOCK && id.startsWith("c-")) {
      const found = mockDb.contractDetails.find((c) => c.id === id);
      if (found) return mockResponse(found);
    }
    return apiFetch<ContractDetail>(`/api/contracts/${encodeURIComponent(id)}`);
  },

  /** Gửi lại email mời cho người đang tới lượt ký/duyệt. */
  remind(id: string): Promise<void> {
    if (USE_MOCK && id.startsWith("c-")) return mockResponse(undefined);
    return apiFetch<void>(`/api/contracts/${encodeURIComponent(id)}/remind`, { method: "POST" });
  },

  cancel(id: string): Promise<void> {
    if (USE_MOCK && id.startsWith("c-")) {
      for (const c of [...mockDb.contracts, ...mockDb.contractDetails]) if (c.id === id) c.status = "Cancelled";
      return mockResponse(undefined);
    }
    return apiFetch<void>(`/api/contracts/${encodeURIComponent(id)}/cancel`, { method: "POST" });
  },

  /** Tạo bản Nháp từ mẫu kèm người nhận trong một lần gọi: người nhận sai thì backend không lưu gì. */
  createFromTemplate(
    templateId: string,
    title: string,
    values: Record<string, string>,
    signers: NewSigner[],
  ): Promise<{ contractId: string }> {
    if (USE_MOCK) return mockResponse({ contractId: mockDb.contractDetails[0].id });
    return apiFetch(`/api/contracts/from-template`, {
      method: "POST",
      body: JSON.stringify({ templateId, title, values, signers: toSignerPayload(signers) }),
    });
  },

  /** Tạo bản Nháp từ PDF tải lên (≤ 10 MB) kèm người nhận trong một lần gọi. */
  upload(file: File, title: string, signers: NewSigner[]): Promise<{ contractId: string }> {
    if (USE_MOCK) return mockResponse({ contractId: mockDb.contractDetails[0].id }, 800);
    const body = new FormData();
    body.append("file", file);
    body.append("title", title);
    body.append("signers", JSON.stringify(toSignerPayload(signers)));
    return apiFetch(`/api/contracts/upload`, { method: "POST", body });
  },

  setSigners(id: string, signers: NewSigner[]): Promise<void> {
    if (USE_MOCK) return mockResponse(undefined);
    return apiFetch<void>(`/api/contracts/${encodeURIComponent(id)}/signers`, {
      method: "PUT",
      body: JSON.stringify({ signers: toSignerPayload(signers) }),
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
