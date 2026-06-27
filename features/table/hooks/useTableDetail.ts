import { useEffect, useState } from "react";
import {
  getTableDetail,
  subscribeTableDetail,
} from "../services/tableDetailStore";
import { TableDetailCache } from "../types";

export function useTableDetail(tableId: string | null, refreshTrigger: number) {
  const [data, setData] = useState<TableDetailCache | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tableId) {
      setData(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getTableDetail(tableId);
        if (!cancelled) {
          setData(result);

          // Subscribe to cache changes
          const unsubscribe = subscribeTableDetail(tableId, (updatedData) => {
            if (!cancelled) {
              setData(updatedData);
            }
          });

          return unsubscribe;
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    let unsubscribe: (() => void) | void;

    load().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      cancelled = true;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [tableId, refreshTrigger]);

  return { data, loading, error };
}
