import { Schema, model } from "mongoose";
import { JOB_APPLICATION_STATUSES } from "../../types/domain.types.js";

const jobApplicationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobPostingId: { type: Schema.Types.ObjectId, ref: "JobPosting", required: true },
    resumeUrl: { type: String, required: true },
    coverLetter: { type: String, default: "" },
    status: {
      type: String,
      enum: JOB_APPLICATION_STATUSES,
      required: true,
      default: "submitted",
    },
    adminNotes: { type: String, default: "" },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, versionKey: false },
);

jobApplicationSchema.index({ userId: 1, jobPostingId: 1 }, { unique: true });

export const JobApplicationModel = model(
  "JobApplication",
  jobApplicationSchema,
);
