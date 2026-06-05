import { Schema, model } from "mongoose";

const roleSchema = new Schema(
  {
    _id: { type: String },
    code: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    isSystem: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, versionKey: false },
);

export const RoleModel = model("Role", roleSchema);
