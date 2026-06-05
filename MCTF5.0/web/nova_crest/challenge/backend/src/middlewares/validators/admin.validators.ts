import type { RequestHandler } from "express";
import {
  ARTICLE_CATEGORIES,
  CONTENT_STATUSES,
  CONTENT_VISIBILITIES,
  INQUIRY_SOURCES,
  INQUIRY_STATUSES,
  JOB_APPLICATION_STATUSES,
  JOB_POSTING_STATUSES,
  PIPELINE_STAGES,
  USER_STATUSES,
  USER_TYPES,
} from "../../types/domain.types.js";
import { validateRequest, validators as v } from "./common.js";

const listQueryCommon = {
  page: v.optionalPositiveInt(100),
  limit: v.optionalPositiveInt(100),
  search: v.optionalSearch(),
} as const;

const ERROR_LOG_SOURCES = ["express", "process"] as const;

export const validateAdminListUsers: RequestHandler = validateRequest({
  query: {
    ...listQueryCommon,
    roleCode: v.optionalString(),
    userType: v.optionalEnum(USER_TYPES),
    status: v.optionalEnum(USER_STATUSES),
  },
});

export const validateAdminCreateStaffUser: RequestHandler = validateRequest({
  body: {
    email: v.requiredEmail(),
    fullName: v.requiredString(1),
    password: v.requiredString(8),
    title: v.optionalString(),
    phoneNumber: v.optionalString(),
    avatarUrl: v.optionalUrl(),
    roleCode: v.optionalString(),
    userType: v.optionalEnum(USER_TYPES),
  },
});

export const validateAdminUserIdParam: RequestHandler = validateRequest({
  params: {
    userId: v.requiredObjectId(),
  },
});

export const validateAdminUpdateUser: RequestHandler = validateRequest({
  params: {
    userId: v.requiredObjectId(),
  },
  body: {
    fullName: v.optionalString(),
    roleId: v.optionalString(),
    status: v.optionalEnum(USER_STATUSES),
    phoneNumber: v.optionalString(),
    title: v.optionalString(),
    avatarUrl: v.optionalUrl(),
    userType: v.optionalEnum(USER_TYPES),
  },
});

export const validateAdminListRoles: RequestHandler = validateRequest({
  query: {
    ...listQueryCommon,
  },
});

export const validateAdminCreateRole: RequestHandler = validateRequest({
  body: {
    code: v.requiredString(1),
    name: v.requiredString(1),
    description: v.optionalString(),
  },
});

export const validateAdminRoleIdParam: RequestHandler = validateRequest({
  params: {
    roleId: v.requiredString(1),
  },
});

export const validateAdminUpdateRole: RequestHandler = validateRequest({
  params: {
    roleId: v.requiredString(1),
  },
  body: {
    name: v.optionalString(),
    description: v.optionalString(),
  },
});

export const validateAdminListSessions: RequestHandler = validateRequest({
  query: {
    ...listQueryCommon,
    userId: v.optionalObjectId(),
    activeOnly: v.optionalBoolean(),
  },
});

export const validateAdminSessionIdParam: RequestHandler = validateRequest({
  params: {
    sessionId: v.requiredObjectId(),
  },
});

export const validateAdminListAuditLogs: RequestHandler = validateRequest({
  query: {
    ...listQueryCommon,
    action: v.optionalString(),
    entityType: v.optionalString(),
    actorUserId: v.optionalObjectId(),
  },
});

export const validateAdminAuditLogIdParam: RequestHandler = validateRequest({
  params: {
    auditLogId: v.requiredObjectId(),
  },
});

export const validateAdminContentIdParam: RequestHandler = validateRequest({
  params: {
    id: v.requiredObjectId(),
  },
});

export const validateAdminListArticles: RequestHandler = validateRequest({
  query: {
    ...listQueryCommon,
    status: v.optionalEnum(CONTENT_STATUSES),
    category: v.optionalEnum(ARTICLE_CATEGORIES),
    visibility: v.optionalEnum(CONTENT_VISIBILITIES),
  },
});

export const validateAdminCreateArticle: RequestHandler = validateRequest({
  body: {
    slug: v.optionalString(),
    category: v.requiredEnum(ARTICLE_CATEGORIES),
    visibility: v.optionalEnum(CONTENT_VISIBILITIES),
    status: v.optionalEnum(CONTENT_STATUSES),
    title: v.requiredString(1),
    excerpt: v.optionalString(),
    body: v.requiredString(1),
    tags: v.optionalStringArray(),
    coverImageUrl: v.optionalUrl(),
  },
});

export const validateAdminUpdateArticle: RequestHandler = validateRequest({
  params: {
    id: v.requiredObjectId(),
  },
  body: {
    slug: v.optionalString(),
    category: v.optionalEnum(ARTICLE_CATEGORIES),
    visibility: v.optionalEnum(CONTENT_VISIBILITIES),
    status: v.optionalEnum(CONTENT_STATUSES),
    title: v.optionalString(),
    excerpt: v.optionalString(),
    body: v.optionalString(),
    tags: v.optionalStringArray(),
    coverImageUrl: v.optionalUrl(),
  },
});

export const validateAdminListPipelinePrograms: RequestHandler = validateRequest({
  query: {
    ...listQueryCommon,
    status: v.optionalEnum(CONTENT_STATUSES),
    stage: v.optionalEnum(PIPELINE_STAGES),
  },
});

export const validateAdminCreatePipelineProgram: RequestHandler = validateRequest({
  body: {
    slug: v.optionalString(),
    compound: v.requiredString(1),
    condition: v.requiredString(1),
    modality: v.requiredString(1),
    stage: v.requiredEnum(PIPELINE_STAGES),
    highlight: v.optionalBoolean(),
    summary: v.optionalString(),
    description: v.optionalString(),
    status: v.optionalEnum(CONTENT_STATUSES),
  },
});

export const validateAdminUpdatePipelineProgram: RequestHandler = validateRequest({
  params: {
    id: v.requiredObjectId(),
  },
  body: {
    slug: v.optionalString(),
    compound: v.optionalString(),
    condition: v.optionalString(),
    modality: v.optionalString(),
    stage: v.optionalEnum(PIPELINE_STAGES),
    highlight: v.optionalBoolean(),
    summary: v.optionalString(),
    description: v.optionalString(),
    status: v.optionalEnum(CONTENT_STATUSES),
  },
});

export const validateAdminListTeamProfiles: RequestHandler = validateRequest({
  query: {
    ...listQueryCommon,
    status: v.optionalEnum(CONTENT_STATUSES),
  },
});

export const validateAdminCreateTeamProfile: RequestHandler = validateRequest({
  body: {
    slug: v.optionalString(),
    name: v.requiredString(1),
    title: v.requiredString(1),
    bio: v.requiredString(1),
    initials: v.requiredString(1),
    displayOrder: v.optionalNonNegativeInt(999999),
    imageUrl: v.optionalUrl(),
    status: v.optionalEnum(CONTENT_STATUSES),
    linkedUserId: v.optionalObjectId(),
  },
});

export const validateAdminUpdateTeamProfile: RequestHandler = validateRequest({
  params: {
    id: v.requiredObjectId(),
  },
  body: {
    slug: v.optionalString(),
    name: v.optionalString(),
    title: v.optionalString(),
    bio: v.optionalString(),
    initials: v.optionalString(),
    displayOrder: v.optionalNonNegativeInt(999999),
    imageUrl: v.optionalUrl(),
    status: v.optionalEnum(CONTENT_STATUSES),
    linkedUserId: v.optionalObjectId(),
  },
});

export const validateAdminListJobPostings: RequestHandler = validateRequest({
  query: {
    ...listQueryCommon,
    status: v.optionalEnum(JOB_POSTING_STATUSES),
  },
});

export const validateAdminCreateJobPosting: RequestHandler = validateRequest({
  body: {
    slug: v.optionalString(),
    title: v.requiredString(1),
    department: v.requiredString(1),
    location: v.requiredString(1),
    summary: v.optionalString(),
    description: v.requiredString(1),
    requirements: v.optionalStringArray(),
    benefits: v.optionalStringArray(),
    status: v.optionalEnum(JOB_POSTING_STATUSES),
  },
});

export const validateAdminUpdateJobPosting: RequestHandler = validateRequest({
  params: {
    id: v.requiredObjectId(),
  },
  body: {
    slug: v.optionalString(),
    title: v.optionalString(),
    department: v.optionalString(),
    location: v.optionalString(),
    summary: v.optionalString(),
    description: v.optionalString(),
    requirements: v.optionalStringArray(),
    benefits: v.optionalStringArray(),
    status: v.optionalEnum(JOB_POSTING_STATUSES),
  },
});

export const validateAdminListJobApplications: RequestHandler = validateRequest({
  query: {
    ...listQueryCommon,
    status: v.optionalEnum(JOB_APPLICATION_STATUSES),
    userId: v.optionalObjectId(),
    jobPostingId: v.optionalObjectId(),
  },
});

export const validateAdminCreateJobApplication: RequestHandler = validateRequest({
  body: {
    userId: v.requiredObjectId(),
    jobPostingId: v.requiredObjectId(),
    resumeUrl: v.optionalUrl(),
    coverLetter: v.optionalString(),
    status: v.optionalEnum(JOB_APPLICATION_STATUSES),
    adminNotes: v.optionalString(),
  },
});

export const validateAdminJobApplicationIdParam: RequestHandler = validateRequest({
  params: {
    applicationId: v.requiredObjectId(),
  },
});

export const validateAdminUpdateJobApplication: RequestHandler = validateRequest({
  params: {
    applicationId: v.requiredObjectId(),
  },
  body: {
    resumeUrl: v.optionalUrl(),
    coverLetter: v.optionalString(),
    status: v.optionalEnum(JOB_APPLICATION_STATUSES),
    adminNotes: v.optionalString(),
  },
});

export const validateAdminListInquiries: RequestHandler = validateRequest({
  query: {
    ...listQueryCommon,
    source: v.optionalEnum(INQUIRY_SOURCES),
    status: v.optionalEnum(INQUIRY_STATUSES),
  },
});

export const validateAdminCreateInquiry: RequestHandler = validateRequest({
  body: {
    source: v.optionalEnum(INQUIRY_SOURCES),
    userId: v.optionalObjectId(),
    fullName: v.requiredString(1),
    email: v.requiredEmail(),
    company: v.optionalString(),
    subject: v.requiredString(1),
    message: v.requiredString(1),
    status: v.optionalEnum(INQUIRY_STATUSES),
    adminNotes: v.optionalString(),
  },
});

export const validateAdminInquiryIdParam: RequestHandler = validateRequest({
  params: {
    inquiryId: v.requiredObjectId(),
  },
});

export const validateAdminUpdateInquiry: RequestHandler = validateRequest({
  params: {
    inquiryId: v.requiredObjectId(),
  },
  body: {
    source: v.optionalEnum(INQUIRY_SOURCES),
    userId: v.optionalObjectId(),
    fullName: v.optionalString(),
    email: v.optionalEmail(),
    company: v.optionalString(),
    subject: v.optionalString(),
    message: v.optionalString(),
    status: v.optionalEnum(INQUIRY_STATUSES),
    adminNotes: v.optionalString(),
  },
});

export const validateAdminRunQMongo: RequestHandler = validateRequest({
  body: {
    query: v.requiredString(1),
  },
});

export const validateAdminFetchErrorLogs: RequestHandler = validateRequest({
  body: {
    logsPassword: v.requiredString(1),
    page: v.optionalPositiveInt(100),
    limit: v.optionalPositiveInt(100),
    source: v.optionalEnum(ERROR_LOG_SOURCES),
  },
});
