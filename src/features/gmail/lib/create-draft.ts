import { getAuthorizedGmailClient } from "./google-oauth";

function toBase64Url(value: Buffer | string): string {
  const buffer = typeof value === "string" ? Buffer.from(value, "utf8") : value;
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function encodeHeaderValue(value: string): string {
  // RFC 2047 for non-ASCII subjects
  if (/^[\x20-\x7E]*$/.test(value)) {
    return value;
  }
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function buildMimeMessage(input: {
  to: string;
  subject: string;
  body: string;
  fileName: string;
  fileBuffer: Buffer;
}): string {
  const boundary = `mixed_${Date.now().toString(16)}`;
  const attachmentBase64 = input.fileBuffer
    .toString("base64")
    .replace(/(.{76})/g, "$1\r\n");

  return [
    `To: ${input.to}`,
    `Subject: ${encodeHeaderValue(input.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    input.body,
    "",
    `--${boundary}`,
    `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; name="${input.fileName}"`,
    "Content-Transfer-Encoding: base64",
    `Content-Disposition: attachment; filename="${input.fileName}"`,
    "",
    attachmentBase64,
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

export async function createGmailDraft(input: {
  refreshToken: string;
  to: string;
  subject: string;
  body: string;
  fileName: string;
  fileBuffer: Buffer;
}): Promise<{ draftId: string }> {
  const gmail = await getAuthorizedGmailClient(input.refreshToken);
  const raw = toBase64Url(
    buildMimeMessage({
      to: input.to,
      subject: input.subject,
      body: input.body,
      fileName: input.fileName,
      fileBuffer: input.fileBuffer,
    }),
  );

  const response = await gmail.users.drafts.create({
    userId: "me",
    requestBody: {
      message: { raw },
    },
  });

  const draftId = response.data.id;
  if (!draftId) {
    throw new Error("Gmail did not return a draft id");
  }

  return { draftId };
}
