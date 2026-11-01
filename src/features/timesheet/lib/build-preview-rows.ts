import type { Task } from "@/features/tasks/types";
import { REPORT_META } from "./report-meta";

export type PreviewRow = {
  no: number;
  achieve: string;
  activity: string;
  remarks: string;
};

export function buildPreviewRows(tasks: Task[]): PreviewRow[] {
  return tasks.map((task, index) => ({
    no: index + 1,
    achieve: `${task.achieve ?? 100}%`,
    activity: task.description,
    remarks: REPORT_META.defaultRemarks,
  }));
}
