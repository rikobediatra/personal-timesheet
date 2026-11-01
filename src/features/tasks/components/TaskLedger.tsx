"use client";

import { Icon } from "@/shared/components";
import { formatLongDate, formatShortDate, parseDateKey } from "../lib/date";
import type { Task } from "../types";
import { TaskCard } from "./TaskCard";

type TaskLedgerProps = {
  selectedDate: string;
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onUpdate: (id: string, description: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
};

export function TaskLedger({
  selectedDate,
  tasks,
  total,
  page,
  totalPages,
  loading = false,
  onPageChange,
  onUpdate,
  onDelete,
}: TaskLedgerProps) {
  const date = parseDateKey(selectedDate);
  const longDate = formatLongDate(date);
  const shortDate = formatShortDate(date);

  return (
    <div className="flex flex-col space-y-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="flex flex-col justify-between gap-space-sm pb-space-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-space-xs">
            <h2 className="font-headline-md text-headline-md text-primary">
              Logged Tasks for {longDate}
            </h2>
          </div>
          <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">
            Separate database entries eligible for timesheet compilation
          </p>
        </div>
        <div className="flex items-center gap-space-xs">
          <span className="rounded bg-secondary-fixed px-2.5 py-1 font-label-sm text-label-sm font-bold text-on-secondary-fixed">
            {total} Tasks Recorded
          </span>
        </div>
      </div>

      <div className="flex items-center gap-space-sm rounded-lg bg-surface-container-low p-space-sm font-label-sm text-label-sm text-on-surface-variant">
        <Icon name="verified_user" className="text-[18px] text-secondary" />
        <span>
          <strong>Acceptance Verified:</strong> Modifying or deleting any item
          operates independently without affecting other entries for {shortDate}.
        </span>
      </div>

      <div className="flex flex-col space-y-space-sm">
        {loading ? (
          <div className="rounded-xl bg-surface-container-low px-space-md py-space-lg text-center font-body-md text-body-md text-on-surface-variant">
            Loading tasks...
          </div>
        ) : total === 0 ? (
          <div className="rounded-xl bg-surface-container-low px-space-md py-space-lg text-center font-body-md text-body-md text-on-surface-variant">
            No tasks logged for this date yet. Add your first entry from the
            input console.
          </div>
        ) : (
          tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              accent={index % 2 === 0 ? "secondary" : "tint"}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {total > 0 ? (
        <div className="flex flex-col items-center justify-between gap-space-sm rounded-lg bg-surface-container-low px-space-md py-space-sm sm:flex-row">
          <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
            <Icon name="checklist" className="text-[18px] text-secondary" />
            <span>
              Page {page} of {totalPages} · {total} Items
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 rounded bg-surface-container-lowest px-3 py-1.5 font-label-md text-label-md text-primary shadow-sm transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => onPageChange(page - 1)}
            >
              <Icon name="chevron_left" className="text-[18px]" />
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 rounded bg-surface-container-lowest px-3 py-1.5 font-label-md text-label-md text-primary shadow-sm transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => onPageChange(page + 1)}
            >
              Next
              <Icon name="chevron_right" className="text-[18px]" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-space-md py-space-sm">
          <div className="flex items-center gap-space-xs font-label-lg text-label-lg font-semibold text-on-surface">
            <Icon name="checklist" className="text-[18px] text-secondary" />
            <span>Total Tasks Logged ({shortDate})</span>
          </div>
          <span className="font-headline-md text-headline-md font-bold text-primary tabular-nums">
            0 Items
          </span>
        </div>
      )}
    </div>
  );
}
