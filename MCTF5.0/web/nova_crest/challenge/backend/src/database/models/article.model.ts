import { Schema, model } from "mongoose";
import {
  ARTICLE_CATEGORIES,
  CONTENT_STATUSES,
  CONTENT_VISIBILITIES,
} from "../../types/domain.types.js";

const articleSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    category: { type: String, enum: ARTICLE_CATEGORIES, required: true },
    visibility: {
      type: String,
      enum: CONTENT_VISIBILITIES,
      required: true,
      default: "public",
    },
    status: {
      type: String,
      enum: CONTENT_STATUSES,
      required: true,
      default: "draft",
    },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: "" },
    body: { type: String, required: true },
    tags: { type: [String], default: [] },
    coverImageUrl: { type: String, default: "" },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, versionKey: false },
);

export const ArticleModel = model("Article", articleSchema);
