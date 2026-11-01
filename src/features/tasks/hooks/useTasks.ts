"use client";

import { useCallback, useEffect, useState } from "react";
import type { Task } from "../types";

const PAGE_SIZE = 5;

type UseTasksOptions = {
  workDate: string;
};

type ListResponse = {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export function useTasks({ workDate }: UseTasksOptions) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAll = useCallback(async (date: string) => {
    const response = await fetch(
      `/api/tasks?date=${encodeURIComponent(date)}&all=1`,
    );
    if (!response.ok) {
      throw new Error(await parseError(response));
    }
    const data = (await response.json()) as ListResponse;
    setAllTasks(data.tasks);
    return data.tasks;
  }, []);

  const refresh = useCallback(
    async (date: string, nextPage = page) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/tasks?date=${encodeURIComponent(date)}&page=${nextPage}&limit=${PAGE_SIZE}`,
        );
        if (!response.ok) {
          throw new Error(await parseError(response));
        }

        const data = (await response.json()) as ListResponse;
        const safePage = Math.min(nextPage, data.totalPages);

        if (safePage !== nextPage && data.total > 0) {
          const retry = await fetch(
            `/api/tasks?date=${encodeURIComponent(date)}&page=${safePage}&limit=${PAGE_SIZE}`,
          );
          if (!retry.ok) {
            throw new Error(await parseError(retry));
          }
          const retryData = (await retry.json()) as ListResponse;
          setTasks(retryData.tasks);
          setTotal(retryData.total);
          setPage(retryData.page);
          setTotalPages(retryData.totalPages);
        } else {
          setTasks(data.tasks);
          setTotal(data.total);
          setPage(data.page);
          setTotalPages(data.totalPages);
        }

        await refreshAll(date);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load tasks";
        setError(message);
        setTasks([]);
        setAllTasks([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [page, refreshAll],
  );

  useEffect(() => {
    setPage(1);
    void refresh(workDate, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset to page 1 on date change only
  }, [workDate]);

  const goToPage = useCallback(
    (nextPage: number) => {
      const safe = Math.max(1, Math.min(nextPage, totalPages));
      setPage(safe);
      void refresh(workDate, safe);
    },
    [refresh, totalPages, workDate],
  );

  const addTask = useCallback(
    async (description: string, achieve: number): Promise<Task> => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workDate, description, achieve }),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const data = (await response.json()) as { task: Task };
      const nextTotal = total + 1;
      const lastPage = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
      await refresh(workDate, lastPage);
      return data.task;
    },
    [refresh, total, workDate],
  );

  const updateTask = useCallback(
    async (id: string, description: string): Promise<Task> => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      const data = (await response.json()) as { task: Task };
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? data.task : task)),
      );
      setAllTasks((prev) =>
        prev.map((task) => (task.id === id ? data.task : task)),
      );
      return data.task;
    },
    [],
  );

  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      await refresh(workDate, page);
    },
    [page, refresh, workDate],
  );

  return {
    tasks,
    allTasks,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages,
    loading,
    error,
    goToPage,
    refresh: () => refresh(workDate, page),
    addTask,
    updateTask,
    deleteTask,
  };
}
