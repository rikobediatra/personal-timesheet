import { NextResponse } from "next/server";
import { requireApiSession } from "@/features/auth/lib/api-auth";
import { listAllByDate } from "@/features/tasks/lib/task-service";
import {
  buildReportFileName,
  generateWorkbook,
} from "@/features/timesheet/lib/server";
import { connectMongo } from "@/shared/lib/mongodb";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Query param date=YYYY-MM-DD is required" },
      { status: 400 },
    );
  }

  try {
    await connectMongo();
    const tasks = await listAllByDate(date);

    if (tasks.length === 0) {
      return NextResponse.json(
        { error: "No tasks for selected date" },
        { status: 400 },
      );
    }

    const buffer = await generateWorkbook(date, tasks);
    const fileName = `${buildReportFileName(date)}.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate timesheet";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
