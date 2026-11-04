import * as React from "react";
import { cn } from "@/lib/cn";
import { ErrorState } from "./error-state";
import { Skeleton } from "./skeleton";

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  render: (row: T, index: number) => React.ReactNode;
  /** Cột tiêu đề chính khi hiển thị dạng thẻ trên màn hình hẹp. */
  primary?: boolean;
  /** Ẩn cột này trên chế độ thẻ di động để giao diện gọn gàng hơn. */
  hideOnMobile?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: readonly T[] | null | undefined;
  getRowKey: (row: T, index: number) => string;
  selectedKey?: string;
  onRowClick?: (row: T) => void;
  /** Trạng thái đang tải lần đầu (hiển thị Skeleton). */
  loading?: boolean;
  /** Trạng thái đang làm mới dữ liệu ngầm (giữ nguyên dữ liệu hiện có). */
  refreshing?: boolean;
  /** Số dòng Skeleton hiển thị khi đang tải. */
  skeletonRows?: number;
  /** Lỗi tải dữ liệu tùy chọn (hiển thị ErrorState ngay trong khung). */
  error?: unknown;
  onRetry?: () => void;
  /** Giao diện khi danh sách rỗng. */
  empty?: React.ReactNode;
  /** Nhãn mô tả bảng cho trình đọc màn hình (Screen Reader). */
  ariaLabel?: string;
  className?: string;
  /** Đặt trong Card: không viền ngoài để khớp liền mạch với Card. */
  bare?: boolean;
}

/** Kiểm tra xem sự kiện có xuất phát từ phần tử tương tác con (nút, link, ô nhập) bên trong dòng hay không. */
function isInteractiveChild(target: EventTarget | null, currentTarget: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement) || !(currentTarget instanceof HTMLElement)) {
    return false;
  }
  const interactive = target.closest(
    'button, a, input, select, textarea, label, [role="button"], [role="menuitem"], [data-stop-row-click]',
  );
  return Boolean(interactive && interactive !== currentTarget);
}

export function Table<T>({
  columns,
  rows,
  getRowKey,
  selectedKey,
  onRowClick,
  loading = false,
  refreshing = false,
  skeletonRows = 5,
  error,
  onRetry,
  empty,
  ariaLabel,
  className = "",
  bare = false,
}: TableProps<T>) {
  const safeRows = React.useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  if (error && safeRows.length === 0) {
    return (
      <div className={cn(bare ? "p-4" : "", className)}>
        <ErrorState error={error} onRetry={onRetry} />
      </div>
    );
  }

  if (!loading && safeRows.length === 0) {
    if (empty) return <>{empty}</>;
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "px-6 py-10 text-center text-sm text-muted bg-surface",
          !bare && "rounded-lg border border-line shadow-card",
          className,
        )}
      >
        Chưa có dữ liệu hiển thị.
      </div>
    );
  }

  if (columns.length === 0) return null;

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const rest = columns.filter((c) => c !== primary && !c.hideOnMobile);

  const handleRowClick = (e: React.MouseEvent<HTMLElement>, row: T) => {
    if (!onRowClick) return;
    if (isInteractiveChild(e.target, e.currentTarget)) return;
    onRowClick(row);
  };

  const handleRowKeyDown = (e: React.KeyboardEvent<HTMLElement>, row: T) => {
    if (!onRowClick) return;
    if (isInteractiveChild(e.target, e.currentTarget)) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <div
      aria-busy={loading || refreshing || undefined}
      className={cn("relative", className)}
    >
      {/* Thanh tiến trình mảnh khi đang làm mới dữ liệu ngầm */}
      {refreshing && !loading && (
        <div
          role="progressbar"
          aria-label="Đang cập nhật dữ liệu"
          className="absolute top-0 inset-x-0 h-0.5 bg-primary/15 overflow-hidden z-10"
        >
          <div className="h-full w-full bg-primary animate-pulse" />
        </div>
      )}

      {/* DESKTOP VIEW: Semantic Table */}
      <div
        className={cn(
          "hidden md:block overflow-x-auto bg-surface",
          !bare && "rounded-lg border border-line shadow-card",
        )}
      >
        <table className="w-full border-collapse text-sm" aria-label={ariaLabel}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    "h-11 px-4 bg-strip/85 border-b border-line text-table font-semibold uppercase tracking-wider text-muted whitespace-nowrap select-none",
                    c.align === "right"
                      ? "text-right"
                      : c.align === "center"
                      ? "text-center"
                      : "text-left",
                    c.headerClassName,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: skeletonRows }, (_, i) => (
                  <tr key={i} className="border-b border-line last:border-b-0">
                    {columns.map((c) => (
                      <td key={c.key} className="h-row px-4">
                        <Skeleton
                          className={cn(
                            "h-4",
                            c.align === "right" ? "ml-auto w-1/2" : "w-3/4",
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : safeRows.map((row, rowIndex) => {
                  const key = getRowKey(row, rowIndex);
                  const selected = selectedKey !== undefined && key === selectedKey;
                  const interactive = Boolean(onRowClick);

                  return (
                    <tr
                      key={key}
                      tabIndex={interactive ? 0 : undefined}
                      aria-selected={selectedKey !== undefined ? selected : undefined}
                      onClick={interactive ? (e) => handleRowClick(e, row) : undefined}
                      onKeyDown={interactive ? (e) => handleRowKeyDown(e, row) : undefined}
                      className={cn(
                        "border-b border-line last:border-b-0",
                        selected ? "bg-selected/70" : "hover:bg-primary-subtle/60",
                        interactive &&
                          "cursor-pointer focus-visible:outline-none focus-visible:bg-selected/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
                      )}
                    >
                      {columns.map((c) => {
                        const content = c.render(row, rowIndex);
                        return (
                          <td
                            key={c.key}
                            className={cn(
                              "h-row px-4 whitespace-nowrap",
                              c.align === "right" && "text-right tabular-nums",
                              c.align === "center" && "text-center",
                              c.className,
                            )}
                          >
                            {content ?? <span className="text-muted/60">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW: Responsive Card Stack */}
      <ul
        aria-label={ariaLabel}
        className={cn("md:hidden flex flex-col gap-3", bare && "p-4")}
      >
        {loading
          ? Array.from({ length: Math.min(skeletonRows, 3) }, (_, i) => (
              <li
                key={i}
                aria-hidden="true"
                className="p-4 rounded-lg border border-line bg-surface shadow-xs flex flex-col gap-2.5"
              >
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-3.5 w-3/4" />
              </li>
            ))
          : safeRows.map((row, rowIndex) => {
              const key = getRowKey(row, rowIndex);
              const selected = selectedKey !== undefined && key === selectedKey;
              const interactive = Boolean(onRowClick);

              return (
                <li
                  key={key}
                  tabIndex={interactive ? 0 : undefined}
                  onClick={interactive ? (e) => handleRowClick(e, row) : undefined}
                  onKeyDown={interactive ? (e) => handleRowKeyDown(e, row) : undefined}
                  className={cn(
                    "p-4 rounded-lg border border-line shadow-xs transition-colors",
                    selected ? "bg-selected/70 border-primary/30" : "bg-surface",
                    interactive &&
                      "cursor-pointer active:bg-strip focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  )}
                >
                  <div className="text-sm font-semibold text-fg break-words">
                    {primary.render(row, rowIndex)}
                  </div>
                  {rest.length > 0 && (
                    <dl className="mt-3 pt-2.5 border-t border-line grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs items-center">
                      {rest.map((c) => (
                        <React.Fragment key={c.key}>
                          <dt className="text-muted font-medium shrink-0">
                            {c.header || "Thao tác"}
                          </dt>
                          <dd className="text-fg justify-self-end text-right min-w-0 break-words">
                            {c.render(row, rowIndex) ?? "—"}
                          </dd>
                        </React.Fragment>
                      ))}
                    </dl>
                  )}
                </li>
              );
            })}
      </ul>
    </div>
  );
}
