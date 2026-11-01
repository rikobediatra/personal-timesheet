"use client";

import { useState } from "react";
import { Icon, useToast } from "@/shared/components";
import type { Task } from "../types";

type TaskCardProps = {
  task: Task;
  accent?: "secondary" | "tint";
  onUpdate: (id: string, description: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<void>;
};

export function TaskCard({
  task,
  accent = "secondary",
  onUpdate,
  onDelete,
}: TaskCardProps) {
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.description);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    if (!draft.trim()) {
      showToast(
        "Input Required",
        "Please provide a task description before saving.",
        "error",
      );
      return;
    }

    setBusy(true);
    try {
      await onUpdate(task.id, draft);
      setEditing(false);
      showToast(
        "Task Updated",
        `Record ${task.logCode} successfully saved.`,
        "check_circle",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update task";
      showToast("Update Failed", message, "error");
    } finally {
      setBusy(false);
    }
  }

  function handleCancel() {
    setDraft(task.description);
    setEditing(false);
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await onDelete(task.id);
      showToast(
        "Task Deleted",
        `Record ${task.logCode} removed. Other tasks remain untouched.`,
        "delete",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete task";
      showToast("Delete Failed", message, "error");
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col space-y-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-md ring-1 ring-secondary/60 transition-all">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-1">
          <div className="flex items-center gap-space-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
            <span className="flex items-center gap-1 font-label-sm text-label-sm font-bold tracking-wider text-secondary uppercase">
              <Icon name="edit" className="text-[15px]" />
              Editing Task {task.logCode}
            </span>
          </div>
          <div className="flex items-center gap-1 text-label-sm text-outline">
            <Icon name="lock_reset" className="text-[14px]" />
            <span>Isolated Record Edit</span>
          </div>
        </div>

        <div className="flex flex-col space-y-1 pt-1">
          <label
            className="font-label-sm text-label-sm font-medium text-on-surface-variant"
            htmlFor={`inline-edit-${task.id}`}
          >
            Task Description
          </label>
          <textarea
            id={`inline-edit-${task.id}`}
            rows={3}
            value={draft}
            disabled={busy}
            className="w-full resize-none rounded-lg border border-outline-variant/40 bg-surface-container-low p-3 font-body-sm text-body-sm leading-relaxed text-primary transition-all focus:bg-surface-container-lowest focus:outline-none disabled:opacity-60"
            onChange={(event) => setDraft(event.target.value)}
          />
        </div>

        <div className="flex items-center justify-between gap-space-sm pt-1">
          <div className="flex items-center gap-1 text-[11px] text-outline">
            <Icon name="info" className="text-[13px] text-secondary" />
            <span>Direct task description edit.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1 rounded px-3 py-1.5 font-label-md text-label-md text-outline transition-colors hover:bg-surface-container-low hover:text-primary disabled:opacity-60"
              type="button"
              disabled={busy}
              onClick={handleCancel}
            >
              <Icon name="close" className="text-[16px]" />
              <span>Cancel</span>
            </button>
            <button
              className="inline-flex items-center gap-1 rounded bg-primary px-3.5 py-1.5 font-label-md text-label-md text-on-primary shadow-sm transition-all hover:bg-primary-container disabled:opacity-60"
              type="button"
              disabled={busy}
              onClick={() => void handleSave()}
            >
              <Icon name="check" className="text-[16px]" />
              <span>{busy ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col space-y-space-xs rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-space-md">
        <div className="flex items-center gap-space-xs">
          <span
            className={`h-6 w-1.5 rounded-full ${
              accent === "tint" ? "bg-surface-tint" : "bg-secondary"
            }`}
          />
          <span className="rounded bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm font-medium text-on-surface-variant">
            {task.logCode}
          </span>
          <span className="flex items-center gap-1 text-label-sm text-outline">
            <Icon
              name="done_all"
              className="text-[14px] text-on-tertiary-container"
            />
            Recorded
          </span>
          <span className="rounded bg-secondary-fixed px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-secondary-fixed">
            {task.achieve ?? 100}%
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-90 transition-opacity group-hover:opacity-100">
          <button
            className="rounded p-1.5 text-outline transition-colors hover:bg-surface-container-low hover:text-primary disabled:opacity-60"
            title="Edit Task"
            type="button"
            disabled={busy}
            onClick={() => {
              setDraft(task.description);
              setEditing(true);
            }}
          >
            <Icon name="edit" className="text-[18px]" />
          </button>
          <button
            className="rounded p-1.5 text-outline transition-colors hover:bg-surface-container-low hover:text-error disabled:opacity-60"
            title="Delete Task"
            type="button"
            disabled={busy}
            onClick={() => void handleDelete()}
          >
            <Icon name="delete" className="text-[18px]" />
          </button>
        </div>
      </div>
      <div className="pt-1 pl-2.5">
        <p className="font-body-md text-body-md leading-relaxed font-medium text-on-surface">
          {task.description}
        </p>
      </div>
    </div>
  );
}
