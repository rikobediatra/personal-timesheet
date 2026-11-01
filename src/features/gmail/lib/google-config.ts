export const GMAIL_COMPOSE_SCOPE =
  "https://www.googleapis.com/auth/gmail.compose";
export const GMAIL_USERINFO_EMAIL_SCOPE =
  "https://www.googleapis.com/auth/userinfo.email";

export const GMAIL_OAUTH_SCOPES = [
  GMAIL_COMPOSE_SCOPE,
  GMAIL_USERINFO_EMAIL_SCOPE,
] as const;

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI?.trim() ??
    "http://localhost:3000/api/gmail/callback";

  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured in .env.local",
    );
  }

  return { clientId, clientSecret, redirectUri };
}

export function getDefaultGmailTo(): string {
  return process.env.GMAIL_DEFAULT_TO?.trim() ?? "";
}
