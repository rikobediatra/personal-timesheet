import { NextResponse } from "next/server";
import { requireApiSession } from "@/features/auth/lib/api-auth";
import {
  exchangeCodeForTokens,
  upsertCredential,
  verifyOAuthState,
} from "@/features/gmail";
import { connectMongo } from "@/shared/lib/mongodb";

export async function GET(request: Request) {
  const session = await requireApiSession();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const origin = new URL(request.url).origin;

  const fail = (reason: string) =>
    NextResponse.redirect(
      `${origin}/tasks?gmail=error&reason=${encodeURIComponent(reason)}`,
    );

  if (oauthError) {
    return fail(oauthError);
  }

  if (!session) {
    return fail("session_required");
  }

  const stateUserId = verifyOAuthState(state);
  if (!stateUserId || stateUserId !== session.u) {
    return fail("invalid_state");
  }

  if (!code) {
    return fail("missing_code");
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await connectMongo();
    await upsertCredential({
      userId: session.u,
      refreshToken: tokens.refreshToken,
      gmailEmail: tokens.gmailEmail,
    });

    return NextResponse.redirect(`${origin}/tasks?gmail=connected`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "oauth_exchange_failed";
    return fail(message);
  }
}
