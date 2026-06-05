import { Schema, model } from "mongoose";
import { INQUIRY_SOURCES, INQUIRY_STATUSES } from "../../types/domain.types.js";

const contactInquirySchema = new Schema(
  {
    source: { type: String, enum: INQUIRY_SOURCES, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, default: "" },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: INQUIRY_STATUSES,
      required: true,
      default: "open",
    },
    adminNotes: { type: String, default: "" },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, versionKey: false },
);

export const ContactInquiryModel = model(
  "ContactInquiry",
  contactInquirySchema,
);
