import { GmailCredential } from "../models/GmailCredential";

export type StoredGmailCredential = {
  userId: string;
  refreshToken: string;
  gmailEmail: string;
};

export async function getCredentialByUserId(
  userId: string,
): Promise<StoredGmailCredential | null> {
  const doc = await GmailCredential.findOne({ userId }).exec();
  if (!doc) return null;
  return {
    userId: doc.userId,
    refreshToken: doc.refreshToken,
    gmailEmail: doc.gmailEmail,
  };
}

export async function upsertCredential(input: {
  userId: string;
  refreshToken: string;
  gmailEmail: string;
}): Promise<StoredGmailCredential> {
  const doc = await GmailCredential.findOneAndUpdate(
    { userId: input.userId },
    {
      userId: input.userId,
      refreshToken: input.refreshToken,
      gmailEmail: input.gmailEmail,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).exec();

  if (!doc) {
    throw new Error("Failed to save Gmail credentials");
  }

  return {
    userId: doc.userId,
    refreshToken: doc.refreshToken,
    gmailEmail: doc.gmailEmail,
  };
}

export async function deleteCredentialByUserId(userId: string): Promise<boolean> {
  const result = await GmailCredential.deleteOne({ userId }).exec();
  return result.deletedCount > 0;
}
