import * as React from "react";
import { cn } from "@/lib/cn";

export type ContractStatus =
  | "Draft"
  | "Pending"
  | "Signing"
  | "Completed"
  | "Declined"
  | "Cancelled"
  | "Expired";

export type SubscriptionStatus = "Trial" | "Active" | "Expired";

export type BadgeTone =
  | "draft"
  | "pending"
  | "signing"
  | "completed"
  | "declined"
  | "cancelled"
  | "expired";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  contractStatus?: ContractStatus;
  subscriptionStatus?: SubscriptionStatus;
  /** Sắc thái hiển thị tùy chọn khi không truyền `contractStatus` hoặc `subscriptionStatus`. */
  tone?: BadgeTone;
  size?: "sm" | "md";
  dot?: boolean;
}

const tones: Record<BadgeTone, string> = {
  draft: "bg-badge-draft-bg text-badge-draft-fg ring-badge-draft-fg/15",
  pending: "bg-badge-pending-bg text-badge-pending-fg ring-badge-pending-fg/20",
  signing: "bg-badge-signing-bg text-badge-signing-fg ring-badge-signing-fg/20",
  completed: "bg-badge-completed-bg text-badge-completed-fg ring-badge-completed-fg/20",
  declined: "bg-badge-declined-bg text-badge-declined-fg ring-badge-declined-fg/20",
  cancelled: "bg-badge-cancelled-bg text-badge-cancelled-fg ring-badge-cancelled-fg/15",
  expired: "bg-badge-expired-bg text-badge-expired-fg ring-badge-expired-fg/20",
};

const sizes = {
  sm: "h-5 px-2 text-[11px] gap-1",
  md: "h-6 px-2.5 text-xs gap-1.5",
};

const contractBadges: Record<ContractStatus, { tone: BadgeTone; label: string }> = {
  Draft: { tone: "draft", label: "Nháp" },
  Pending: { tone: "pending", label: "Chờ ký" },
  Signing: { tone: "signing", label: "Đang ký" },
  Completed: { tone: "completed", label: "Hoàn tất" },
  Declined: { tone: "declined", label: "Từ chối" },
  Cancelled: { tone: "cancelled", label: "Đã hủy" },
  Expired: { tone: "expired", label: "Hết hạn" },
};

const subscriptionBadges: Record<SubscriptionStatus, { tone: BadgeTone; label: string }> = {
  Trial: { tone: "signing", label: "Dùng thử" },
  Active: { tone: "completed", label: "Hiệu lực" },
  Expired: { tone: "declined", label: "Hết hạn" },
};

export function Badge({
  className = "",
  contractStatus,
  subscriptionStatus,
  tone,
  size = "md",
  dot,
  children,
  ...props
}: BadgeProps) {
  const resolved = contractStatus
    ? contractBadges[contractStatus]
    : subscriptionStatus
    ? subscriptionBadges[subscriptionStatus]
    : { tone: tone ?? ("draft" as const), label: "" };

  const activeTone = tone ?? resolved.tone;
  const showDot = dot ?? Boolean(contractStatus || subscriptionStatus);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold ring-1 ring-inset whitespace-nowrap select-none",
        sizes[size],
        tones[activeTone],
        className,
      )}
      {...props}
    >
      {showDot && (
        <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      )}
      <span className="truncate">{children ?? resolved.label}</span>
    </span>
  );
}
