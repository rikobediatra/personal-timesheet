import { google } from "googleapis";
import {
  GMAIL_OAUTH_SCOPES,
  getGoogleOAuthConfig,
} from "./google-config";

function createOAuthClient() {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function buildGoogleAuthUrl(state: string): string {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [...GMAIL_OAUTH_SCOPES],
    state,
  });
}

export async function exchangeCodeForTokens(code: string): Promise<{
  refreshToken: string;
  accessToken: string;
  gmailEmail: string;
}> {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error(
      "No refresh token returned. Revoke app access in Google Account and connect again.",
    );
  }
  if (!tokens.access_token) {
    throw new Error("No access token returned from Google");
  }

  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: client });
  const profile = await oauth2.userinfo.get();
  const gmailEmail = profile.data.email?.trim();
  if (!gmailEmail) {
    throw new Error("Could not read Gmail address from Google profile");
  }

  return {
    refreshToken: tokens.refresh_token,
    accessToken: tokens.access_token,
    gmailEmail,
  };
}

export async function getAuthorizedGmailClient(refreshToken: string) {
  const client = createOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  await client.getAccessToken();
  return google.gmail({ version: "v1", auth: client });
}
