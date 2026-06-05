import type { RequestHandler } from "express";
import {
  ARTICLE_CATEGORIES,
  CONTENT_STATUSES,
  INQUIRY_SOURCES,
  JOB_POSTING_STATUSES,
} from "../../types/domain.types.js";
import { validateRequest, validators as v } from "./common.js";

const listPublicContentQuery = {
  page: v.optionalPositiveInt(100),
  limit: v.optionalPositiveInt(100),
  search: v.optionalSearch(),
} as const;

export const validateListPublicArticles: RequestHandler = validateRequest({
  query: {
    ...listPublicContentQuery,
    category: v.optionalEnum(ARTICLE_CATEGORIES),
  },
});

export const validateGetBySlug: RequestHandler = validateRequest({
  params: {
    slug: v.slug(),
  },
});

export const validateListPublicPipelinePrograms: RequestHandler = validateRequest({
  query: {
    ...listPublicContentQuery,
    status: v.optionalEnum(CONTENT_STATUSES),
  },
});

export const validateListPublicTeamProfiles: RequestHandler = validateRequest({
  query: {
    ...listPublicContentQuery,
    status: v.optionalEnum(CONTENT_STATUSES),
  },
});

export const validateListPublicJobPostings: RequestHandler = validateRequest({
  query: {
    ...listPublicContentQuery,
    status: v.optionalEnum(JOB_POSTING_STATUSES),
  },
});

export const validateCreatePublicInquiry: RequestHandler = validateRequest({
  body: {
    source: v.optionalEnum(INQUIRY_SOURCES),
    fullName: v.requiredString(1),
    email: v.requiredEmail(),
    company: v.optionalString(),
    subject: v.requiredString(1),
    message: v.requiredString(1),
  },
});
