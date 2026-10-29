/**
 * Sample data for NEXT_PUBLIC_USE_MOCK=true only. One small fictional company so screens
 * agree with each other; dates are relative to now. Mutations in mock mode edit these
 * arrays in memory until the page is reloaded.
 */
import type { ContractDetail, ContractListItem } from "@/lib/api/contracts";
import type { TemplateSummary } from "@/lib/api/templates";
import type { CurrentSubscription, Invoice, Plan } from "@/lib/api/subscription";
import type { AdminStats, TenantStats } from "@/lib/api/stats";
import type { AdminTenant, AdminUser, Certificate, CertificateAuthorityInfo } from "@/lib/api/admin";
import type { SigningSession } from "@/lib/api/signing";
import type { VerifyResult } from "@/lib/api/verify";
import type { SavedSignature } from "@/lib/api/signatures";

const at = (days: number, hour = 9, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};
const monthKey = (offset: number) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const signatureSvg = (text: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="120"><text x="20" y="78" font-family="Brush Script MT, Segoe Script, cursive" font-size="44" fill="#1b3a5c">${text}</text></svg>`,
  )}`;

const contracts: ContractListItem[] = [
  { id: "c-142", code: "HĐ-0142", title: "Hợp đồng dịch vụ bảo trì phần mềm", partner: "Công ty TNHH Minh Phát", creatorName: "Lê Thu Hà", status: "Signing", sentAt: at(-2, 14), dueAt: at(3, 17), currentSigner: "Phạm Quốc Bảo" },
  { id: "c-141", code: "HĐ-0141", title: "Phụ lục gia hạn thuê văn phòng", partner: "CTCP Bất động sản An Khang", creatorName: "Lê Thu Hà", status: "Completed", sentAt: at(-6, 10), dueAt: at(-1, 17) },
  { id: "c-140", code: "HĐ-0140", title: "Hợp đồng lao động", partner: "Đỗ Minh Khôi", creatorName: "Ngô Thanh Tùng", status: "Pending", sentAt: at(-1, 8, 30), dueAt: at(0, 23), currentSigner: "Đỗ Minh Khôi" },
  { id: "c-139", code: "HĐ-0139", title: "Thỏa thuận bảo mật thông tin", partner: "Công ty TNHH Kỹ thuật Hưng Thịnh", creatorName: "Lê Thu Hà", status: "Pending", sentAt: at(-3, 15), dueAt: at(1, 12), currentSigner: "Vũ Hải Yến" },
  { id: "c-137", code: "HĐ-0137", title: "Biên bản thanh lý hợp đồng vận chuyển", partner: "CTCP Vận tải Đông Bắc", creatorName: "Ngô Thanh Tùng", status: "Declined", sentAt: at(-9, 9), dueAt: at(-4, 17) },
  { id: "c-136", code: "HĐ-0136", title: "Hợp đồng mua bán thiết bị", partner: "Công ty TNHH Thiết bị Sao Mai", creatorName: "Lê Thu Hà", status: "Draft", sentAt: null, dueAt: null },
  { id: "c-133", code: "HĐ-0133", title: "Hợp đồng tư vấn kế toán", partner: "Công ty Kiểm toán Phương Nam", creatorName: "Ngô Thanh Tùng", status: "Expired", sentAt: at(-20, 9), dueAt: at(-13, 17) },
];

const hash = (seed: string) =>
  Array.from({ length: 64 }, (_, i) => "0123456789abcdef"[(seed.charCodeAt(i % seed.length) * (i + 7)) % 16]).join("");

const contractDetails: ContractDetail[] = [
  {
    ...contracts[0],
    documentUrl: null,
    signers: [
      { order: 1, fullName: "Lê Thu Hà", email: "ha.le@vietsoft.example", status: "Signed", signedAt: at(-2, 15, 5), declineReason: null },
      { order: 2, fullName: "Phạm Quốc Bảo", email: "bao.pham@minhphat.example", status: "Current", signedAt: null, declineReason: null },
    ],
    signatures: [
      { signerName: "Lê Thu Hà", signerEmail: "ha.le@vietsoft.example", issuer: "TrustSign Issuing CA", serial: "5F:2A:90:E4:11:B2", signedAt: at(-2, 15, 5), timestampAuthority: "FreeTSA (RFC 3161)", valid: true },
    ],
    events: [
      { at: at(-1, 9, 12), title: "Phạm Quốc Bảo mở link ký", detail: "Đã gửi mã OTP tới email người ký", hash: hash("e4") },
      { at: at(-2, 15, 5), title: "Lê Thu Hà ký", detail: "Xác thực OTP, chữ ký số đã nhúng vào PDF", hash: hash("e3") },
      { at: at(-2, 14, 2), title: "Gửi ký", detail: "Gửi lời mời cho người ký thứ nhất", hash: hash("e2") },
      { at: at(-2, 13, 40), title: "Tạo hợp đồng", detail: "Từ mẫu Hợp đồng dịch vụ", hash: hash("e1") },
    ],
  },
  {
    ...contracts[1],
    documentUrl: null,
    signers: [
      { order: 1, fullName: "Lê Thu Hà", email: "ha.le@vietsoft.example", status: "Signed", signedAt: at(-6, 11), declineReason: null },
      { order: 2, fullName: "Trịnh Văn Sơn", email: "son.trinh@ankhang.example", status: "Signed", signedAt: at(-5, 16, 20), declineReason: null },
    ],
    signatures: [
      { signerName: "Lê Thu Hà", signerEmail: "ha.le@vietsoft.example", issuer: "TrustSign Issuing CA", serial: "3B:99:18:C2:04:F1", signedAt: at(-6, 11), timestampAuthority: "FreeTSA (RFC 3161)", valid: true },
      { signerName: "Trịnh Văn Sơn", signerEmail: "son.trinh@ankhang.example", issuer: "TrustSign Issuing CA", serial: "8C:41:03:D9:77:A0", signedAt: at(-5, 16, 20), timestampAuthority: "FreeTSA (RFC 3161)", valid: true },
    ],
    events: [
      { at: at(-5, 16, 21), title: "Hoàn tất", detail: "Đóng dấu của hệ thống và dấu thời gian", hash: hash("f4") },
      { at: at(-5, 16, 20), title: "Trịnh Văn Sơn ký", detail: "Xác thực OTP", hash: hash("f3") },
      { at: at(-6, 11), title: "Lê Thu Hà ký", detail: "Dùng chữ ký đã lưu", hash: hash("f2") },
      { at: at(-6, 10), title: "Tạo và gửi ký", detail: "Tải lên file PDF", hash: hash("f1") },
    ],
  },
];

const templates: TemplateSummary[] = [
  { id: "tpl-1", name: "Hợp đồng dịch vụ", variables: ["ten_doi_tac", "ma_so_thue", "gia_tri_hd", "ngay_hieu_luc"], authorName: "Lê Thu Hà", updatedAt: at(-3, 15, 30) },
  { id: "tpl-2", name: "Thỏa thuận bảo mật thông tin", variables: ["ten_ben_nhan", "dai_dien", "thoi_han_bao_mat"], authorName: "Lê Thu Hà", updatedAt: at(-8, 10, 15) },
  { id: "tpl-3", name: "Hợp đồng lao động", variables: ["ho_ten", "cccd", "vi_tri", "muc_luong", "ngay_bat_dau", "thoi_han"], authorName: "Ngô Thanh Tùng", updatedAt: at(-15, 9) },
];

const plans: Plan[] = [
  { id: "plan-trial", name: "Dùng thử", price: 0, durationDays: 14, monthlyQuota: 5, isTrial: true, isActive: true },
  { id: "plan-basic", name: "Cơ bản", price: 299000, durationDays: 30, monthlyQuota: 20, isTrial: false, isActive: true },
  { id: "plan-pro", name: "Doanh nghiệp", price: 699000, durationDays: 30, monthlyQuota: 100, isTrial: false, isActive: true },
  { id: "plan-old", name: "Khởi nghiệp 2025", price: 199000, durationDays: 30, monthlyQuota: 10, isTrial: false, isActive: false },
];

const subscription: CurrentSubscription = {
  planId: "plan-basic",
  planName: "Cơ bản",
  price: 299000,
  durationDays: 30,
  status: "Active",
  expiresAt: at(5, 23, 59),
  quotaUsed: 18,
  quotaLimit: 20,
};

const invoices: Invoice[] = [
  { code: "TS20481", planName: "Cơ bản", amount: 299000, status: "Paid", createdAt: at(-25, 10, 15), paidAt: at(-25, 10, 17) },
  { code: "TS19310", planName: "Cơ bản", amount: 299000, status: "Paid", createdAt: at(-55, 9, 30), paidAt: at(-55, 9, 41) },
  { code: "TS18902", planName: "Doanh nghiệp", amount: 699000, status: "Expired", createdAt: at(-58, 14), paidAt: null },
];

const tenantStats: TenantStats = {
  totalContracts: 48,
  pending: 5,
  pendingDueSoon: 2,
  completedThisMonth: 24,
  quotaUsed: subscription.quotaUsed,
  quotaLimit: subscription.quotaLimit,
  monthly: [18, 24, 21, 32, 38, 48].map((count, i) => ({ month: monthKey(i - 5), count })),
  byStatus: [
    { status: "Completed", count: 34 },
    { status: "Signing", count: 5 },
    { status: "Pending", count: 3 },
    { status: "Draft", count: 4 },
    { status: "Declined", count: 2 },
  ],
  dueSoon: contracts.filter((c) => c.status === "Pending" || c.status === "Signing"),
};

const adminTenants: AdminTenant[] = [
  { id: "tn-1", name: "CTCP Phần mềm Việt Soft", taxCode: "0109827364", ownerEmail: "ha.le@vietsoft.example", planName: "Cơ bản", subscriptionStatus: "Active", membersCount: 8, isLocked: false, lockReason: null },
  { id: "tn-2", name: "Công ty TNHH Logistics Biển Đông", taxCode: "0314891204", ownerEmail: "admin@biendong.example", planName: "Doanh nghiệp", subscriptionStatus: "Active", membersCount: 24, isLocked: false, lockReason: null },
  { id: "tn-3", name: "CTCP Thương mại Sao Mai", taxCode: "0105541920", ownerEmail: "contact@saomai.example", planName: "Dùng thử", subscriptionStatus: "Trial", membersCount: 3, isLocked: false, lockReason: null },
  { id: "tn-4", name: "Công ty TNHH Đầu tư Ánh Dương", taxCode: null, ownerEmail: "admin@anhduong.example", planName: "Cơ bản", subscriptionStatus: "Expired", membersCount: 5, isLocked: true, lockReason: "Gửi hàng loạt lời mời ký không rõ nguồn gốc" },
];

const adminStats: Omit<AdminStats, "recentTenants"> = {
  tenants: 128,
  newTenantsThisMonth: 14,
  revenueThisMonth: 56_810_000,
  paidInvoicesThisMonth: 98,
  subscriptionsByPlan: [
    { planName: "Cơ bản", price: 299000, count: 58 },
    { planName: "Doanh nghiệp", price: 699000, count: 36 },
    { planName: "Dùng thử", price: 0, count: 34 },
  ],
  certificatesIssued: 412,
  certificatesRevoked: 3,
  revenue12m: [18.5, 22, 21.4, 25.8, 29.2, 33.5, 36, 41.2, 44.8, 48.1, 52.4, 56.81].map((m, i) => ({
    month: monthKey(i - 11),
    amount: Math.round(m * 1_000_000),
  })),
};

const adminUsers: AdminUser[] = [
  { id: "u-1", fullName: "Lê Thu Hà", email: "ha.le@vietsoft.example", tenantsCount: 2, emailVerified: true, isLocked: false, lockReason: null },
  { id: "u-2", fullName: "Ngô Thanh Tùng", email: "tung.ngo@vietsoft.example", tenantsCount: 1, emailVerified: true, isLocked: false, lockReason: null },
  { id: "u-3", fullName: "Vũ Hải Yến", email: "yen.vu@hungthinh.example", tenantsCount: 1, emailVerified: false, isLocked: false, lockReason: null },
  { id: "u-4", fullName: "Hồ Quang Vinh", email: "vinh.ho@anhduong.example", tenantsCount: 1, emailVerified: true, isLocked: true, lockReason: "Nhập sai OTP nhiều lần từ nhiều địa chỉ IP" },
];

const certificateAuthority: CertificateAuthorityInfo = {
  rootName: "TrustSign Root CA",
  issuingName: "TrustSign Issuing CA",
  algorithm: "RSA-2048 / SHA256withRSA",
};

const certificates: Certificate[] = [
  { serial: "5F:2A:90:E4:11:B2", subject: "CN=Lê Thu Hà, O=CTCP Phần mềm Việt Soft", subjectEmail: "ha.le@vietsoft.example", tenantName: "CTCP Phần mềm Việt Soft", validFrom: at(-40), validTo: at(325), revoked: false, revokeReason: null },
  { serial: "8C:41:03:D9:77:A0", subject: "CN=Trịnh Văn Sơn", subjectEmail: "son.trinh@ankhang.example", tenantName: "Người ký ngoài (OTP)", validFrom: at(-5), validTo: at(360), revoked: false, revokeReason: null },
  { serial: "3B:99:18:C2:04:F1", subject: "CN=Ngô Thanh Tùng, O=CTCP Phần mềm Việt Soft", subjectEmail: "tung.ngo@vietsoft.example", tenantName: "CTCP Phần mềm Việt Soft", validFrom: at(-30), validTo: at(335), revoked: false, revokeReason: null },
  { serial: "1A:08:77:E1:55:C9", subject: "CN=Hồ Quang Vinh, O=Công ty TNHH Đầu tư Ánh Dương", subjectEmail: "vinh.ho@anhduong.example", tenantName: "Công ty TNHH Đầu tư Ánh Dương", validFrom: at(-60), validTo: at(305), revoked: true, revokeReason: "Lộ khóa riêng" },
];

const signingSession: { token: string; otp: string; session: SigningSession } = {
  token: "demo-token",
  otp: "123456",
  session: {
    contractCode: "HĐ-0142",
    contractTitle: "Hợp đồng dịch vụ bảo trì phần mềm",
    senderCompany: "CTCP Phần mềm Việt Soft",
    signerName: "Phạm Quốc Bảo",
    signerEmailMasked: "ba***@minhphat.example",
    order: 2,
    totalSigners: 2,
    state: "AwaitingOtp",
    dueAt: at(3, 17),
    fields: [
      { signerOrder: 1, signerName: "Lê Thu Hà", isMine: false, signed: true },
      { signerOrder: 2, signerName: "Phạm Quốc Bảo", isMine: true, signed: false },
    ],
    documentUrl: null,
  },
};

const validEvents = contractDetails[1].events
  .slice()
  .reverse()
  .map((e, i, all) => ({ index: i + 1, title: e.title, prevHash: i === 0 ? "0".repeat(64) : all[i - 1].hash, hash: e.hash, ok: true }));

const verifyResults: Record<string, VerifyResult> = {
  "HĐ-0141": {
    outcome: "Valid",
    contractCode: "HĐ-0141",
    contractTitle: contracts[1].title,
    signatures: contractDetails[1].signatures.map((s) => ({
      signerName: s.signerName,
      issuer: s.issuer,
      serial: s.serial,
      signedAt: s.signedAt,
      intact: true,
      certificateStatus: "Valid" as const,
    })),
    events: validEvents,
  },
  "HĐ-0099": {
    outcome: "Tampered",
    contractCode: "HĐ-0099",
    contractTitle: "Hợp đồng đại lý phân phối",
    signatures: [
      { signerName: "Lê Thu Hà", issuer: "TrustSign Issuing CA", serial: "5F:2A:90:E4:11:B2", signedAt: at(-30, 10), intact: false, certificateStatus: "Valid" },
    ],
    events: validEvents.map((e) => (e.index === 2 ? { ...e, hash: hash("tampered"), ok: false } : e)),
  },
};

const signatures: SavedSignature[] = [
  { id: "sig-1", label: "Chữ ký đầy đủ", kind: "Draw", imageUrl: signatureSvg("Thu Hà"), isDefault: true, createdAt: at(-20) },
  { id: "sig-2", label: "Chữ ký nháy", kind: "Upload", imageUrl: signatureSvg("Hà"), isDefault: false, createdAt: at(-12) },
];

export const mockDb = {
  currentUserName: "Lê Thu Hà",
  bank: { name: "VietinBank", account: "102874910283" },
  contracts,
  contractDetails,
  templates,
  plans,
  subscription,
  invoices,
  tenantStats,
  adminStats,
  adminTenants,
  adminUsers,
  certificateAuthority,
  certificates,
  signingSession,
  verifyResults,
  signatures,
};
