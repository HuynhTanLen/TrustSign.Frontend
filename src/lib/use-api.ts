"use client";

import * as React from "react";

interface ApiState<T> {
  requestKey: string;
  data?: T;
  error?: unknown;
}

/**
 * Loads `fetcher()` whenever `key` changes and exposes loading / error / data.
 * `key` should encode every input of the request (ids, filters).
 */
export function useApi<T>(key: string, fetcher: () => Promise<T>) {
  const [version, setVersion] = React.useState(0);
  const [state, setState] = React.useState<ApiState<T>>({ requestKey: "" });
  const requestKey = `${key}#${version}`;
  const load = React.useEffectEvent(fetcher);

  React.useEffect(() => {
    let alive = true;
    load().then(
      (data) => alive && setState({ requestKey, data }),
      (error) => alive && setState({ requestKey, error }),
    );
    return () => {
      alive = false;
    };
  }, [requestKey]);

  const settled = state.requestKey === requestKey;
  return {
    data: settled ? state.data : undefined,
    error: settled ? state.error : undefined,
    isLoading: !settled,
    reload: React.useCallback(() => setVersion((v) => v + 1), []),
    /** Update loaded data in place after a successful mutation. */
    mutate: React.useCallback(
      (update: (prev: T) => T) =>
        setState((s) => (s.data === undefined ? s : { ...s, data: update(s.data) })),
      [],
    ),
  };
}
