export const ROLE_CODES = ["admin", "staff", "external"] as const;
export type RoleCode = (typeof ROLE_CODES)[number];

export const USER_TYPES = ["internal", "external"] as const;
export type UserType = (typeof USER_TYPES)[number];

export const USER_STATUSES = [
  "pending_verification",
  "active",
  "disabled",
  "archived",
] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const ARTICLE_CATEGORIES = ["news", "knowledge"] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const CONTENT_VISIBILITIES = ["public", "internal"] as const;
export type ContentVisibility = (typeof CONTENT_VISIBILITIES)[number];

export const CONTENT_STATUSES = ["draft", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const PIPELINE_STAGES = [
  "Preclinical",
  "Phase I",
  "Phase II",
  "Phase III",
  "FDA Review",
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const JOB_POSTING_STATUSES = [
  "draft",
  "published",
  "closed",
  "archived",
] as const;
export type JobPostingStatus = (typeof JOB_POSTING_STATUSES)[number];

export const JOB_APPLICATION_STATUSES = [
  "submitted",
  "under_review",
  "accepted",
  "rejected",
] as const;
export type JobApplicationStatus = (typeof JOB_APPLICATION_STATUSES)[number];

export const INQUIRY_SOURCES = ["public", "portal"] as const;
export type InquirySource = (typeof INQUIRY_SOURCES)[number];

export const INQUIRY_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "closed",
] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];
