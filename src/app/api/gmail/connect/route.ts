import { NextResponse } from "next/server";
import { requireApiSession } from "@/features/auth/lib/api-auth";
import { buildGoogleAuthUrl, createOAuthState } from "@/features/gmail";

export async function GET() {
  const session = await requireApiSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const state = createOAuthState(session.u);
    const url = buildGoogleAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to start Gmail OAuth";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
