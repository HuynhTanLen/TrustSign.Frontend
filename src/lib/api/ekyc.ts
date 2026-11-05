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

let mockMine: MyEkyc = { status: "None" };

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
    const form = new FormData();
    form.append("qrText", req.qrText);
    form.append("faceDistance", req.faceDistance.toString());
    form.append("selfie", req.selfie, "selfie.jpg");
    form.append("front", req.front, "front.jpg");
    form.append("back", req.back, "back.jpg");
    return apiFetch<MyEkyc>("/api/ekyc", { method: "POST", body: form });
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
