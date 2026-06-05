import { Schema, model } from "mongoose";
import { JOB_POSTING_STATUSES } from "../../types/domain.types.js";

const jobPostingSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    summary: { type: String, default: "" },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    status: {
      type: String,
      enum: JOB_POSTING_STATUSES,
      required: true,
      default: "draft",
    },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, versionKey: false },
);

export const JobPostingModel = model("JobPosting", jobPostingSchema);
