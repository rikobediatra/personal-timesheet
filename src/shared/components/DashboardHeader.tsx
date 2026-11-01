"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

type DashboardHeaderProps = {
  todayLabel?: string;
};

export function DashboardHeader({ todayLabel }: DashboardHeaderProps) {
  const pathname = usePathname();
  const isTasks = pathname === "/tasks";
  const isTimesheet = pathname === "/timesheet";

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-outline-variant/40 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="flex h-16 w-full items-center justify-between gap-space-lg px-gutter-lg">
        <div className="flex items-center gap-space-lg">
          <Link href="/tasks" className="flex items-center gap-space-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm">
              <Icon
                name="calendar_clock"
                className="text-[20px] text-tertiary-fixed"
              />
            </div>
            <span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-primary">
              Daily Timesheet
            </span>
          </Link>
          <div className="h-4 w-px bg-outline-variant/50" />
          <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
            <span className="text-on-surface-variant/80">Workspace</span>
            <Icon name="chevron_right" className="text-[14px] text-outline" />
            <span className="font-medium text-primary">daily task</span>
          </div>
        </div>

        <nav className="flex items-center gap-space-xs">
          <Link
            href="/tasks"
            aria-current={isTasks ? "page" : undefined}
            className={
              isTasks
                ? "rounded-lg bg-surface-container-low px-3.5 py-1.5 font-semibold text-primary shadow-sm transition-colors"
                : "rounded-lg px-3.5 py-1.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            }
          >
            Daily Tasks
          </Link>
          <Link
            href="/timesheet"
            aria-current={isTimesheet ? "page" : undefined}
            className={
              isTimesheet
                ? "rounded-lg bg-surface-container-low px-3.5 py-1.5 font-label-md text-label-md font-semibold text-primary shadow-sm transition-colors"
                : "rounded-lg px-3.5 py-1.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            }
          >
            Timesheet History
          </Link>
        </nav>

        <div className="flex items-center gap-space-md">
          {todayLabel ? (
            <div className="hidden items-center gap-space-xs rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-1 font-label-md text-label-md text-on-surface-variant xl:flex">
              <Icon name="calendar_today" className="text-[16px] text-secondary" />
              <span>{todayLabel}</span>
            </div>
          ) : null}
          <button
            aria-label="Notifications"
            className="relative rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            type="button"
          >
            <Icon name="notifications" className="text-[20px]" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-secondary" />
          </button>
          <div className="h-4 w-px bg-outline-variant/50" />
          <div className="flex items-center gap-space-sm pl-space-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container font-label-md text-label-md font-semibold text-on-primary ring-1 ring-outline-variant/60">
              R
            </div>
            <div className="hidden flex-col text-left leading-tight md:flex">
              <span className="font-label-md text-label-md font-semibold text-primary">
                rikobediatra
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Workspace Owner
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
