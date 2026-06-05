import { Schema, model } from "mongoose";

const errorLogSchema = new Schema(
  {
    source: { type: String, enum: ["express", "process"], required: true },
    category: {
      type: String,
      enum: [
        "internal_server_error",
        "handled_request_error",
        "duplicate_key",
        "uncaught_exception",
        "unhandled_rejection",
        "startup_failure",
      ],
      required: true,
    },
    message: { type: String, required: true, trim: true },
    stack: { type: String, default: "" },
    method: { type: String, default: "", trim: true, uppercase: true },
    route: { type: String, default: "", trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

errorLogSchema.index({ createdAt: -1 });
errorLogSchema.index({ source: 1, createdAt: -1 });
errorLogSchema.index({ category: 1, createdAt: -1 });

export const ErrorLogModel = model("ErrorLog", errorLogSchema);