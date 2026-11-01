import { buildReportFileName } from "./report-meta";

export async function downloadTimesheetForDate(workDate: string): Promise<string> {
  const res = await fetch(
    `/api/timesheet/download?date=${encodeURIComponent(workDate)}`,
  );

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? "Download failed");
  }

  const fileName = `${buildReportFileName(workDate)}.xlsx`;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return fileName;
}
