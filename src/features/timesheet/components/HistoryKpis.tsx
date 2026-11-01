"use client";

import { Icon } from "@/shared/components";
import type { TimesheetHistoryStats } from "../types";
import {
  calendarDaysSpan,
  formatLatestActivity,
  formatRangeLabel,
} from "../lib/date-range";
import { toDateKey } from "@/features/tasks/lib/date";

type HistoryKpisProps = {
  stats: TimesheetHistoryStats;
};

export function HistoryKpis({ stats }: HistoryKpisProps) {
  const todayKey = toDateKey(new Date());
  const span = calendarDaysSpan(stats.from, stats.to);
  const latest = formatLatestActivity(stats.latestUpdated, todayKey);
  const avg =
    stats.totalDays > 0
      ? (stats.totalTasks / stats.totalDays).toFixed(1)
      : "0";

  return (
    <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Total Generated
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low text-secondary">
            <Icon name="inventory_2" className="text-[18px]" />
          </div>
        </div>
        <div className="mt-space-md flex items-baseline gap-space-xs">
          <span className="font-headline-lg text-headline-lg font-semibold text-primary">
            {stats.totalDays}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Timesheets
          </span>
        </div>
        <div className="mt-space-xs flex items-center gap-1 font-label-sm text-label-sm font-medium text-secondary">
          <Icon name="check_circle" className="text-[14px]" />
          <span>Days with logged tasks</span>
        </div>
      </div>

      <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Active Window
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low text-primary">
            <Icon name="date_range" className="text-[18px]" />
          </div>
        </div>
        <div className="mt-space-md">
          <div className="font-label-lg text-label-lg font-semibold text-primary">
            {formatRangeLabel(stats.from, stats.to)}
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {span} calendar days span
          </span>
        </div>
        <div className="mt-space-xs font-label-sm text-label-sm text-on-surface-variant">
          Filtered date range
        </div>
      </div>

      <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Logged Tasks
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low text-secondary">
            <Icon name="format_list_bulleted" className="text-[18px]" />
          </div>
        </div>
        <div className="mt-space-md flex items-baseline gap-space-xs">
          <span className="font-headline-lg text-headline-lg font-semibold text-primary">
            {stats.totalTasks}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Entries in range
          </span>
        </div>
        <div className="mt-space-xs font-label-sm text-label-sm text-on-surface-variant">
          Avg. {avg} tasks / day
        </div>
      </div>

      <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Latest Update
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low text-secondary">
            <Icon name="cloud_sync" className="text-[18px]" />
          </div>
        </div>
        <div className="mt-space-md">
          <div className="font-label-lg text-label-lg font-semibold text-primary">
            {latest.primary}
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {latest.secondary}
          </span>
        </div>
        <div className="mt-space-xs flex items-center gap-1 font-label-sm text-label-sm font-medium text-secondary">
          <Icon name="update" className="text-[14px]" />
          <span>Most recent task edit</span>
        </div>
      </div>
    </div>
  );
}
