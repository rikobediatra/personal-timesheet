import { addDays, toDateKey } from "@/features/tasks/lib/date";

export type PeriodPreset = "this-week" | "this-month" | "last-30" | "custom";

export function startOfWeek(date: Date): Date {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function rangeForPreset(
  preset: PeriodPreset,
  today = new Date(),
): { from: string; to: string } {
  const to = toDateKey(today);

  switch (preset) {
    case "this-week":
      return { from: toDateKey(startOfWeek(today)), to };
    case "this-month":
      return { from: toDateKey(startOfMonth(today)), to };
    case "last-30":
      return { from: toDateKey(addDays(today, -29)), to };
    case "custom":
    default:
      return { from: toDateKey(startOfMonth(today)), to };
  }
}

export function formatRangeLabel(from: string, to: string): string {
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "2-digit",
    year: "numeric",
  };
  return `${fromDate.toLocaleDateString("en-US", opts)} — ${toDate.toLocaleDateString("en-US", opts)}`;
}

export function calendarDaysSpan(from: string, to: string): number {
  const start = new Date(`${from}T00:00:00`).getTime();
  const end = new Date(`${to}T00:00:00`).getTime();
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
}

export function formatWorkDateLabel(workDate: string): string {
  const date = new Date(`${workDate}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatWeekday(workDate: string): string {
  const date = new Date(`${workDate}T00:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

export function formatSubmissionTime(iso: string, todayKey: string): string {
  const date = new Date(iso);
  const key = toDateKey(date);
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (key === todayKey) {
    return `${time} WIB (Today)`;
  }

  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}, ${time} WIB`;
}

export function formatLatestActivity(iso: string | null, todayKey: string): {
  primary: string;
  secondary: string;
} {
  if (!iso) {
    return { primary: "No activity", secondary: "No updates in range" };
  }

  const date = new Date(iso);
  const key = toDateKey(date);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (key === todayKey) {
    return {
      primary: `Today, ${time}`,
      secondary: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  }

  return {
    primary: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    secondary: time,
  };
}
