"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  TimesheetHistoryItem,
  TimesheetHistoryResult,
  TimesheetHistoryStats,
} from "../types";
import { rangeForPreset, type PeriodPreset } from "../lib/date-range";

const PAGE_SIZE = 5;
const FILTER_DEBOUNCE_MS = 3000;

export type HistoryFilters = {
  from: string;
  to: string;
};

function defaultFilters(): HistoryFilters {
  return rangeForPreset("this-month");
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

const emptyStats = (from: string, to: string): TimesheetHistoryStats => ({
  totalDays: 0,
  totalTasks: 0,
  latestUpdated: null,
  from,
  to,
});

export function useTimesheetHistory() {
  const initial = defaultFilters();
  const [filters, setFilters] = useState<HistoryFilters>(initial);
  const [preset, setPreset] = useState<PeriodPreset>("this-month");
  const [items, setItems] = useState<TimesheetHistoryItem[]>([]);
  const [stats, setStats] = useState<TimesheetHistoryStats>(() =>
    emptyStats(initial.from, initial.to),
  );
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchPage = useCallback(
    async (nextFilters: HistoryFilters, nextPage: number) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          from: nextFilters.from,
          to: nextFilters.to,
          page: String(nextPage),
          limit: String(PAGE_SIZE),
        });

        const response = await fetch(`/api/timesheet/history?${params}`);
        if (!response.ok) {
          throw new Error(await parseError(response));
        }

        const data = (await response.json()) as TimesheetHistoryResult;
        setItems(data.items);
        setStats(data.stats);
        setTotal(data.total);
        setPage(data.page);
        setTotalPages(data.totalPages);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load history";
        setError(message);
        setItems([]);
        setStats(emptyStats(nextFilters.from, nextFilters.to));
        setTotal(0);
        setPage(1);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const scheduleFetch = useCallback(
    (nextFilters: HistoryFilters) => {
      clearDebounce();
      debounceRef.current = setTimeout(() => {
        setPage(1);
        void fetchPage(nextFilters, 1);
      }, FILTER_DEBOUNCE_MS);
    },
    [clearDebounce, fetchPage],
  );

  useEffect(() => {
    void fetchPage(initial, 1);
    return () => {
      clearDebounce();
    };
    // Initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateFilters(patch: Partial<HistoryFilters>) {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      scheduleFetch(next);
      return next;
    });
    if (patch.from !== undefined || patch.to !== undefined) {
      setPreset("custom");
    }
  }

  function selectPreset(next: PeriodPreset) {
    setPreset(next);
    if (next === "custom") {
      return;
    }
    const range = rangeForPreset(next);
    setFilters(range);
    scheduleFetch(range);
  }

  function resetFilters() {
    const next = defaultFilters();
    clearDebounce();
    setFilters(next);
    setPreset("this-month");
    setPage(1);
    void fetchPage(next, 1);
  }

  function goToPage(nextPage: number) {
    const safe = Math.max(1, Math.min(nextPage, totalPages));
    clearDebounce();
    void fetchPage(filtersRef.current, safe);
  }

  return {
    filters,
    preset,
    items,
    stats,
    total,
    page,
    totalPages,
    pageSize: PAGE_SIZE,
    loading,
    error,
    updateFilters,
    selectPreset,
    resetFilters,
    goToPage,
  };
}
