import * as React from "react";
import { Skeleton } from "./skeleton";

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (row: T) => React.ReactNode;
  /** Shown as the card title on narrow screens. */
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
  /** Rendered instead of the rows when there are none, usually an EmptyState. */
  empty?: React.ReactNode;
  className?: string;
  /** Inside a Card: no outer border, the card provides it. */
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
      <div className={`hidden md:block overflow-x-auto bg-surface ${bare ? "" : "rounded-md border border-line"}`}>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`h-row px-3 bg-page border-b border-line text-table font-semibold text-fg whitespace-nowrap ${
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
                      <td key={c.key} className="h-row px-3">
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
                        selected ? "bg-selected" : "hover:bg-page"
                      } ${onRowClick ? "cursor-pointer" : ""}`}
                    >
                      {columns.map((c) => (
                        <td
                          key={c.key}
                          className={`h-row px-3 whitespace-nowrap ${
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

      <ul className={`md:hidden flex flex-col gap-2 ${bare ? "p-4" : ""}`}>
        {loading
          ? Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="p-4 rounded-md border border-line bg-surface flex flex-col gap-2">
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
                  className={`p-4 rounded-md border border-line ${
                    key === selectedKey ? "bg-selected" : "bg-surface"
                  } ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  <div className="text-sm font-semibold text-fg">{primary.render(row)}</div>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                    {rest.map((c) => (
                      <React.Fragment key={c.key}>
                        <dt className="text-muted">{c.header}</dt>
                        <dd className="text-fg">{c.render(row)}</dd>
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
