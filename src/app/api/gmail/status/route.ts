import { NextResponse } from "next/server";
import { requireApiSession } from "@/features/auth/lib/api-auth";
import { getCredentialByUserId, getDefaultGmailTo } from "@/features/gmail";
import { connectMongo } from "@/shared/lib/mongodb";

export async function GET() {
  const session = await requireApiSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    const credential = await getCredentialByUserId(session.u);

    return NextResponse.json({
      connected: Boolean(credential),
      email: credential?.gmailEmail ?? null,
      defaultTo: getDefaultGmailTo(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to read Gmail status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
