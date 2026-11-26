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
  | "trial"
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
  /** Bật hiệu ứng sóng xung quanh chấm trạng thái (beacon pulse). */
  pulse?: boolean;
}

const tones: Record<BadgeTone, string> = {
  draft: "bg-[#475569] text-white ring-[#334155] shadow-xs",
  pending: "bg-[#B45309] text-white ring-[#92400E] shadow-xs",
  signing: "bg-[#0F766E] text-white ring-[#115E59] shadow-xs",
  trial: "bg-[#1D4ED8] text-white ring-[#1E40AF] shadow-xs",
  completed: "bg-[#1B4332] text-white ring-[#143326] shadow-xs",
  declined: "bg-[#991B1B] text-white ring-[#7F1D1D] shadow-xs",
  cancelled: "bg-[#334155] text-white ring-[#1E293B] shadow-xs",
  expired: "bg-[#C2410C] text-white ring-[#9A3412] shadow-xs",
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
  Trial: { tone: "trial", label: "Dùng thử" },
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
  pulse,
  children,
  ...props
}: BadgeProps) {
  const resolved = contractStatus
    ? contractBadges[contractStatus]
    : subscriptionStatus
    ? subscriptionBadges[subscriptionStatus]
    : { tone: tone ?? ("draft" as const), label: "" };

  const activeTone = tone ?? resolved.tone;
  const showDot = dot ?? false;
  const shouldPulse = pulse ?? false;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm font-semibold ring-1 ring-inset whitespace-nowrap select-none",
        "transition-colors duration-150",
        sizes[size],
        tones[activeTone],
        className,
      )}
      {...props}
    >
      {showDot && (
        <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
          {shouldPulse && (
            <span
              aria-hidden="true"
              className="absolute inline-flex h-full w-full rounded-full bg-current opacity-75 animate-ping"
            />
          )}
          <span
            aria-hidden="true"
            className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current"
          />
        </span>
      )}
      <span className="truncate">{children ?? resolved.label}</span>
    </span>
  );
}
