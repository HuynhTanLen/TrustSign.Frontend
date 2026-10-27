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

export function Badge({
  className = "",
  contractStatus,
  subscriptionStatus,
  children,
  ...props
}: BadgeProps) {
  let style = "bg-slate-100 text-slate-700 border border-slate-200";
  let dotColor = "bg-slate-400";
  let label = children;

  if (contractStatus) {
    switch (contractStatus) {
      case "Draft":
        style = "bg-slate-100 text-slate-700 border border-slate-200";
        dotColor = "bg-slate-400";
        label = label ?? "Nháp";
        break;
      case "Pending":
        style = "bg-amber-50 text-amber-800 border border-amber-200";
        dotColor = "bg-amber-500";
        label = label ?? "Chờ ký";
        break;
      case "Signing":
        style = "bg-indigo-50 text-indigo-700 border border-indigo-200";
        dotColor = "bg-indigo-600";
        label = label ?? "Đang ký";
        break;
      case "Completed":
        style = "bg-emerald-50 text-emerald-800 border border-emerald-200";
        dotColor = "bg-emerald-500";
        label = label ?? "Hoàn tất";
        break;
      case "Declined":
        style = "bg-rose-50 text-rose-800 border border-rose-200";
        dotColor = "bg-rose-500";
        label = label ?? "Từ chối";
        break;
      case "Cancelled":
        style = "bg-slate-100 text-slate-600 border border-slate-300";
        dotColor = "bg-slate-400";
        label = label ?? "Đã hủy";
        break;
      case "Expired":
        style = "bg-orange-50 text-orange-800 border border-orange-200";
        dotColor = "bg-orange-500";
        label = label ?? "Hết hạn";
        break;
    }
  } else if (subscriptionStatus) {
    switch (subscriptionStatus) {
      case "Trial":
        style = "bg-indigo-50 text-indigo-700 border border-indigo-200";
        dotColor = "bg-indigo-600";
        label = label ?? "Dùng thử";
        break;
      case "Active":
        style = "bg-emerald-50 text-emerald-800 border border-emerald-200";
        dotColor = "bg-emerald-500";
        label = label ?? "Hiệu lực";
        break;
      case "Expired":
        style = "bg-rose-50 text-rose-800 border border-rose-200";
        dotColor = "bg-rose-500";
        label = label ?? "Hết hạn";
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold select-none ${style} ${className}`}
      {...props}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}
