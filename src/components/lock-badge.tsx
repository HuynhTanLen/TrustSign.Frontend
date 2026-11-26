import { CheckCircle2, Lock } from "lucide-react";

/** Nhãn trạng thái khóa tài khoản / doanh nghiệp. */
export function LockBadge({ locked }: { locked: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-sm text-xs font-semibold border ${
        locked
          ? "bg-[#991B1B] text-white border-[#7F1D1D]"
          : "bg-[#166534] text-white border-[#14532D]"
      }`}
    >
      {locked ? (
        <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      )}
      <span>{locked ? "Đã khóa" : "Hoạt động"}</span>
    </span>
  );
}
