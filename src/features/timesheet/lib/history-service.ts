import type { PipelineStage } from "mongoose";
import { Task } from "@/features/tasks/models/Task";
import { buildReportFileName } from "./report-meta";
import type {
  TimesheetHistoryItem,
  TimesheetHistoryQuery,
  TimesheetHistoryResult,
} from "../types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listTimesheetHistory(
  query: TimesheetHistoryQuery,
): Promise<TimesheetHistoryResult> {
  const { from, to } = query;

  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    throw new Error("from and to must be YYYY-MM-DD");
  }

  if (from > to) {
    throw new Error("from must be on or before to");
  }

  const page = Math.max(1, query.page ?? 1);
  const limit = Math.max(1, Math.min(50, query.limit ?? 5));
  const q = query.q?.trim() ?? "";

  type AggRow = {
    workDate: string;
    taskCount: number;
    snippet: string;
    lastUpdated: Date;
  };
  type AggMeta = {
    totalDays: number;
    totalTasks: number;
    latestUpdated: Date | null;
  };

  async function run(skip: number) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          workDate: { $gte: from, $lte: to },
        },
      },
      { $sort: { workDate: 1, createdAt: 1 } },
      {
        $group: {
          _id: "$workDate",
          taskCount: { $sum: 1 },
          snippet: { $first: "$description" },
          lastUpdated: { $max: "$updatedDate" },
          descriptions: { $push: "$description" },
        },
      },
    ];

    if (q) {
      pipeline.push({
        $match: {
          descriptions: { $regex: escapeRegex(q), $options: "i" },
        },
      });
    }

    pipeline.push(
      { $sort: { _id: -1 } },
      {
        $facet: {
          items: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                workDate: "$_id",
                taskCount: 1,
                snippet: 1,
                lastUpdated: 1,
              },
            },
          ],
          meta: [
            {
              $group: {
                _id: null,
                totalDays: { $sum: 1 },
                totalTasks: { $sum: "$taskCount" },
                latestUpdated: { $max: "$lastUpdated" },
              },
            },
          ],
        },
      },
    );

    const [result] = await Task.aggregate<{
      items: AggRow[];
      meta: AggMeta[];
    }>(pipeline).exec();

    return result;
  }

  let result = await run((page - 1) * limit);
  const meta = result?.meta[0];
  const total = meta?.totalDays ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const safePage = total === 0 ? 1 : Math.min(page, totalPages);

  if (safePage !== page && total > 0) {
    result = await run((safePage - 1) * limit);
  }

  const items: TimesheetHistoryItem[] = (result?.items ?? []).map((row) => ({
    workDate: row.workDate,
    taskCount: row.taskCount,
    snippet: row.snippet,
    lastUpdated: new Date(row.lastUpdated).toISOString(),
    fileName: `${buildReportFileName(row.workDate)}.xlsx`,
  }));

  const finalMeta = result?.meta[0] ?? meta;

  return {
    items,
    total,
    page: safePage,
    limit,
    totalPages,
    stats: {
      totalDays: total,
      totalTasks: finalMeta?.totalTasks ?? 0,
      latestUpdated: finalMeta?.latestUpdated
        ? new Date(finalMeta.latestUpdated).toISOString()
        : null,
      from,
      to,
    },
  };
}
