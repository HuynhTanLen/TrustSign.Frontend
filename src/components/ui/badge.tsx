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
  /** Bật hiệu ứng sóng xung quanh chấm trạng thái (beacon pulse). */
  pulse?: boolean;
}

const tones: Record<BadgeTone, string> = {
  draft: "bg-slate-100/90 text-slate-700 ring-slate-300/60 shadow-xs",
  pending: "bg-amber-50 text-amber-800 ring-amber-300/80 shadow-xs",
  signing: "bg-blue-50 text-blue-700 ring-blue-300/80 shadow-xs",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-300/80 shadow-xs",
  declined: "bg-rose-50 text-rose-800 ring-rose-300/80 shadow-xs",
  cancelled: "bg-gray-100 text-gray-700 ring-gray-300/60 shadow-xs",
  expired: "bg-orange-50 text-orange-800 ring-orange-300/80 shadow-xs",
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
  const showDot = dot ?? Boolean(contractStatus || subscriptionStatus);

  // Tự động bật pulse cho các trạng thái đang diễn ra
  const shouldPulse =
    pulse ??
    (contractStatus === "Signing" ||
      contractStatus === "Pending" ||
      subscriptionStatus === "Active" ||
      activeTone === "signing" ||
      activeTone === "pending");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold ring-1 ring-inset whitespace-nowrap select-none",
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
