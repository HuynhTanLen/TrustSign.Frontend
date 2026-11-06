import { apiFetch, apiFetchBlob } from "@/lib/api";
import { USE_MOCK, mockResponse } from "@/lib/mock";

export type EkycStatus = "None" | "Verified" | "Revoked";
export type EkycImageKind = "Selfie" | "Front" | "Back";

export interface MyEkyc {
  status: EkycStatus;
  maskedCitizenId?: string | null;
  fullName?: string | null;
  dateOfBirth?: string | null;
  verifiedAt?: string | null;
  revokeReason?: string | null;
}

export interface AdminEkyc {
  id: string;
  userId: string;
  email: string;
  accountName: string;
  citizenId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  issuedOn?: string | null;
  faceDistance: number;
  status: Exclude<EkycStatus, "None">;
  createdAt: string;
  revokedAt?: string | null;
  revokeReason?: string | null;
}

export interface SubmitEkycRequest {
  qrText: string;
  faceDistance: number;
  selfie: Blob;
  front: Blob;
  back: Blob;
}

export interface EkycHandoff {
  token: string;
  expiresAt: string;
}

export interface EkycHandoffInfo {
  maskedEmail: string;
  status: EkycStatus;
  expiresAt: string;
}

let mockMine: MyEkyc = { status: "None" };

function toForm(req: SubmitEkycRequest): FormData {
  const form = new FormData();
  form.append("qrText", req.qrText);
  form.append("faceDistance", req.faceDistance.toString());
  form.append("selfie", req.selfie, "selfie.jpg");
  form.append("front", req.front, "front.jpg");
  form.append("back", req.back, "back.jpg");
  return form;
}

export const ekycApi = {
  mine(): Promise<MyEkyc> {
    if (USE_MOCK) return mockResponse(mockMine);
    return apiFetch<MyEkyc>("/api/ekyc/me");
  },

  submit(req: SubmitEkycRequest): Promise<MyEkyc> {
    if (USE_MOCK) {
      const [id, , name] = req.qrText.split("|");
      mockMine = { status: "Verified", maskedCitizenId: `${id.slice(0, 3)}*******${id.slice(-2)}`, fullName: name, verifiedAt: new Date().toISOString() };
      return mockResponse(mockMine, 900);
    }
    return apiFetch<MyEkyc>("/api/ekyc", { method: "POST", body: toForm(req) });
  },

  /** Link 15 phút để làm eKYC trên điện thoại mà không phải đăng nhập ở đó. */
  createHandoff(): Promise<EkycHandoff> {
    if (USE_MOCK) return mockResponse({ token: "mock-handoff", expiresAt: new Date(Date.now() + 15 * 60_000).toISOString() });
    return apiFetch<EkycHandoff>("/api/ekyc/handoff", { method: "POST" });
  },

  getHandoff(token: string): Promise<EkycHandoffInfo> {
    if (USE_MOCK) return mockResponse({ maskedEmail: "a***@trustsign.vn", status: mockMine.status, expiresAt: new Date(Date.now() + 15 * 60_000).toISOString() });
    return apiFetch<EkycHandoffInfo>(`/api/ekyc/handoff/${encodeURIComponent(token)}`);
  },

  submitHandoff(token: string, req: SubmitEkycRequest): Promise<MyEkyc> {
    if (USE_MOCK) return ekycApi.submit(req);
    return apiFetch<MyEkyc>(`/api/ekyc/handoff/${encodeURIComponent(token)}`, { method: "POST", body: toForm(req) });
  },

  adminList(): Promise<AdminEkyc[]> {
    if (USE_MOCK) return mockResponse([]);
    return apiFetch<AdminEkyc[]>("/api/ekyc/admin");
  },

  /** Ảnh đã giải mã; người gọi phải URL.revokeObjectURL khi đóng. */
  async adminImageUrl(id: string, kind: EkycImageKind): Promise<string> {
    return URL.createObjectURL(await apiFetchBlob(`/api/ekyc/admin/${id}/images/${kind}`));
  },

  revoke(id: string, reason: string): Promise<void> {
    return apiFetch<void>(`/api/ekyc/admin/${id}/revoke`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
};
