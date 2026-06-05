import { Schema, model } from "mongoose";
import { CONTENT_STATUSES, PIPELINE_STAGES } from "../../types/domain.types.js";

const pipelineProgramSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    compound: { type: String, required: true, trim: true },
    condition: { type: String, required: true, trim: true },
    modality: { type: String, required: true, trim: true },
    stage: { type: String, enum: PIPELINE_STAGES, required: true },
    highlight: { type: Boolean, default: false },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: CONTENT_STATUSES,
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

export const PipelineProgramModel = model(
  "PipelineProgram",
  pipelineProgramSchema,
);
