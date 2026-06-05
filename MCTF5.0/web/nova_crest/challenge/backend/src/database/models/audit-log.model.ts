import { Schema, model } from "mongoose";

const auditLogSchema = new Schema(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    roleSnapshot: { type: String, default: "public" },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, required: true, trim: true },
    entityId: { type: String, default: "" },
    method: { type: String, required: true, trim: true, uppercase: true },
    route: { type: String, required: true, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

export const AuditLogModel = model("AuditLog", auditLogSchema);
