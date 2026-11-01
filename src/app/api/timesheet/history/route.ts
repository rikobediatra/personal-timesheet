import { NextResponse } from "next/server";
import { requireApiSession } from "@/features/auth/lib/api-auth";
import { listTimesheetHistory } from "@/features/timesheet/lib/history-service";
import { connectMongo } from "@/shared/lib/mongodb";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const q = searchParams.get("q") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "5");

  if (!from || !to || !DATE_RE.test(from) || !DATE_RE.test(to)) {
    return NextResponse.json(
      { error: "Query params from and to (YYYY-MM-DD) are required" },
      { status: 400 },
    );
  }

  try {
    await connectMongo();
    const result = await listTimesheetHistory({
      from,
      to,
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? limit : 5,
      q,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list timesheet history";
    const status = message.includes("must be") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
