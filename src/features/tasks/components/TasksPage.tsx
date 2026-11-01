"use client";

import { useMemo, useState } from "react";
import {
  DashboardFooter,
  DashboardHeader,
  Icon,
  ToastProvider,
  useToast,
} from "@/shared/components";
import { useTasks } from "../hooks/useTasks";
import {
  addDays,
  formatHeaderToday,
  formatLongDate,
  formatShortDate,
  parseDateKey,
  toDateKey,
} from "../lib/date";
import { DateToolbar } from "./DateToolbar";
import { TaskEntryForm } from "./TaskEntryForm";
import { TaskLedger } from "./TaskLedger";
import { TimesheetWorkflow } from "./TimesheetWorkflow";

function TasksPageContent() {
  const { showToast } = useToast();
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(today));
  const {
    tasks,
    allTasks,
    total,
    page,
    totalPages,
    loading,
    error,
    goToPage,
    addTask,
    updateTask,
    deleteTask,
  } = useTasks({
    workDate: selectedDate,
  });
  const todayKey = toDateKey(today);
  const yesterdayKey = toDateKey(addDays(today, -1));

  function handleDateChange(nextDate: string) {
    setSelectedDate(nextDate);
    const label =
      nextDate === todayKey
        ? formatShortDate(today)
        : nextDate === yesterdayKey
          ? "Yesterday"
          : formatLongDate(parseDateKey(nextDate));

    showToast(
      "Loaded Logged Tasks",
      `Displaying saved records for ${label}.`,
      "event",
    );
  }

  return (
    <div className="min-h-screen bg-background font-body-md text-body-md text-on-surface antialiased">
      <DashboardHeader todayLabel={formatHeaderToday(today)} />

      <main className="min-h-screen w-full bg-background pt-16">
        <div className="flex w-full flex-col space-y-margin-lg px-gutter-lg py-margin">
          <div className="flex flex-col justify-between gap-space-lg lg:flex-row lg:items-end">
            <div className="max-w-2xl space-y-space-xs">
              <div className="flex items-center gap-space-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
                  <Icon
                    name="cloud_done"
                    className="text-[13px] text-on-tertiary-container"
                  />
                  DB Synced
                </span>
              </div>
              <h1 className="font-headline-xl text-headline-xl tracking-tight text-primary">
                Daily Task Management
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Record multiple daily work items, review submitted logs, and
                generate your Excel timesheet draft for Gmail dispatch.
              </p>
            </div>

            <DateToolbar
              selectedDate={selectedDate}
              onChange={handleDateChange}
            />
          </div>

          {error ? (
            <div
              className="rounded-lg bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 items-start gap-gutter-lg lg:grid-cols-12">
            <div className="flex flex-col space-y-space-lg lg:col-span-5">
              <TaskEntryForm
                selectedDate={selectedDate}
                onSave={async (description, achieve) => {
                  await addTask(description, achieve);
                }}
              />
            </div>

            <div className="flex flex-col space-y-space-md lg:col-span-7">
              <TaskLedger
                selectedDate={selectedDate}
                tasks={tasks}
                total={total}
                page={page}
                totalPages={totalPages}
                loading={loading}
                onPageChange={goToPage}
                onUpdate={updateTask}
                onDelete={deleteTask}
              />
            </div>
          </div>

          <TimesheetWorkflow selectedDate={selectedDate} tasks={allTasks} />
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}

export function TasksPage() {
  return (
    <ToastProvider>
      <TasksPageContent />
    </ToastProvider>
  );
}
