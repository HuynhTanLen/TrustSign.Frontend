/** Nhãn trạng thái khóa tài khoản / doanh nghiệp. */
export function LockBadge({ locked }: { locked: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold ring-1 ring-inset ${
        locked
          ? "bg-badge-declined-bg text-badge-declined-fg ring-badge-declined-fg/20"
          : "bg-badge-completed-bg text-badge-completed-fg ring-badge-completed-fg/20"
      }`}
    >
      <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {locked ? "Đã khóa" : "Hoạt động"}
    </span>
  );
}
