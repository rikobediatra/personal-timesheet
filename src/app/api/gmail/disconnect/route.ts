import { NextResponse } from "next/server";
import { requireApiSession } from "@/features/auth/lib/api-auth";
import { deleteCredentialByUserId } from "@/features/gmail";
import { connectMongo } from "@/shared/lib/mongodb";

export async function POST() {
  const session = await requireApiSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    await deleteCredentialByUserId(session.u);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to disconnect Gmail";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
