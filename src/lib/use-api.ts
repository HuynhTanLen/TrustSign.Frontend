"use client";

import * as React from "react";

interface ApiState<T> {
  requestKey: string;
  baseKey: string;
  data?: T;
  error?: unknown;
}

/**
 * Tải dữ liệu từ `fetcher()` mỗi khi `key` thay đổi, quản lý trạng thái:
 * - `isLoading`: Đang tải lần đầu (chưa có dữ liệu)
 * - `isRefreshing`: Đang làm mới dữ liệu ngầm (giữ nguyên dữ liệu hiện có tránh giật giao diện)
 * - `error`: Lỗi phát sinh ở lần tải gần nhất
 * - `reload`: Tải lại dữ liệu chủ động
 * - `mutate`: Cập nhật lạc quan (optimistic/in-place update) dữ liệu trong bộ nhớ
 */
export function useApi<T>(key: string, fetcher: () => Promise<T>) {
  const [version, setVersion] = React.useState(0);
  const [state, setState] = React.useState<ApiState<T>>({
    requestKey: "",
    baseKey: "",
  });
  const requestKey = `${key}#${version}`;
  const load = React.useEffectEvent(fetcher);

  React.useEffect(() => {
    let alive = true;
    load().then(
      (data) => {
        if (alive) {
          setState({ requestKey, baseKey: key, data, error: undefined });
        }
      },
      (error) => {
        if (alive) {
          setState((prev) => ({
            requestKey,
            baseKey: key,
            // Giữ lại dữ liệu cũ nếu đang làm mới cùng một key mà gặp lỗi mạng tạm thời
            data: prev.baseKey === key ? prev.data : undefined,
            error,
          }));
        }
      },
    );
    return () => {
      alive = false;
    };
  }, [requestKey, key]);

  const settled = state.requestKey === requestKey;
  const hasSameKeyData = state.baseKey === key && state.data !== undefined;
  const data = settled ? state.data : hasSameKeyData ? state.data : undefined;

  return {
    data,
    error: settled ? state.error : undefined,
    isLoading: !settled && data === undefined,
    isRefreshing: !settled && data !== undefined,
    reload: React.useCallback(() => setVersion((v) => v + 1), []),
    /** Cập nhật dữ liệu tại chỗ sau khi thao tác (mutation) thành công. */
    mutate: React.useCallback(
      (update: (prev: T) => T) =>
        setState((s) => (s.data === undefined ? s : { ...s, data: update(s.data) })),
      [],
    ),
  };
}
