import { useEffect, useState } from "react";
import { getTableDetail } from "../services/tableDetailStore";
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
        if (!cancelled) setData(result);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [tableId, refreshTrigger]);

  return { data, loading, error };
}
