"use client";

import { useRef } from "react";
import { Icon } from "@/shared/components";
import {
  addDays,
  formatLongDate,
  parseDateKey,
  toDateKey,
} from "../lib/date";

type DateToolbarProps = {
  selectedDate: string;
  onChange: (dateKey: string) => void;
};

export function DateToolbar({ selectedDate, onChange }: DateToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const todayKey = toDateKey(new Date());
  const yesterdayKey = toDateKey(addDays(new Date(), -1));
  const selected = parseDateKey(selectedDate);
  const isToday = selectedDate === todayKey;
  const isYesterday = selectedDate === yesterdayKey;

  return (
    <div className="flex flex-col items-stretch gap-space-sm rounded-xl bg-surface-container-lowest p-1.5 shadow-sm sm:flex-row sm:items-center">
      <div className="flex items-center rounded-lg bg-surface-container-low p-1">
        <button
          className={
            isYesterday
              ? "rounded bg-primary px-3.5 py-1.5 font-label-md text-label-md text-on-primary shadow-sm transition-all"
              : "rounded px-3.5 py-1.5 font-label-md text-label-md text-on-surface-variant transition-all hover:bg-surface-container-lowest hover:text-primary"
          }
          type="button"
          onClick={() => onChange(yesterdayKey)}
        >
          Yesterday
        </button>
        <button
          className={
            isToday
              ? "rounded bg-primary px-3.5 py-1.5 font-label-md text-label-md text-on-primary shadow-sm transition-all"
              : "rounded px-3.5 py-1.5 font-label-md text-label-md text-on-surface-variant transition-all hover:bg-surface-container-lowest hover:text-primary"
          }
          type="button"
          onClick={() => onChange(todayKey)}
        >
          Today
        </button>
      </div>

      <div className="relative flex items-center gap-space-xs rounded-lg bg-surface-container-lowest px-3 py-1.5 text-on-surface">
        <Icon name="calendar_month" className="text-[18px] text-secondary" />
        <span className="font-label-lg text-label-lg font-semibold text-primary">
          {formatLongDate(selected)}
        </span>
        <button
          aria-label="Open Calendar"
          className="p-1 text-outline transition-colors hover:text-primary"
          type="button"
          onClick={() => inputRef.current?.showPicker?.() ?? inputRef.current?.click()}
        >
          <Icon name="expand_more" className="text-[18px]" />
        </button>
        <input
          ref={inputRef}
          type="date"
          value={selectedDate}
          className="pointer-events-none absolute inset-0 opacity-0"
          onChange={(event) => {
            if (event.target.value) onChange(event.target.value);
          }}
        />
      </div>

      <div className="hidden items-center gap-1 pl-space-xs font-label-sm text-label-sm text-on-surface-variant xl:flex">
        <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
        <span>Active Worklog</span>
      </div>
    </div>
  );
}
