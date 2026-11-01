import { NextResponse } from "next/server";
import { requireApiSession } from "@/features/auth/lib/api-auth";
import { createGmailDraft, getCredentialByUserId } from "@/features/gmail";
import { listAllByDate } from "@/features/tasks/lib/task-service";
import {
  buildReportFileName,
  generateWorkbook,
} from "@/features/timesheet/lib/server";
import { connectMongo } from "@/shared/lib/mongodb";

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      date?: string;
      to?: string;
      subject?: string;
      body?: string;
    };

    const date = body.date?.trim() ?? "";
    const to = body.to?.trim() ?? "";
    const subject = body.subject?.trim() ?? "";
    const emailBody = body.body?.trim() ?? "";

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "date=YYYY-MM-DD is required" },
        { status: 400 },
      );
    }

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: "to, subject, and body are required" },
        { status: 400 },
      );
    }

    await connectMongo();
    const credential = await getCredentialByUserId(session.u);
    if (!credential) {
      return NextResponse.json(
        { error: "Gmail is not connected" },
        { status: 401 },
      );
    }

    const tasks = await listAllByDate(date);
    if (tasks.length === 0) {
      return NextResponse.json(
        { error: "No tasks for selected date" },
        { status: 400 },
      );
    }

    const fileBuffer = await generateWorkbook(date, tasks);
    const fileName = `${buildReportFileName(date)}.xlsx`;
    const { draftId } = await createGmailDraft({
      refreshToken: credential.refreshToken,
      to,
      subject,
      body: emailBody,
      fileName,
      fileBuffer,
    });

    return NextResponse.json({
      draftId,
      webUrl: "https://mail.google.com/mail/#drafts",
      fileName,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create Gmail draft";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
