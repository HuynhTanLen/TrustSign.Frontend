import * as React from "react";
import { Skeleton } from "./skeleton";

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (row: T) => React.ReactNode;
  /** Cột tiêu đề chính khi hiển thị dạng thẻ trên màn hình hẹp. */
  primary?: boolean;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  selectedKey?: string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  empty?: React.ReactNode;
  className?: string;
  /** Đặt trong Card: không viền ngoài để khớp liền mạch với Card. */
  bare?: boolean;
}

export function Table<T>({
  columns,
  rows,
  getRowKey,
  selectedKey,
  onRowClick,
  loading = false,
  empty,
  className = "",
  bare = false,
}: TableProps<T>) {
  if (!loading && rows.length === 0 && empty) return <>{empty}</>;

  const primary = columns.find((c) => c.primary) ?? columns[0];
  const rest = columns.filter((c) => c !== primary);

  return (
    <div className={className}>
      <div
        className={`hidden md:block overflow-x-auto bg-surface ${
          bare ? "" : "rounded-lg border border-line shadow-card"
        }`}
      >
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`h-11 px-4 bg-strip/85 border-b border-line text-table font-semibold uppercase tracking-wider text-muted whitespace-nowrap ${
                    c.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} className="border-b border-line last:border-b-0">
                    {columns.map((c) => (
                      <td key={c.key} className="h-row px-4">
                        <Skeleton className="h-4 w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => {
                  const key = getRowKey(row);
                  const selected = key === selectedKey;
                  return (
                    <tr
                      key={key}
                      aria-selected={selectedKey !== undefined ? selected : undefined}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={`border-b border-line last:border-b-0 ${
                        selected ? "bg-selected/70" : "hover:bg-primary-subtle/60"
                      } ${onRowClick ? "cursor-pointer" : ""}`}
                    >
                      {columns.map((c) => (
                        <td
                          key={c.key}
                          className={`h-row px-4 whitespace-nowrap ${
                            c.align === "right" ? "text-right tabular-nums" : ""
                          } ${c.className ?? ""}`}
                        >
                          {c.render(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      <ul className={`md:hidden flex flex-col gap-3 ${bare ? "p-4" : ""}`}>
        {loading
          ? Array.from({ length: 3 }, (_, i) => (
              <li
                key={i}
                className="p-4 rounded-lg border border-line bg-surface shadow-xs flex flex-col gap-2"
              >
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </li>
            ))
          : rows.map((row) => {
              const key = getRowKey(row);
              return (
                <li
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`p-4 rounded-lg border border-line shadow-xs ${
                    key === selectedKey ? "bg-selected/70 border-primary/30" : "bg-surface"
                  } ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  <div className="text-sm font-semibold text-fg">{primary.render(row)}</div>
                  <dl className="mt-3 pt-2.5 border-t border-line grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs items-center">
                    {rest.map((c) => (
                      <React.Fragment key={c.key}>
                        <dt className="text-muted font-medium">{c.header || "Thao tác"}</dt>
                        <dd className="text-fg justify-self-end text-right">{c.render(row)}</dd>
                      </React.Fragment>
                    ))}
                  </dl>
                </li>
              );
            })}
      </ul>
    </div>
  );
}
