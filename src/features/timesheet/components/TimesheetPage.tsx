"use client";

import { useMemo, useState } from "react";
import {
  DashboardFooter,
  DashboardHeader,
  Icon,
  ToastProvider,
  useToast,
} from "@/shared/components";
import { formatHeaderToday } from "@/features/tasks/lib/date";
import { useTimesheetHistory } from "../hooks/useTimesheetHistory";
import { downloadTimesheetForDate } from "../lib/download-timesheet";
import type { TimesheetHistoryItem } from "../types";
import { HistoryDetailModal } from "./HistoryDetailModal";
import { HistoryFilters } from "./HistoryFilters";
import { HistoryKpis } from "./HistoryKpis";
import { HistoryPagination } from "./HistoryPagination";
import { HistoryTable } from "./HistoryTable";

function TimesheetPageContent() {
  const { showToast } = useToast();
  const today = useMemo(() => new Date(), []);
  const {
    filters,
    preset,
    items,
    stats,
    total,
    page,
    totalPages,
    pageSize,
    loading,
    error,
    updateFilters,
    selectPreset,
    resetFilters,
    goToPage,
  } = useTimesheetHistory();

  const [selected, setSelected] = useState<TimesheetHistoryItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload(item: TimesheetHistoryItem) {
    setDownloading(true);
    try {
      const fileName = await downloadTimesheetForDate(item.workDate);
      showToast("Download Started", fileName, "download");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Download failed";
      showToast("Download Failed", message, "error");
    } finally {
      setDownloading(false);
    }
  }

  function handleView(item: TimesheetHistoryItem) {
    setSelected(item);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-background font-body-md text-body-md text-on-surface antialiased">
      <DashboardHeader todayLabel={formatHeaderToday(today)} />

      <main className="relative z-0 min-h-screen w-full bg-background pt-16">
        <div className="flex w-full flex-col gap-space-lg px-gutter-lg py-space-lg">
          <div className="flex flex-col justify-between gap-space-md md:flex-row md:items-end">
            <div className="flex max-w-3xl flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                <span className="font-bold text-secondary">Archives</span>
                <span className="text-outline-variant">/</span>
                <span>Ledger Compilations</span>
                <span className="text-outline-variant">/</span>
                <span className="font-semibold text-on-surface">
                  Standardized Workbooks
                </span>
              </div>
              <h1 className="font-headline-xl text-headline-xl font-medium tracking-tight text-primary">
                Timesheet History
              </h1>
              <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
                Review past timesheet submissions, inspect compiled daily task
                logs, and export standardized workbooks formatted for compliance
                auditing.
              </p>
            </div>

            <div className="flex items-center gap-space-sm rounded-lg bg-surface-container-lowest px-3.5 py-2 shadow-sm">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-secondary" />
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Storage Sync
                </span>
                <span className="font-label-md text-label-md font-semibold text-primary">
                  Active & Compliant
                </span>
              </div>
            </div>
          </div>

          <HistoryKpis stats={stats} />

          <HistoryFilters
            filters={filters}
            preset={preset}
            onChange={updateFilters}
            onSelectPreset={selectPreset}
            onReset={resetFilters}
          />

          {error ? (
            <div
              className="rounded-lg bg-error-container px-4 py-3 font-body-sm text-body-sm text-on-error-container"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <HistoryTable
            items={items}
            total={total}
            loading={loading}
            activeWorkDate={modalOpen ? selected?.workDate ?? null : null}
            onView={handleView}
            onDownload={handleDownload}
            footer={
              <HistoryPagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={goToPage}
              />
            }
          />

          <div className="flex flex-col items-start justify-between gap-space-md rounded-xl bg-surface-container-low p-space-md shadow-sm md:flex-row md:items-center">
            <div className="flex items-center gap-space-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest text-secondary shadow-sm">
                <Icon name="verified_user" className="text-[24px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm font-semibold text-primary">
                  Automated Archival Standards
                </span>
                <p className="max-w-2xl font-body-sm text-body-sm text-on-surface-variant">
                  Workbooks are generated on demand from your daily task ledger.
                  Each export uses the FR-02 Excel template with work date and
                  task descriptions for the selected day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DashboardFooter />

      <HistoryDetailModal
        item={selected}
        open={modalOpen}
        downloading={downloading}
        onClose={handleCloseModal}
        onDownload={handleDownload}
      />
    </div>
  );
}

export function TimesheetPage() {
  return (
    <ToastProvider>
      <TimesheetPageContent />
    </ToastProvider>
  );
}
