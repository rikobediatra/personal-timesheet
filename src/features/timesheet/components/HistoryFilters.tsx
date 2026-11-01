"use client";

import { Icon } from "@/shared/components";
import type { HistoryFilters as Filters } from "../hooks/useTimesheetHistory";
import type { PeriodPreset } from "../lib/date-range";

type HistoryFiltersProps = {
  filters: Filters;
  preset: PeriodPreset;
  onChange: (patch: Partial<Filters>) => void;
  onSelectPreset: (preset: PeriodPreset) => void;
  onReset: () => void;
};

const PRESETS: Array<{ id: PeriodPreset; label: string }> = [
  { id: "this-week", label: "This Week" },
  { id: "this-month", label: "This Month" },
  { id: "last-30", label: "Last 30 Days" },
  { id: "custom", label: "Custom Range" },
];

const dateInputClassName =
  "relative w-[9.5rem] cursor-pointer bg-transparent font-label-md text-label-md font-semibold text-primary focus:outline-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0";

export function HistoryFilters({
  filters,
  preset,
  onChange,
  onSelectPreset,
  onReset,
}: HistoryFiltersProps) {
  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm">
      <div className="flex flex-wrap items-center gap-space-xs">
        <span className="mr-1 font-label-sm text-label-sm uppercase text-on-surface-variant">
          Period:
        </span>
        {PRESETS.map((item) => {
          const active = preset === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPreset(item.id)}
              className={
                active
                  ? "rounded-lg bg-primary px-3 py-1.5 font-label-md text-label-md text-on-primary shadow-sm"
                  : "rounded-lg bg-surface-container-low px-3 py-1.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary"
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col justify-between gap-space-md pt-space-xs md:flex-row md:items-center">
        <div className="flex flex-wrap items-center gap-space-md">
          <label className="flex items-center gap-space-xs rounded-lg bg-surface-container-low px-3 py-1.5">
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
              From:
            </span>
            <div className="relative flex items-center gap-space-xs">
              <input
                type="date"
                value={filters.from}
                onChange={(e) => onChange({ from: e.target.value })}
                className={dateInputClassName}
              />
              <Icon
                name="calendar_today"
                className="pointer-events-none text-[16px] text-outline"
              />
            </div>
          </label>

          <label className="flex items-center gap-space-xs rounded-lg bg-surface-container-low px-3 py-1.5">
            <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">
              To:
            </span>
            <div className="relative flex items-center gap-space-xs">
              <input
                type="date"
                value={filters.to}
                onChange={(e) => onChange({ to: e.target.value })}
                className={dateInputClassName}
              />
              <Icon
                name="calendar_today"
                className="pointer-events-none text-[16px] text-outline"
              />
            </div>
          </label>
        </div>

        <div className="flex items-center gap-space-sm self-end md:self-auto">
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg bg-surface-container-low px-4 py-2 font-label-md text-label-md font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
