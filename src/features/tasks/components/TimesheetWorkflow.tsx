"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Icon, useToast } from "@/shared/components";
import {
  DEFAULT_GMAIL_BODY,
  REPORT_META,
  buildPreviewRows,
  buildReportFileName,
  formatReportDate,
  type PreviewRow,
} from "@/features/timesheet";
import type { Task } from "../types";

type TimesheetWorkflowProps = {
  selectedDate: string;
  tasks: Task[];
};

type GmailStatus = {
  connected: boolean;
  email: string | null;
  defaultTo: string;
};

export function TimesheetWorkflow({
  selectedDate,
  tasks,
}: TimesheetWorkflowProps) {
  const { showToast } = useToast();
  const [previewRows, setPreviewRows] = useState<PreviewRow[] | null>(null);
  const [emailBody, setEmailBody] = useState(DEFAULT_GMAIL_BODY);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [gmailBusy, setGmailBusy] = useState(false);
  const [draftBusy, setDraftBusy] = useState(false);
  const fileName = useMemo(
    () => `${buildReportFileName(selectedDate)}.xlsx`,
    [selectedDate],
  );
  const reportDate = useMemo(
    () => formatReportDate(selectedDate),
    [selectedDate],
  );

  useEffect(() => {
    setPreviewRows(null);
    setEmailSubject(
      `Timesheet Submission — ${formatReportDate(selectedDate)} — ${REPORT_META.name}`,
    );
  }, [selectedDate]);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const res = await fetch("/api/gmail/status");
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as GmailStatus;
        if (cancelled) return;
        setGmailStatus(data);
        if (data.defaultTo) {
          setEmailTo((current) => current || data.defaultTo);
        }
      } catch {
        // ignore status load errors; UI shows disconnected
      }
    }

    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gmail = params.get("gmail");
    if (!gmail) return;

    if (gmail === "connected") {
      showToast(
        "Gmail Connected",
        "Your Gmail account is linked for timesheet drafts.",
        "mark_email_read",
      );
      void fetch("/api/gmail/status")
        .then((res) => (res.ok ? res.json() : null))
        .then((data: GmailStatus | null) => {
          if (!data) return;
          setGmailStatus(data);
          if (data.defaultTo) {
            setEmailTo((current) => current || data.defaultTo);
          }
        });
    } else if (gmail === "error") {
      const reason = params.get("reason") || "Connection failed";
      showToast("Gmail Connection Failed", reason, "error");
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("gmail");
    url.searchParams.delete("reason");
    window.history.replaceState({}, "", url.pathname + url.search);
  }, [showToast]);

  const canDownload = Boolean(previewRows && previewRows.length > 0);
  const gmailConnected = Boolean(gmailStatus?.connected);

  function handleGenerate() {
    if (tasks.length === 0) {
      showToast(
        "No Tasks",
        "Add at least one task for the selected date before generating.",
        "error",
      );
      setPreviewRows(null);
      return;
    }

    const rows = buildPreviewRows(tasks);
    setPreviewRows(rows);
    showToast(
      "Excel Preview Ready",
      `${fileName} compiled with ${rows.length} daily tasks.`,
      "file_download",
    );
  }

  async function handleDownload() {
    if (!canDownload) {
      return;
    }

    try {
      const res = await fetch(
        `/api/timesheet/download?date=${encodeURIComponent(selectedDate)}`,
      );

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Download failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      showToast("Download Started", fileName, "download");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Download failed";
      showToast("Download Failed", message, "error");
    }
  }

  function handleConnectGmail() {
    window.location.href = "/api/gmail/connect";
  }

  async function handleDisconnectGmail() {
    setGmailBusy(true);
    try {
      const res = await fetch("/api/gmail/disconnect", { method: "POST" });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Disconnect failed");
      }
      setGmailStatus((prev) =>
        prev
          ? { ...prev, connected: false, email: null }
          : { connected: false, email: null, defaultTo: "" },
      );
      showToast(
        "Gmail Disconnected",
        "Connect again before creating drafts.",
        "link_off",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Disconnect failed";
      showToast("Disconnect Failed", message, "error");
    } finally {
      setGmailBusy(false);
    }
  }

  async function handlePrepareDraft() {
    if (!gmailConnected) {
      showToast(
        "Gmail Not Connected",
        "Connect Gmail first, then prepare the draft.",
        "error",
      );
      return;
    }

    if (tasks.length === 0) {
      showToast(
        "No Tasks",
        "Add at least one task for the selected date before drafting.",
        "error",
      );
      return;
    }

    if (!emailTo.trim() || !emailSubject.trim() || !emailBody.trim()) {
      showToast(
        "Missing Fields",
        "Recipient (To), subject, and email body are required.",
        "error",
      );
      return;
    }

    setDraftBusy(true);
    try {
      const res = await fetch("/api/gmail/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          to: emailTo.trim(),
          subject: emailSubject.trim(),
          body: emailBody,
        }),
      });

      const payload = (await res.json().catch(() => null)) as {
        error?: string;
        webUrl?: string;
        fileName?: string;
      } | null;

      if (!res.ok) {
        throw new Error(payload?.error ?? "Failed to create draft");
      }

      showToast(
        "Gmail Draft Created",
        `${payload?.fileName ?? fileName} attached. Opening Gmail drafts.`,
        "mark_email_read",
      );
      window.open(
        payload?.webUrl ?? "https://mail.google.com/mail/#drafts",
        "_blank",
        "noopener,noreferrer",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create draft";
      showToast("Draft Failed", message, "error");
    } finally {
      setDraftBusy(false);
    }
  }

  return (
    <div className="flex flex-col space-y-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="flex flex-col justify-between gap-space-sm pb-space-xs lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="rounded-full bg-secondary-fixed px-2.5 py-0.5 font-label-sm text-label-sm font-semibold text-on-secondary-fixed uppercase">
              Step 6 to 9 Workflow
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary">
              Timesheet & Gmail Dispatch Workflow
            </h2>
          </div>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
            Auto-compile eligible tasks into standard enterprise .xlsx template
            and initialize an executive Gmail submission draft.
          </p>
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            className="inline-flex items-center gap-space-xs rounded bg-surface-container-low px-4 py-2.5 font-label-lg text-label-lg text-primary shadow-sm transition-all hover:bg-surface-container-high"
            type="button"
            onClick={handleGenerate}
          >
            <Icon
              name="table_chart"
              className="text-[20px] text-on-tertiary-container"
            />
            <span>Generate Excel Timesheet</span>
          </button>
          <button
            className={`inline-flex items-center gap-space-xs rounded bg-secondary-container px-4 py-2.5 font-label-lg text-label-lg text-on-secondary-container shadow-sm transition-all ${
              canDownload
                ? "hover:bg-secondary-fixed"
                : "cursor-not-allowed opacity-40"
            }`}
            type="button"
            disabled={!canDownload}
            onClick={handleDownload}
          >
            <Icon name="download" className="text-[20px]" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-gutter-lg lg:grid-cols-12">
        <div className="flex flex-col justify-between space-y-space-md rounded-xl bg-surface-container-low p-space-md lg:col-span-7">
          <div className="space-y-space-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon name="preview" className="text-[20px] text-secondary" />
                <span className="font-label-lg text-label-lg font-semibold text-primary">
                  Timesheet File Content Preview
                </span>
              </div>
              <span className="rounded bg-surface-container-lowest px-2 py-0.5 font-mono text-label-sm text-on-surface-variant shadow-sm">
                {fileName}
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg bg-surface-container-lowest p-space-md shadow-sm">
              <div className="mb-space-md flex items-start gap-space-md border-b border-outline-variant/30 pb-space-md">
                <Image
                  src={REPORT_META.logoSrc}
                  alt="Adidata logo"
                  width={120}
                  height={48}
                  className="h-12 w-auto object-contain"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-headline-sm text-headline-sm font-semibold text-primary">
                    {REPORT_META.companyTitle}
                  </p>
                  <div className="grid grid-cols-1 gap-1 font-body-sm text-body-sm text-on-surface-variant sm:grid-cols-2">
                    <p>
                      <span className="text-outline">Name:</span>{" "}
                      <span className="font-medium text-primary">
                        {REPORT_META.name}
                      </span>
                    </p>
                    <p>
                      <span className="text-outline">Position:</span>{" "}
                      <span className="font-medium text-primary">
                        {REPORT_META.position}
                      </span>
                    </p>
                    <p>
                      <span className="text-outline">Project:</span>{" "}
                      <span className="font-medium text-primary">
                        {REPORT_META.project}
                      </span>
                    </p>
                    <p>
                      <span className="text-outline">PM/Contact:</span>{" "}
                      <span className="font-medium text-primary">
                        {REPORT_META.pmContact}
                      </span>
                    </p>
                    <p>
                      <span className="text-outline">Date:</span>{" "}
                      <span className="font-medium text-primary">
                        {reportDate}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <table className="w-full text-left font-body-sm text-body-sm">
                <thead className="bg-surface-container font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
                  <tr>
                    <th className="px-3 py-2.5">No</th>
                    <th className="px-3 py-2.5">Achieve (%)</th>
                    <th className="px-3 py-2.5">ACTIVITY</th>
                    <th className="px-3 py-2.5">REMARKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low text-on-surface">
                  {!previewRows ? (
                    <tr>
                      <td
                        className="px-3 py-4 text-center text-on-surface-variant"
                        colSpan={4}
                      >
                        Click Generate Excel Timesheet to preview rows for{" "}
                        {reportDate}.
                      </td>
                    </tr>
                  ) : previewRows.length === 0 ? (
                    <tr>
                      <td
                        className="px-3 py-4 text-center text-on-surface-variant"
                        colSpan={4}
                      >
                        No tasks to preview for {reportDate}.
                      </td>
                    </tr>
                  ) : (
                    previewRows.map((row) => (
                      <tr
                        key={row.no}
                        className="transition-colors hover:bg-surface-bright"
                      >
                        <td className="px-3 py-2.5 whitespace-nowrap font-medium text-outline">
                          {row.no}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap font-semibold text-primary">
                          {row.achieve}
                        </td>
                        <td className="px-3 py-2.5 text-on-surface-variant whitespace-pre-wrap">
                          {row.activity}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap font-medium text-on-tertiary-container">
                          {row.remarks}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {previewRows && previewRows.length > 0 ? (
                  <tfoot className="bg-surface-container font-label-md text-label-md">
                    <tr>
                      <td
                        className="px-3 py-2 font-semibold text-primary"
                        colSpan={3}
                      >
                        Compiled Total Tasks
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-primary tabular-nums">
                        {previewRows.length} Items
                      </td>
                    </tr>
                  </tfoot>
                ) : null}
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-space-xs font-label-sm text-label-sm text-outline">
            <span className="flex items-center gap-1">
              <Icon name="check_circle" className="text-[15px]" />
              {previewRows
                ? `Verified all ${previewRows.length} tasks present in workbook`
                : "Preview not generated yet"}
            </span>
            <span>
              Status:{" "}
              {previewRows && previewRows.length > 0
                ? "Clean & Ready for Attachment"
                : "Waiting"}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between space-y-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-sm lg:col-span-5">
          <div className="space-y-space-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon name="mail" className="text-[20px] text-secondary" />
                <span className="font-label-lg text-label-lg font-semibold text-primary">
                  Review & Create Gmail Draft
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 font-label-sm text-label-sm font-semibold ${
                    gmailConnected
                      ? "bg-secondary-fixed text-on-secondary-fixed"
                      : "bg-surface-container-low text-outline"
                  }`}
                >
                  {gmailConnected
                    ? gmailStatus?.email || "Connected"
                    : "Not connected"}
                </span>
                {gmailConnected ? (
                  <button
                    type="button"
                    disabled={gmailBusy}
                    className="rounded px-2 py-1 font-label-sm text-label-sm text-outline transition-colors hover:bg-surface-container-low hover:text-primary disabled:opacity-50"
                    onClick={handleDisconnectGmail}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rounded bg-secondary-container px-2.5 py-1 font-label-sm text-label-sm text-on-secondary-container transition-colors hover:bg-secondary"
                    onClick={handleConnectGmail}
                  >
                    Connect Gmail
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-space-xs rounded-lg bg-surface-container-low p-3 font-body-sm text-body-sm">
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                <label
                  className="w-16 shrink-0 font-label-sm text-label-sm text-outline"
                  htmlFor="gmail-draft-to"
                >
                  To:
                </label>
                <input
                  id="gmail-draft-to"
                  type="email"
                  value={emailTo}
                  placeholder={
                    gmailStatus?.defaultTo || "recipient@example.com"
                  }
                  className="min-w-0 flex-1 rounded-lg bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-primary shadow-sm transition-all placeholder:text-outline-variant focus:bg-surface-bright focus:outline-none"
                  onChange={(event) => setEmailTo(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                <label
                  className="w-16 shrink-0 font-label-sm text-label-sm text-outline"
                  htmlFor="gmail-draft-subject"
                >
                  Subject:
                </label>
                <input
                  id="gmail-draft-subject"
                  type="text"
                  value={emailSubject}
                  placeholder="Email subject"
                  className="min-w-0 flex-1 rounded-lg bg-surface-container-lowest px-3 py-2 font-body-sm text-body-sm text-primary shadow-sm transition-all placeholder:text-outline-variant focus:bg-surface-bright focus:outline-none"
                  onChange={(event) => setEmailSubject(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="w-16 font-label-sm text-label-sm text-outline">
                  Attachment:
                </span>
                <div className="inline-flex items-center gap-1.5 rounded bg-surface-container-lowest px-2.5 py-1 font-label-sm text-label-sm text-primary shadow-sm">
                  <Icon
                    name="description"
                    className="text-[16px] text-on-tertiary-container"
                  />
                  <span className="font-semibold">{fileName}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 pt-2">
                <label
                  className="font-label-sm text-label-sm text-outline"
                  htmlFor="gmail-draft-body"
                >
                  Body:
                </label>
                <textarea
                  id="gmail-draft-body"
                  rows={6}
                  value={emailBody}
                  className="w-full resize-y rounded-lg bg-surface-container-lowest p-3 font-body-sm text-body-sm text-primary shadow-sm transition-all placeholder:text-outline-variant focus:bg-surface-bright focus:outline-none"
                  onChange={(event) => setEmailBody(event.target.value)}
                />
              </div>
            </div>

            <div className="flex items-start gap-2 rounded bg-surface-container-lowest p-2.5 font-label-sm text-label-sm text-on-surface-variant shadow-sm">
              <Icon
                name="info"
                className="mt-0.5 shrink-0 text-[16px] text-secondary"
              />
              <span>
                Draft is created in your connected Gmail account for manual
                review and send. No automatic sends occur.
              </span>
            </div>
          </div>

          <button
            className="inline-flex w-full items-center justify-center gap-space-xs rounded bg-primary px-5 py-3 font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={draftBusy}
            onClick={handlePrepareDraft}
          >
            <Icon name="outgoing_mail" className="text-[20px]" />
            <span>
              {draftBusy
                ? "Creating Gmail Draft..."
                : "Generate & Prepare Gmail Draft"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
