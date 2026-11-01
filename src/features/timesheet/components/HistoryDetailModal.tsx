"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/shared/components";
import type { Task } from "@/features/tasks/types";
import type { TimesheetHistoryItem } from "../types";
import {
  formatSubmissionTime,
  formatWorkDateLabel,
} from "../lib/date-range";
import { toDateKey } from "@/features/tasks/lib/date";

type HistoryDetailModalProps = {
  item: TimesheetHistoryItem | null;
  open: boolean;
  downloading: boolean;
  onClose: () => void;
  onDownload: (item: TimesheetHistoryItem) => void;
};

export function HistoryDetailModal({
  item,
  open,
  downloading,
  onClose,
  onDownload,
}: HistoryDetailModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const todayKey = toDateKey(new Date());

  useEffect(() => {
    if (!open || !item) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/tasks?date=${encodeURIComponent(item!.workDate)}&all=1`,
        );
        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error ?? "Failed to load tasks");
        }
        const data = (await res.json()) as { tasks: Task[] };
        if (!cancelled) {
          setTasks(data.tasks);
        }
      } catch (err) {
        if (!cancelled) {
          setTasks([]);
          setError(err instanceof Error ? err.message : "Failed to load tasks");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, item]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm transition-opacity sm:p-6">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-detail-title"
        className="relative flex w-full max-w-2xl transform flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-2xl transition-transform"
      >
        <div className="flex items-center justify-between bg-surface-container-low/70 px-space-lg py-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary">
              <Icon name="event_note" className="text-[18px]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2
                  id="history-detail-title"
                  className="font-headline-md text-headline-md font-semibold text-primary"
                >
                  Timesheet Detail
                </h2>
                <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm font-semibold text-primary">
                  {formatWorkDateLabel(item.workDate)}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Daily Task Workbook Audit Log
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="flex max-h-[768px] flex-col gap-space-lg overflow-y-auto p-space-lg">
          <div className="grid grid-cols-1 gap-space-sm rounded-lg bg-surface-container-low/50 p-space-md sm:grid-cols-3">
            <div className="flex flex-col gap-0.5">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Compiled File
              </span>
              <div className="flex items-center gap-1 truncate font-label-md text-label-md font-semibold text-primary">
                <Icon name="table_view" className="text-[16px] text-secondary" />
                <span className="truncate" title={item.fileName}>
                  {item.fileName}
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                Excel OpenXML
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Last Updated
              </span>
              <span className="font-label-md text-label-md font-semibold text-primary">
                {formatSubmissionTime(item.lastUpdated, todayKey)}
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Task ledger timestamp
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Task Count
              </span>
              <span className="font-label-md text-label-md font-semibold text-primary">
                {item.taskCount} registered
              </span>
              <span className="text-[11px] text-on-surface-variant">
                FR-02 daily workbook
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-label-lg text-label-lg font-semibold text-primary">
                Compiled Task Entries (FR-02 Standard)
              </h3>
              <span className="font-label-sm text-label-sm font-medium text-on-surface-variant">
                {loading
                  ? "Loading…"
                  : `${tasks.length} task${tasks.length === 1 ? "" : "s"} registered`}
              </span>
            </div>

            {error ? (
              <div
                className="rounded-lg bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container"
                role="alert"
              >
                {error}
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg bg-surface-container-lowest shadow-sm">
                <table className="w-full text-left font-body-md text-body-md">
                  <thead>
                    <tr className="bg-surface-container-low font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                      <th className="w-36 px-space-md py-2.5 font-semibold">
                        Work Date
                      </th>
                      <th className="px-space-md py-2.5 font-semibold">
                        Task Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low text-on-surface">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-space-md py-6 text-center font-body-sm text-body-sm text-on-surface-variant"
                        >
                          Loading tasks…
                        </td>
                      </tr>
                    ) : tasks.length === 0 ? (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-space-md py-6 text-center font-body-sm text-body-sm text-on-surface-variant"
                        >
                          No tasks for this date.
                        </td>
                      </tr>
                    ) : (
                      tasks.map((task) => (
                        <tr
                          key={task.id}
                          className="transition-colors hover:bg-surface-container-low/30"
                        >
                          <td className="whitespace-nowrap px-space-md py-3 align-top">
                            <span className="font-label-md text-label-md font-semibold text-primary">
                              {formatWorkDateLabel(task.workDate)}
                            </span>
                          </td>
                          <td className="px-space-md py-3 text-on-surface">
                            <p className="font-body-md text-body-md leading-relaxed">
                              {task.description}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-end gap-space-sm bg-surface-container-low/70 px-space-lg py-space-md sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-surface-container px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
          >
            Close
          </button>
          <button
            type="button"
            disabled={downloading}
            onClick={() => onDownload(item)}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:opacity-60"
          >
            <Icon name="download" className="text-[18px]" />
            <span>
              {downloading ? "Downloading…" : "Download / Export Excel (.xlsx)"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
