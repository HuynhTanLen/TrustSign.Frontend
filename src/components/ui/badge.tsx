import * as React from "react";

export type ContractStatus =
  | "Draft"
  | "Pending"
  | "Signing"
  | "Completed"
  | "Declined"
  | "Cancelled"
  | "Expired";

export type SubscriptionStatus = "Trial" | "Active" | "Expired";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  contractStatus?: ContractStatus;
  subscriptionStatus?: SubscriptionStatus;
}

const tones = {
  draft: "bg-badge-draft-bg text-badge-draft-fg",
  pending: "bg-badge-pending-bg text-badge-pending-fg",
  signing: "bg-badge-signing-bg text-badge-signing-fg",
  completed: "bg-badge-completed-bg text-badge-completed-fg",
  declined: "bg-badge-declined-bg text-badge-declined-fg",
  cancelled: "bg-badge-cancelled-bg text-badge-cancelled-fg",
  expired: "bg-badge-expired-bg text-badge-expired-fg",
};

const contractBadges: Record<ContractStatus, { tone: keyof typeof tones; label: string }> = {
  Draft: { tone: "draft", label: "Nháp" },
  Pending: { tone: "pending", label: "Chờ ký" },
  Signing: { tone: "signing", label: "Đang ký" },
  Completed: { tone: "completed", label: "Hoàn tất" },
  Declined: { tone: "declined", label: "Từ chối" },
  Cancelled: { tone: "cancelled", label: "Đã hủy" },
  Expired: { tone: "expired", label: "Hết hạn" },
};

const subscriptionBadges: Record<SubscriptionStatus, { tone: keyof typeof tones; label: string }> = {
  Trial: { tone: "signing", label: "Dùng thử" },
  Active: { tone: "completed", label: "Hiệu lực" },
  Expired: { tone: "declined", label: "Hết hạn" },
};

export function Badge({
  className = "",
  contractStatus,
  subscriptionStatus,
  children,
  ...props
}: BadgeProps) {
  const badge = contractStatus
    ? contractBadges[contractStatus]
    : subscriptionStatus
    ? subscriptionBadges[subscriptionStatus]
    : { tone: "draft" as const, label: "" };

  return (
    <span
      className={`inline-flex items-center h-[22px] px-2 rounded-sm text-xs font-semibold whitespace-nowrap select-none ${tones[badge.tone]} ${className}`}
      {...props}
    >
      {children ?? badge.label}
    </span>
  );
}
