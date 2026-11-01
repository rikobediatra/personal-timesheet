import { NextResponse } from "next/server";
import { requireApiSession } from "@/features/auth/lib/api-auth";
import {
  createTask,
  listAllByDate,
  listByDate,
} from "@/features/tasks/lib/task-service";
import { connectMongo } from "@/shared/lib/mongodb";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const all = searchParams.get("all") === "1";
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "5");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Query param date=YYYY-MM-DD is required" },
      { status: 400 },
    );
  }

  try {
    await connectMongo();

    if (all) {
      const tasks = await listAllByDate(date);
      return NextResponse.json({
        tasks,
        total: tasks.length,
        page: 1,
        limit: tasks.length || 5,
        totalPages: 1,
      });
    }

    const result = await listByDate(date, {
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? limit : 5,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list tasks";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      workDate?: string;
      description?: string;
      achieve?: number;
    };

    if (!body.workDate || !body.description?.trim()) {
      return NextResponse.json(
        { error: "workDate and description are required" },
        { status: 400 },
      );
    }

    if (body.achieve === undefined || body.achieve === null) {
      return NextResponse.json(
        { error: "achieve is required (0-100)" },
        { status: 400 },
      );
    }

    await connectMongo();
    const task = await createTask({
      workDate: body.workDate,
      description: body.description,
      achieve: Number(body.achieve),
      createdBy: session.u,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create task";
    const status =
      message.includes("required") ||
      message.includes("workDate") ||
      message.includes("achieve")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
