import mongoose from "mongoose";
import { Task, type TaskDocument } from "../models/Task";
import type { Task as TaskDto } from "../types";

function createLogCode(workDate: string, index: number): string {
  const [, month, day] = workDate.split("-");
  return `#LOG-${month}${day}${index}`;
}

function normalizeAchieve(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    return 100;
  }
  return Math.min(100, Math.max(0, Math.round(n)));
}

function toTaskDto(doc: TaskDocument): TaskDto {
  return {
    id: String(doc._id),
    logCode: doc.logCode,
    workDate: doc.workDate,
    description: doc.description,
    achieve: normalizeAchieve(
      (doc as TaskDocument & { achieve?: number }).achieve ?? 100,
    ),
    updatedDate: new Date(doc.updatedDate).toISOString(),
  };
}

export type ListByDateResult = {
  tasks: TaskDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function listByDate(
  workDate: string,
  options?: { page?: number; limit?: number },
): Promise<ListByDateResult> {
  const page = Math.max(1, options?.page ?? 1);
  const limit = Math.max(1, Math.min(100, options?.limit ?? 5));
  const skip = (page - 1) * limit;

  const [total, docs] = await Promise.all([
    Task.countDocuments({ workDate }),
    Task.find({ workDate })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .exec(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    tasks: docs.map(toTaskDto),
    total,
    page: Math.min(page, totalPages),
    limit,
    totalPages,
  };
}

export async function listAllByDate(workDate: string): Promise<TaskDto[]> {
  const docs = await Task.find({ workDate }).sort({ createdAt: 1 }).exec();
  return docs.map(toTaskDto);
}

function assertAchieve(achieve: number): number {
  if (!Number.isFinite(achieve) || achieve < 0 || achieve > 100) {
    throw new Error("achieve must be a number between 0 and 100");
  }
  return Math.round(achieve);
}

export async function createTask(input: {
  workDate: string;
  description: string;
  achieve: number;
  createdBy: string;
}): Promise<TaskDto> {
  const description = input.description.trim();
  if (!description) {
    throw new Error("Description is required");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.workDate)) {
    throw new Error("workDate must be YYYY-MM-DD");
  }

  const achieve = assertAchieve(input.achieve);
  const count = await Task.countDocuments({ workDate: input.workDate });
  const now = new Date();

  const doc = await Task.create({
    logCode: createLogCode(input.workDate, count + 1),
    workDate: input.workDate,
    description,
    achieve,
    createdBy: input.createdBy,
    updatedDate: now,
  });

  return toTaskDto(doc);
}

export async function updateTask(
  id: string,
  description: string,
): Promise<TaskDto | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const trimmed = description.trim();
  if (!trimmed) {
    throw new Error("Description is required");
  }

  const doc = await Task.findByIdAndUpdate(
    id,
    { description: trimmed, updatedDate: new Date() },
    { new: true },
  ).exec();

  return doc ? toTaskDto(doc) : null;
}

export async function deleteTask(id: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  const result = await Task.findByIdAndDelete(id).exec();
  return Boolean(result);
}
