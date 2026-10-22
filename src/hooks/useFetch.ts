import { useEffect, useRef, useState } from "react";

interface FetchState<T> {
  key: string;
  data: T | null;
  failed: boolean;
}

export function useFetch<T>(key: string | null, fetcher: () => Promise<T>) {
  const [state, setState] = useState<FetchState<T> | null>(null);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (key === null) return;
    let cancelled = false;

    fetcherRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ key, data, failed: false });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setState({ key, data: null, failed: true });
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  const current = state !== null && state.key === key ? state : null;

  return {
    data: current?.data ?? null,
    failed: current?.failed ?? false,
    loading: key !== null && current === null
  };
}
