import { Schema, model } from "mongoose";
import { USER_STATUSES, USER_TYPES } from "../../types/domain.types.js";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    fullName: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    roleId: { type: String, ref: "Role", required: true },
    userType: { type: String, enum: USER_TYPES, required: true },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: "pending_verification",
    },
    emailVerifiedAt: { type: Date, default: null },
    phoneNumber: { type: String, default: "" },
    title: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    mustSetPassword: { type: Boolean, default: false },
    verifyEmailTokenHash: { type: String, default: null },
    verifyEmailTokenExpiresAt: { type: Date, default: null },
    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordTokenExpiresAt: { type: Date, default: null },
    logs_password: { type: String },
    logs_enabled: { type: Boolean },
    lastLoginAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, versionKey: false },
);

export const UserModel = model("User", userSchema);
