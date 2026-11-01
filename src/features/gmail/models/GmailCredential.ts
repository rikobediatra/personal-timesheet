import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const GmailCredentialSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, trim: true },
    refreshToken: { type: String, required: true },
    gmailEmail: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export type GmailCredentialDocument = InferSchemaType<
  typeof GmailCredentialSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export type GmailCredentialModel = Model<GmailCredentialDocument>;

export const GmailCredential: GmailCredentialModel =
  (mongoose.models.GmailCredential as GmailCredentialModel | undefined) ??
  mongoose.model<GmailCredentialDocument>(
    "GmailCredential",
    GmailCredentialSchema,
  );
