/** Account / tenant lock state, in words. */
export function LockBadge({ locked }: { locked: boolean }) {
  return (
    <span
      className={`inline-flex items-center h-[22px] px-2 rounded-sm text-xs font-semibold ${
        locked ? "bg-badge-declined-bg text-badge-declined-fg" : "bg-badge-completed-bg text-badge-completed-fg"
      }`}
    >
      {locked ? "Đã khóa" : "Hoạt động"}
    </span>
  );
}
