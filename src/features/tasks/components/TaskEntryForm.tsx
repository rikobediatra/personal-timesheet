"use client";

import { useRef, useState } from "react";
import { Icon, useToast } from "@/shared/components";
import { formatShortDate, parseDateKey } from "../lib/date";

type TaskEntryFormProps = {
  selectedDate: string;
  onSave: (description: string, achieve: number) => Promise<void>;
};

export function TaskEntryForm({ selectedDate, onSave }: TaskEntryFormProps) {
  const { showToast } = useToast();
  const [description, setDescription] = useState("");
  const [achieve, setAchieve] = useState("100");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shortDate = formatShortDate(parseDateKey(selectedDate));

  async function handleAddTask() {
    if (!description.trim()) {
      showToast(
        "Input Required",
        "Please provide a task description before adding.",
        "error",
      );
      textareaRef.current?.focus();
      return;
    }

    const achieveValue = Number(achieve);
    if (!Number.isFinite(achieveValue) || achieveValue < 0 || achieveValue > 100) {
      showToast(
        "Invalid Achieve",
        "Achieve (%) must be a number between 0 and 100.",
        "error",
      );
      return;
    }

    setSubmitting(true);
    try {
      await onSave(description, Math.round(achieveValue));
      setDescription("");
      setAchieve("100");
      showToast(
        "Task Added",
        `Task added to Logged Tasks for ${shortDate}.`,
        "done_all",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add task";
      showToast("Add Failed", message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col space-y-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="flex items-start justify-between pb-space-xs">
        <div>
          <span className="font-label-sm text-label-sm font-semibold tracking-wider text-secondary uppercase">
            Input Console
          </span>
          <h2 className="mt-0.5 font-headline-md text-headline-md text-primary">
            Add New Task Entry
          </h2>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
            Users can record multiple distinct tasks for the selected date.
          </p>
        </div>
        <div className="rounded-lg bg-surface-container-low p-2 text-secondary">
          <Icon name="edit_note" className="text-[20px]" />
        </div>
      </div>

      <form
        className="flex flex-col space-y-space-md"
        onSubmit={(event) => {
          event.preventDefault();
          void handleAddTask();
        }}
      >
        <div className="flex flex-col space-y-1">
          <label className="font-label-md text-label-md text-on-surface-variant">
            Allocated Work Date
          </label>
          <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-3.5 py-2 text-primary">
            <div className="flex items-center gap-space-xs font-label-md text-label-md">
              <Icon
                name="event_available"
                className="text-[16px] text-secondary"
              />
              <span>{shortDate}</span>
            </div>
            <span className="rounded bg-surface-container-highest px-2 py-0.5 font-label-sm text-label-sm font-semibold text-on-surface uppercase">
              Locked to View
            </span>
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <label
              className="font-label-md text-label-md font-semibold text-on-surface-variant"
              htmlFor="task-desc"
            >
              Task Description
            </label>
            <span className="font-label-sm text-label-sm text-outline">
              Direct entry
            </span>
          </div>
          <textarea
            ref={textareaRef}
            id="task-desc"
            rows={7}
            value={description}
            disabled={submitting}
            placeholder="Describe the task or activity performed..."
            className="w-full resize-none rounded-lg bg-surface-container-lowest p-3.5 font-body-md text-body-md text-primary shadow-sm transition-all placeholder:text-outline-variant focus:bg-surface-container-low focus:outline-none disabled:opacity-60"
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label
            className="font-label-md text-label-md font-semibold text-on-surface-variant"
            htmlFor="task-achieve"
          >
            Achieve (%)
          </label>
          <div className="relative">
            <input
              id="task-achieve"
              type="number"
              min={0}
              max={100}
              step={1}
              value={achieve}
              disabled={submitting}
              required
              className="h-11 w-full rounded-lg bg-surface-container-lowest px-3.5 pr-10 font-body-md text-body-md text-primary shadow-sm transition-all focus:bg-surface-container-low focus:outline-none disabled:opacity-60"
              onChange={(event) => setAchieve(event.target.value)}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-label-md text-label-md text-outline">
              %
            </span>
          </div>
        </div>

        <div className="pt-space-sm">
          <button
            className="inline-flex w-full items-center justify-center gap-space-xs rounded bg-primary px-4 py-2.5 font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container disabled:cursor-wait disabled:opacity-80"
            id="btn-add-task"
            type="submit"
            disabled={submitting}
          >
            <Icon name="add" className="text-[18px]" />
            <span>{submitting ? "Adding..." : "Add Task"}</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 pt-1 font-label-sm text-label-sm text-outline">
          <Icon name="lock" className="text-[14px]" />
          <span>Stored as an isolated record with immutable audit identity</span>
        </div>
      </form>
    </div>
  );
}
