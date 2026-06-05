import type { Request } from "express";
import {
  ContactInquiryModel,
  JobApplicationModel,
  JobPostingModel,
} from "../database/models/index.js";
import {
  INQUIRY_SOURCES,
  INQUIRY_STATUSES,
  JOB_APPLICATION_STATUSES,
} from "../types/domain.types.js";
import { createAuditLog, getRequestIp, getRequestUserAgent } from "./audit-log.service.js";
import { AppError } from "./app-error.js";
import { getUserById } from "./user-role.service.js";
import {
  optionalEnum,
  optionalObjectId,
  optionalString,
  optionalUrl,
  parsePagination,
  requireEmail,
  requireEnum,
  requireObjectId,
  requireString,
} from "./validation.service.js";

export async function createPortalJobApplication(
  userId: string,
  payload: Record<string, unknown>,
  req: Request,
) {
  const jobPostingId = requireObjectId(payload.jobPostingId, "jobPostingId");
  const resumeUrl = optionalUrl(payload.resumeUrl, "resumeUrl");
  const coverLetter = optionalString(payload.coverLetter, "coverLetter");

  if (!resumeUrl) {
    throw new AppError("resumeUrl is required", 400, "VALIDATION_ERROR");
  }

  const jobPosting = await JobPostingModel.findOne({
    _id: jobPostingId,
    status: "published",
    deletedAt: null,
  });

  if (!jobPosting) {
    throw new AppError("Job posting not found", 404, "JOB_POSTING_NOT_FOUND");
  }

  const application = await JobApplicationModel.create({
    userId,
    jobPostingId,
    resumeUrl,
    coverLetter,
    status: "submitted",
  });

  await createAuditLog({
    actorUserId: userId,
    roleSnapshot: "external",
    action: "portal.create_job_application",
    entityType: "JobApplication",
    entityId: application.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return application;
}

export async function listPortalJobApplications(
  userId: string,
  query: Record<string, unknown>,
) {
  const pagination = parsePagination(query.page, query.limit);
  const filter: Record<string, unknown> = {
    userId,
    deletedAt: null,
  };

  if (query.status) {
    filter.status = requireEnum(query.status, "status", JOB_APPLICATION_STATUSES);
  }

  const [items, total] = await Promise.all([
    JobApplicationModel.find(filter)
      .populate("jobPostingId", "title slug status location department")
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    JobApplicationModel.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getPortalJobApplication(userId: string, applicationId: string) {
  const application = await JobApplicationModel.findOne({
    _id: requireObjectId(applicationId, "applicationId"),
    userId,
    deletedAt: null,
  })
    .populate("jobPostingId", "title slug status location department")
    .lean();

  if (!application) {
    throw new AppError("Job application not found", 404, "JOB_APPLICATION_NOT_FOUND");
  }

  return application;
}

export async function createPublicInquiry(
  payload: Record<string, unknown>,
  req: Request,
) {
  const inquiry = await ContactInquiryModel.create({
    source: "public",
    fullName: requireString(payload.fullName, "fullName"),
    email: requireEmail(payload.email),
    company: optionalString(payload.company, "company"),
    subject: requireString(payload.subject, "subject"),
    message: requireString(payload.message, "message"),
    status: "open",
  });

  await createAuditLog({
    action: "public.create_inquiry",
    entityType: "ContactInquiry",
    entityId: inquiry.id,
    roleSnapshot: "public",
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return inquiry;
}

export async function createPortalInquiry(
  userId: string,
  payload: Record<string, unknown>,
  req: Request,
) {
  const user = await getUserById(userId);
  const email =
    payload.email !== undefined ? requireEmail(payload.email) : user.email;

  const inquiry = await ContactInquiryModel.create({
    source: "portal",
    userId,
    fullName: optionalString(payload.fullName, "fullName") || user.fullName,
    email,
    company: optionalString(payload.company, "company"),
    subject: requireString(payload.subject, "subject"),
    message: requireString(payload.message, "message"),
    status: "open",
  });

  await createAuditLog({
    actorUserId: userId,
    roleSnapshot: "external",
    action: "portal.create_inquiry",
    entityType: "ContactInquiry",
    entityId: inquiry.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return inquiry;
}

export async function listPortalInquiries(
  userId: string,
  query: Record<string, unknown>,
) {
  const pagination = parsePagination(query.page, query.limit);
  const filter: Record<string, unknown> = {
    userId,
    deletedAt: null,
  };

  if (query.status) {
    filter.status = requireEnum(query.status, "status", INQUIRY_STATUSES);
  }

  const [items, total] = await Promise.all([
    ContactInquiryModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    ContactInquiryModel.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getPortalInquiry(userId: string, inquiryId: string) {
  const inquiry = await ContactInquiryModel.findOne({
    _id: requireObjectId(inquiryId, "inquiryId"),
    userId,
    deletedAt: null,
  }).lean();

  if (!inquiry) {
    throw new AppError("Inquiry not found", 404, "INQUIRY_NOT_FOUND");
  }

  return inquiry;
}

export async function listAdminJobApplications(query: Record<string, unknown>) {
  const pagination = parsePagination(query.page, query.limit);
  const filter: Record<string, unknown> = { deletedAt: null };

  if (query.status) {
    filter.status = requireEnum(query.status, "status", JOB_APPLICATION_STATUSES);
  }

  if (query.userId) {
    filter.userId = requireObjectId(query.userId, "userId");
  }

  if (query.jobPostingId) {
    filter.jobPostingId = requireObjectId(query.jobPostingId, "jobPostingId");
  }

  const [items, total] = await Promise.all([
    JobApplicationModel.find(filter)
      .populate("userId", "email fullName")
      .populate("jobPostingId", "title slug status")
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    JobApplicationModel.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getAdminJobApplication(applicationId: string) {
  const application = await JobApplicationModel.findOne({
    _id: requireObjectId(applicationId, "applicationId"),
    deletedAt: null,
  })
    .populate("userId", "email fullName userType status")
    .populate("jobPostingId", "title slug status department location")
    .lean();

  if (!application) {
    throw new AppError("Job application not found", 404, "JOB_APPLICATION_NOT_FOUND");
  }

  return application;
}

export async function createAdminJobApplication(
  payload: Record<string, unknown>,
  actorUserId: string,
  req: Request,
) {
  const application = await JobApplicationModel.create({
    userId: requireObjectId(payload.userId, "userId"),
    jobPostingId: requireObjectId(payload.jobPostingId, "jobPostingId"),
    resumeUrl: optionalUrl(payload.resumeUrl, "resumeUrl"),
    coverLetter: optionalString(payload.coverLetter, "coverLetter"),
    status:
      optionalEnum(payload.status, "status", JOB_APPLICATION_STATUSES) ?? "submitted",
    adminNotes: optionalString(payload.adminNotes, "adminNotes"),
  });

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: "admin.create_job_application",
    entityType: "JobApplication",
    entityId: application.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return application;
}

export async function updateAdminJobApplication(
  applicationId: string,
  payload: Record<string, unknown>,
  actorUserId: string,
  req: Request,
) {
  const application = await JobApplicationModel.findOne({
    _id: requireObjectId(applicationId, "applicationId"),
    deletedAt: null,
  });

  if (!application) {
    throw new AppError("Job application not found", 404, "JOB_APPLICATION_NOT_FOUND");
  }

  if (payload.resumeUrl !== undefined) {
    application.resumeUrl = optionalUrl(payload.resumeUrl, "resumeUrl");
  }
  if (payload.coverLetter !== undefined) {
    application.coverLetter = optionalString(payload.coverLetter, "coverLetter");
  }
  if (payload.status !== undefined) {
    application.status = requireEnum(payload.status, "status", JOB_APPLICATION_STATUSES);
  }
  if (payload.adminNotes !== undefined) {
    application.adminNotes = optionalString(payload.adminNotes, "adminNotes");
  }

  await application.save();

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: "admin.update_job_application",
    entityType: "JobApplication",
    entityId: application.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return application;
}

export async function archiveAdminJobApplication(
  applicationId: string,
  actorUserId: string,
  req: Request,
) {
  const application = await JobApplicationModel.findOne({
    _id: requireObjectId(applicationId, "applicationId"),
    deletedAt: null,
  });

  if (!application) {
    throw new AppError("Job application not found", 404, "JOB_APPLICATION_NOT_FOUND");
  }

  application.deletedAt = new Date();
  application.set("deletedBy", actorUserId);
  await application.save();

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: "admin.archive_job_application",
    entityType: "JobApplication",
    entityId: application.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return { success: true };
}

export async function listAdminInquiries(query: Record<string, unknown>) {
  const pagination = parsePagination(query.page, query.limit);
  const filter: Record<string, unknown> = { deletedAt: null };

  if (query.status) {
    filter.status = requireEnum(query.status, "status", INQUIRY_STATUSES);
  }

  if (query.source) {
    filter.source = requireEnum(query.source, "source", INQUIRY_SOURCES);
  }

  const searchValue = typeof query.search === "string" ? query.search.trim() : "";

  if (searchValue) {
    const regex = new RegExp(searchValue, "i");
    filter.$or = [
      { fullName: regex },
      { email: regex },
      { subject: regex },
      { message: regex },
    ];
  }

  const [items, total] = await Promise.all([
    ContactInquiryModel.find(filter)
      .populate("userId", "email fullName")
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    ContactInquiryModel.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getAdminInquiry(inquiryId: string) {
  const inquiry = await ContactInquiryModel.findOne({
    _id: requireObjectId(inquiryId, "inquiryId"),
    deletedAt: null,
  })
    .populate("userId", "email fullName")
    .lean();

  if (!inquiry) {
    throw new AppError("Inquiry not found", 404, "INQUIRY_NOT_FOUND");
  }

  return inquiry;
}

export async function createAdminInquiry(
  payload: Record<string, unknown>,
  actorUserId: string,
  req: Request,
) {
  const inquiry = await ContactInquiryModel.create({
    source: optionalEnum(payload.source, "source", INQUIRY_SOURCES) ?? "public",
    userId: optionalObjectId(payload.userId, "userId") ?? null,
    fullName: requireString(payload.fullName, "fullName"),
    email: requireEmail(payload.email),
    company: optionalString(payload.company, "company"),
    subject: requireString(payload.subject, "subject"),
    message: requireString(payload.message, "message"),
    status: optionalEnum(payload.status, "status", INQUIRY_STATUSES) ?? "open",
    adminNotes: optionalString(payload.adminNotes, "adminNotes"),
  });

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: "admin.create_inquiry",
    entityType: "ContactInquiry",
    entityId: inquiry.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return inquiry;
}

export async function updateAdminInquiry(
  inquiryId: string,
  payload: Record<string, unknown>,
  actorUserId: string,
  req: Request,
) {
  const inquiry = await ContactInquiryModel.findOne({
    _id: requireObjectId(inquiryId, "inquiryId"),
    deletedAt: null,
  });

  if (!inquiry) {
    throw new AppError("Inquiry not found", 404, "INQUIRY_NOT_FOUND");
  }

  if (payload.source !== undefined) {
    inquiry.source = requireEnum(payload.source, "source", INQUIRY_SOURCES);
  }
  if (payload.userId !== undefined) {
    inquiry.set("userId", optionalObjectId(payload.userId, "userId") ?? null);
  }
  if (payload.fullName !== undefined) {
    inquiry.fullName = requireString(payload.fullName, "fullName");
  }
  if (payload.email !== undefined) {
    inquiry.email = requireEmail(payload.email);
  }
  if (payload.company !== undefined) {
    inquiry.company = optionalString(payload.company, "company");
  }
  if (payload.subject !== undefined) {
    inquiry.subject = requireString(payload.subject, "subject");
  }
  if (payload.message !== undefined) {
    inquiry.message = requireString(payload.message, "message");
  }
  if (payload.status !== undefined) {
    inquiry.status = requireEnum(payload.status, "status", INQUIRY_STATUSES);
  }
  if (payload.adminNotes !== undefined) {
    inquiry.adminNotes = optionalString(payload.adminNotes, "adminNotes");
  }

  await inquiry.save();

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: "admin.update_inquiry",
    entityType: "ContactInquiry",
    entityId: inquiry.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return inquiry;
}

export async function archiveAdminInquiry(
  inquiryId: string,
  actorUserId: string,
  req: Request,
) {
  const inquiry = await ContactInquiryModel.findOne({
    _id: requireObjectId(inquiryId, "inquiryId"),
    deletedAt: null,
  });

  if (!inquiry) {
    throw new AppError("Inquiry not found", 404, "INQUIRY_NOT_FOUND");
  }

  inquiry.deletedAt = new Date();
  inquiry.set("deletedBy", actorUserId);
  await inquiry.save();

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: "admin.archive_inquiry",
    entityType: "ContactInquiry",
    entityId: inquiry.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return { success: true };
}
