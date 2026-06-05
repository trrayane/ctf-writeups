import type { RequestHandler } from "express";
import { INQUIRY_STATUSES, JOB_APPLICATION_STATUSES } from "../../types/domain.types.js";
import { validateRequest, validators as v } from "./common.js";

export const validatePortalProfileUpdate: RequestHandler = validateRequest({
  body: {
    fullName: v.optionalString(),
    phoneNumber: v.optionalString(),
    title: v.optionalString(),
    avatarUrl: v.optionalUrl(),
  },
});

export const validateCreatePortalJobApplication: RequestHandler = validateRequest({
  body: {
    jobPostingId: v.requiredObjectId(),
    resumeUrl: v.requiredUrl(),
    coverLetter: v.optionalString(),
  },
});

export const validateListPortalJobApplications: RequestHandler = validateRequest({
  query: {
    page: v.optionalPositiveInt(100),
    limit: v.optionalPositiveInt(100),
    status: v.optionalEnum(JOB_APPLICATION_STATUSES),
  },
});

export const validateGetPortalJobApplication: RequestHandler = validateRequest({
  params: {
    applicationId: v.requiredObjectId(),
  },
});

export const validateCreatePortalInquiry: RequestHandler = validateRequest({
  body: {
    fullName: v.optionalString(),
    email: v.optionalEmail(),
    company: v.optionalString(),
    subject: v.requiredString(1),
    message: v.requiredString(1),
  },
});

export const validateListPortalInquiries: RequestHandler = validateRequest({
  query: {
    page: v.optionalPositiveInt(100),
    limit: v.optionalPositiveInt(100),
    status: v.optionalEnum(INQUIRY_STATUSES),
  },
});

export const validateGetPortalInquiry: RequestHandler = validateRequest({
  params: {
    inquiryId: v.requiredObjectId(),
  },
});
