import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const TaskSchema = new Schema(
  {
    logCode: { type: String, required: true, trim: true },
    workDate: { type: String, required: true, index: true },
    description: { type: String, required: true, trim: true },
    achieve: { type: Number, required: true, min: 0, max: 100 },
    createdBy: { type: String, required: true, trim: true },
    updatedDate: { type: Date, required: true },
  },
  { timestamps: true },
);

TaskSchema.index({ workDate: 1, createdAt: 1 });

export type TaskDocument = InferSchemaType<typeof TaskSchema> & {
  _id: mongoose.Types.ObjectId;
};

export type TaskModel = Model<TaskDocument>;

export const Task: TaskModel =
  (mongoose.models.Task as TaskModel | undefined) ??
  mongoose.model<TaskDocument>("Task", TaskSchema);
