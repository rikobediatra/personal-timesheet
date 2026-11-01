"use client";

import type { ReactNode } from "react";
import { Icon } from "@/shared/components";
import { toDateKey } from "@/features/tasks/lib/date";
import type { TimesheetHistoryItem } from "../types";
import {
  formatSubmissionTime,
  formatWeekday,
  formatWorkDateLabel,
} from "../lib/date-range";

type HistoryTableProps = {
  items: TimesheetHistoryItem[];
  total: number;
  loading: boolean;
  activeWorkDate: string | null;
  onView: (item: TimesheetHistoryItem) => void;
  onDownload: (item: TimesheetHistoryItem) => void;
  footer?: ReactNode;
};

export function HistoryTable({
  items,
  total,
  loading,
  activeWorkDate,
  onView,
  onDownload,
  footer,
}: HistoryTableProps) {
  const todayKey = toDateKey(new Date());

  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
      <div className="flex items-center justify-between bg-surface-container-low px-space-md py-3">
        <div className="flex items-center gap-space-sm">
          <span className="font-label-md text-label-md font-semibold text-primary">
            Ledger Archives
          </span>
          <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface">
            {loading ? "Loading…" : `${items.length} records displayed`}
          </span>
        </div>
        <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
          <Icon name="tune" className="text-[14px]" />
          <span>Sorted chronologically (descending)</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-body-md text-body-md">
          <thead>
            <tr className="bg-surface-container-low/60 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              <th className="px-space-md py-3 font-semibold">Work Date</th>
              <th className="px-space-md py-3 font-semibold">Generated File</th>
              <th className="px-space-md py-3 text-center font-semibold">Tasks</th>
              <th className="px-space-md py-3 font-semibold">
                Primary Description Snippet
              </th>
              <th className="px-space-md py-3 font-semibold">Last Updated</th>
              <th className="px-space-md py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low text-on-surface">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-space-md py-10 text-center font-body-sm text-body-sm text-on-surface-variant"
                >
                  Loading timesheet history…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-space-md py-10 text-center font-body-sm text-body-sm text-on-surface-variant"
                >
                  {total === 0
                    ? "No timesheets found for this date range."
                    : "No records on this page."}
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const active = activeWorkDate === item.workDate;
                return (
                  <tr
                    key={item.workDate}
                    className={
                      active
                        ? "bg-surface-container-low/30 transition-colors hover:bg-surface-container-low/60"
                        : "transition-colors hover:bg-surface-container-low/40"
                    }
                  >
                    <td className="whitespace-nowrap px-space-md py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${active ? "bg-secondary" : "bg-transparent"}`}
                        />
                        <span className="font-headline-sm text-headline-sm font-semibold text-primary">
                          {formatWorkDateLabel(item.workDate)}
                        </span>
                      </div>
                      <div className="pl-4 text-[11px] text-on-surface-variant">
                        {formatWeekday(item.workDate)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-space-md py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Icon
                          name="description"
                          className={`text-[18px] ${active ? "text-secondary" : "text-outline"}`}
                        />
                        <span className="font-label-md text-label-md font-medium text-primary">
                          {item.fileName}
                        </span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        Excel OpenXML
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-space-md py-3.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 font-label-sm text-label-sm font-semibold ${
                          active
                            ? "bg-surface-container-high text-primary"
                            : "bg-surface-container-low text-on-surface"
                        }`}
                      >
                        {item.taskCount} task{item.taskCount === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-space-md py-3.5">
                      <span
                        className={`font-body-sm text-body-sm ${active ? "text-on-surface" : "text-on-surface-variant"}`}
                      >
                        {item.snippet}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-space-md py-3.5 font-label-sm text-label-sm text-on-surface-variant">
                      {formatSubmissionTime(item.lastUpdated, todayKey)}
                    </td>
                    <td className="whitespace-nowrap px-space-md py-3.5 text-right">
                      <div className="flex items-center justify-end gap-space-xs">
                        <button
                          type="button"
                          onClick={() => onView(item)}
                          className={
                            active
                              ? "flex items-center gap-1 rounded-lg bg-surface-container-high px-2.5 py-1.5 font-label-md text-label-md text-primary transition-colors hover:bg-primary hover:text-on-primary"
                              : "flex items-center gap-1 rounded-lg bg-surface-container-low px-2.5 py-1.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
                          }
                        >
                          <Icon name="visibility" className="text-[16px]" />
                          <span>View Details</span>
                        </button>
                        <button
                          type="button"
                          aria-label="Download workbook"
                          title="Download .xlsx"
                          onClick={() => onDownload(item)}
                          className={
                            active
                              ? "rounded-lg bg-surface-container-low p-1.5 text-secondary transition-colors hover:bg-secondary hover:text-on-secondary"
                              : "rounded-lg bg-surface-container-low p-1.5 text-on-surface-variant transition-colors hover:text-primary"
                          }
                        >
                          <Icon name="download" className="text-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
