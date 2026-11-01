import { createHmac, timingSafeEqual } from "node:crypto";

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

/** Signed OAuth state binding Google callback to app username. */
export function createOAuthState(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ u: userId, ts: Date.now() }),
    "utf8",
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyOAuthState(state: string | null): string | null {
  if (!state) return null;
  const [payload, signature] = state.split(".");
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { u?: string; ts?: number };

    if (!parsed?.u || typeof parsed.u !== "string") {
      return null;
    }

    // Reject states older than 30 minutes
    if (
      typeof parsed.ts === "number" &&
      Date.now() - parsed.ts > 30 * 60 * 1000
    ) {
      return null;
    }

    return parsed.u;
  } catch {
    return null;
  }
}
