import { Clock, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { TENANT_VERIFICATION_LABELS, type TenantVerificationStatus } from "@/lib/api/tenants";

const META: Record<TenantVerificationStatus, { style: string; Icon: typeof ShieldCheck }> = {
  Unverified: {
    style: "bg-[#475569] text-white border-[#334155]",
    Icon: ShieldAlert,
  },
  Pending: {
    style: "bg-[#B45309] text-white border-[#92400E]",
    Icon: Clock,
  },
  Verified: {
    style: "bg-[#1B4332] text-white border-[#143326]",
    Icon: ShieldCheck,
  },
  Rejected: {
    style: "bg-[#991B1B] text-white border-[#7F1D1D]",
    Icon: ShieldX,
  },
};

/** Nhãn trạng thái xác thực pháp nhân của doanh nghiệp. */
export function VerificationBadge({ status }: { status: TenantVerificationStatus }) {
  const { style, Icon } = META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-sm text-xs font-semibold border ${style}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{TENANT_VERIFICATION_LABELS[status]}</span>
    </span>
  );
}
