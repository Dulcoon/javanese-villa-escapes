import { useState, useCallback, useRef, useEffect } from "react";
import { api, type DailyPriceEntry, type DailyPriceMap } from "@/lib/api";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";

interface UseDailyPricesReturn {
  /** Get the price info for a specific date string (YYYY-MM-DD). Returns undefined if not yet loaded, null if loading. */
  getPriceForDate: (dateStr: string) => DailyPriceEntry | null | undefined;
  /** Fetch prices for a specific month (will be cached). */
  fetchMonth: (year: number, month: number) => void;
  /** Set of months currently being loaded (format: "YYYY-MM") */
  loadingMonths: Set<string>;
}

/**
 * Hook to lazy-load daily prices per month for a given villa.
 * On mount, it pre-fetches the current month and next month.
 * Additional months can be fetched on demand (e.g., on scroll / month change).
 */
export function useDailyPrices(slug: string | undefined): UseDailyPricesReturn {
  // Cache: Map<"YYYY-MM", DailyPriceMap>
  const cacheRef = useRef<Map<string, DailyPriceMap>>(new Map());
  const [, forceUpdate] = useState(0);
  const [loadingMonths, setLoadingMonths] = useState<Set<string>>(new Set());
  const inflight = useRef<Set<string>>(new Set());

  const fetchMonth = useCallback(
    (year: number, month: number) => {
      if (!slug) return;

      const key = `${year}-${String(month).padStart(2, "0")}`;

      // Already cached or in-flight
      if (cacheRef.current.has(key) || inflight.current.has(key)) return;

      inflight.current.add(key);
      setLoadingMonths((prev) => new Set(prev).add(key));

      const monthDate = new Date(year, month - 1, 1);
      const startDate = format(startOfMonth(monthDate), "yyyy-MM-dd");
      const endDate = format(endOfMonth(monthDate), "yyyy-MM-dd");

      api
        .getDailyPrices(slug, startDate, endDate)
        .then((res) => {
          cacheRef.current.set(key, res.data);
          inflight.current.delete(key);
          setLoadingMonths((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
          forceUpdate((n) => n + 1);
        })
        .catch(() => {
          inflight.current.delete(key);
          setLoadingMonths((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        });
    },
    [slug],
  );

  // Pre-fetch current month + next 2 months on mount (mobile drawer shows 3 months)
  useEffect(() => {
    if (!slug) return;
    const now = new Date();
    const next1 = addMonths(now, 1);
    const next2 = addMonths(now, 2);
    fetchMonth(now.getFullYear(), now.getMonth() + 1);
    fetchMonth(next1.getFullYear(), next1.getMonth() + 1);
    fetchMonth(next2.getFullYear(), next2.getMonth() + 1);
  }, [slug, fetchMonth]);

  const getPriceForDate = useCallback(
    (dateStr: string): DailyPriceEntry | null | undefined => {
      // dateStr is "YYYY-MM-DD"
      const monthKey = dateStr.slice(0, 7); // "YYYY-MM"

      const monthData = cacheRef.current.get(monthKey);
      if (monthData) {
        return monthData[dateStr] ?? undefined;
      }

      // Month is being loaded → return null (loading state)
      if (loadingMonths.has(monthKey) || inflight.current.has(monthKey)) {
        return null;
      }

      // Month not loaded and not in flight → return undefined (not yet requested)
      return undefined;
    },
    [loadingMonths],
  );

  return { getPriceForDate, fetchMonth, loadingMonths };
}
