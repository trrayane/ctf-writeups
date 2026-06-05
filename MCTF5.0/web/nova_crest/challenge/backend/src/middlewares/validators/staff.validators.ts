import type { RequestHandler } from "express";
import { validateRequest, validators as v } from "./common.js";
import {
  ARTICLE_CATEGORIES,
  CONTENT_STATUSES,
  JOB_POSTING_STATUSES,
  PIPELINE_STAGES,
} from "../../types/domain.types.js";

export const validateStaffListContent: RequestHandler = validateRequest({
  query: {
    page: v.optionalPositiveInt(100),
    limit: v.optionalPositiveInt(100),
    search: v.optionalSearch(),
    status: v.optionalEnum([...CONTENT_STATUSES, ...JOB_POSTING_STATUSES] as const),
    category: v.optionalEnum(ARTICLE_CATEGORIES),
    stage: v.optionalEnum(PIPELINE_STAGES),
  },
});

export const validateStaffGetContentById: RequestHandler = validateRequest({
  params: {
    id: v.requiredObjectId(),
  },
});
