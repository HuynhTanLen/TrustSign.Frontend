import { TENANT_VERIFICATION_LABELS, type TenantVerificationStatus } from "@/lib/api/tenants";

const STYLES: Record<TenantVerificationStatus, string> = {
  Unverified: "bg-badge-draft-bg text-badge-draft-fg ring-badge-draft-fg/20",
  Pending: "bg-badge-pending-bg text-badge-pending-fg ring-badge-pending-fg/20",
  Verified: "bg-badge-completed-bg text-badge-completed-fg ring-badge-completed-fg/20",
  Rejected: "bg-badge-declined-bg text-badge-declined-fg ring-badge-declined-fg/20",
};

/** Nhãn trạng thái xác thực pháp nhân của doanh nghiệp. */
export function VerificationBadge({ status }: { status: TenantVerificationStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold ring-1 ring-inset ${STYLES[status]}`}>
      <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {TENANT_VERIFICATION_LABELS[status]}
    </span>
  );
}
