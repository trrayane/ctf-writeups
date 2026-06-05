import { Schema, model } from "mongoose";
import { CONTENT_STATUSES } from "../../types/domain.types.js";

const teamProfileSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    bio: { type: String, required: true },
    initials: { type: String, required: true, trim: true, uppercase: true },
    displayOrder: { type: Number, default: 0 },
    imageUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: CONTENT_STATUSES,
      required: true,
      default: "draft",
    },
    linkedUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, versionKey: false },
);

export const TeamProfileModel = model("TeamProfile", teamProfileSchema);
