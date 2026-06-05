import type { Request, Response } from "express";
import type { QMongo } from "../tools/QMongo/index.js";
import { AppError } from "../services/app-error.js";
import { getAdminDashboardSummary } from "../services/dashboard.service.js";
import {
  archiveRole,
  archiveUser,
  listErrorLogs,
  createRole,
  getAuditLog,
  getRoleDetail,
  getSessionDetail,
  getUserDetail,
  listAuditLogs,
  listRoles,
  listSessions,
  listUsers,
  revokeAdminSession,
  runAdminQMongo,
  updateRole,
  updateUserByAdmin,
} from "../services/admin.service.js";
import { createStaffAccount } from "../services/auth.service.js";
import {
  archiveAdminContent,
  createAdminContent,
  getAdminContentById,
  listAdminContent,
  type CmsResourceKey,
  updateAdminContent,
} from "../services/content.service.js";
import {
  archiveAdminInquiry,
  archiveAdminJobApplication,
  createAdminInquiry,
  createAdminJobApplication,
  getAdminInquiry,
  getAdminJobApplication,
  listAdminInquiries,
  listAdminJobApplications,
  updateAdminInquiry,
  updateAdminJobApplication,
} from "../services/workflow.service.js";

function getBody(req: Request): Record<string, unknown> {
  return (req.body ?? {}) as Record<string, unknown>;
}

function getQuery(req: Request): Record<string, unknown> {
  return req.query as Record<string, unknown>;
}

function getParam(req: Request, key: string): string {
  const value = req.params[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function requireActorUserId(req: Request): string {
  if (!req.auth?.userId) {
    throw new AppError("Authentication is required", 401, "UNAUTHORIZED");
  }

  return req.auth.userId;
}

export async function listUsersController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await listUsers(getQuery(req));
  res.json(result);
}

export async function getAdminSummaryController(
  _req: Request,
  res: Response,
): Promise<void> {
  const summary = await getAdminDashboardSummary();
  res.json({ summary });
}

export async function createStaffAccountController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await createStaffAccount(
    getBody(req),
    req,
    requireActorUserId(req),
  );
  res.status(201).json(result);
}

export async function getUserDetailController(
  req: Request,
  res: Response,
): Promise<void> {
  const user = await getUserDetail(getParam(req, "userId"));
  res.json({ user });
}

export async function updateUserController(
  req: Request,
  res: Response,
): Promise<void> {
  const user = await updateUserByAdmin(
    getParam(req, "userId"),
    getBody(req),
    requireActorUserId(req),
    req,
  );
  res.json({ user });
}

export async function archiveUserController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await archiveUser(getParam(req, "userId"), requireActorUserId(req), req);
  res.json(result);
}

export async function listRolesController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await listRoles(getQuery(req));
  res.json(result);
}

export async function createRoleController(
  req: Request,
  res: Response,
): Promise<void> {
  const role = await createRole(getBody(req), requireActorUserId(req), req);
  res.status(201).json({ role });
}

export async function getRoleDetailController(
  req: Request,
  res: Response,
): Promise<void> {
  const role = await getRoleDetail(getParam(req, "roleId"));
  res.json({ role });
}

export async function updateRoleController(
  req: Request,
  res: Response,
): Promise<void> {
  const role = await updateRole(
    getParam(req, "roleId"),
    getBody(req),
    requireActorUserId(req),
    req,
  );
  res.json({ role });
}

export async function archiveRoleController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await archiveRole(getParam(req, "roleId"), requireActorUserId(req), req);
  res.json(result);
}

export async function listSessionsController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await listSessions(getQuery(req));
  res.json(result);
}

export async function getSessionDetailController(
  req: Request,
  res: Response,
): Promise<void> {
  const session = await getSessionDetail(getParam(req, "sessionId"));
  res.json({ session });
}

export async function revokeSessionController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await revokeAdminSession(
    getParam(req, "sessionId"),
    requireActorUserId(req),
    req,
  );
  res.json(result);
}

export async function listAuditLogsController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await listAuditLogs(getQuery(req));
  res.json(result);
}

export async function getAuditLogController(
  req: Request,
  res: Response,
): Promise<void> {
  const auditLog = await getAuditLog(getParam(req, "auditLogId"));
  res.json({ auditLog });
}

export function createListAdminContentHandler(resource: CmsResourceKey) {
  return async function listAdminContentHandler(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await listAdminContent(resource, getQuery(req));
    res.json(result);
  };
}

export function createGetAdminContentHandler(resource: CmsResourceKey) {
  return async function getAdminContentHandler(
    req: Request,
    res: Response,
  ): Promise<void> {
    const item = await getAdminContentById(resource, getParam(req, "id"));
    res.json({ item });
  };
}

export function createCreateAdminContentHandler(resource: CmsResourceKey) {
  return async function createAdminContentHandler(
    req: Request,
    res: Response,
  ): Promise<void> {
    const item = await createAdminContent(
      resource,
      getBody(req),
      requireActorUserId(req),
      req,
    );
    res.status(201).json({ item });
  };
}

export function createUpdateAdminContentHandler(resource: CmsResourceKey) {
  return async function updateAdminContentHandler(
    req: Request,
    res: Response,
  ): Promise<void> {
    const item = await updateAdminContent(
      resource,
      getParam(req, "id"),
      getBody(req),
      requireActorUserId(req),
      req,
    );
    res.json({ item });
  };
}

export function createArchiveAdminContentHandler(resource: CmsResourceKey) {
  return async function archiveAdminContentHandler(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await archiveAdminContent(
      resource,
      getParam(req, "id"),
      requireActorUserId(req),
      req,
    );
    res.json(result);
  };
}

export async function listJobApplicationsController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await listAdminJobApplications(getQuery(req));
  res.json(result);
}

export async function createJobApplicationController(
  req: Request,
  res: Response,
): Promise<void> {
  const application = await createAdminJobApplication(
    getBody(req),
    requireActorUserId(req),
    req,
  );
  res.status(201).json({ application });
}

export async function getJobApplicationController(
  req: Request,
  res: Response,
): Promise<void> {
  const application = await getAdminJobApplication(getParam(req, "applicationId"));
  res.json({ application });
}

export async function updateJobApplicationController(
  req: Request,
  res: Response,
): Promise<void> {
  const application = await updateAdminJobApplication(
    getParam(req, "applicationId"),
    getBody(req),
    requireActorUserId(req),
    req,
  );
  res.json({ application });
}

export async function archiveJobApplicationController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await archiveAdminJobApplication(
    getParam(req, "applicationId"),
    requireActorUserId(req),
    req,
  );
  res.json(result);
}

export async function listInquiriesController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await listAdminInquiries(getQuery(req));
  res.json(result);
}

export async function createInquiryController(
  req: Request,
  res: Response,
): Promise<void> {
  const inquiry = await createAdminInquiry(
    getBody(req),
    requireActorUserId(req),
    req,
  );
  res.status(201).json({ inquiry });
}

export async function getInquiryController(
  req: Request,
  res: Response,
): Promise<void> {
  const inquiry = await getAdminInquiry(getParam(req, "inquiryId"));
  res.json({ inquiry });
}

export async function updateInquiryController(
  req: Request,
  res: Response,
): Promise<void> {
  const inquiry = await updateAdminInquiry(
    getParam(req, "inquiryId"),
    getBody(req),
    requireActorUserId(req),
    req,
  );
  res.json({ inquiry });
}

export async function archiveInquiryController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await archiveAdminInquiry(
    getParam(req, "inquiryId"),
    requireActorUserId(req),
    req,
  );
  res.json(result);
}

export function createRunQMongoController(qmongo: QMongo) {
  return async function runQMongoController(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await runAdminQMongo(
      qmongo,
      getBody(req),
      requireActorUserId(req),
      req,
    );
    res.json(result);
  };
}

export async function createListErrorLogsController(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await listErrorLogs(
    getBody(req),
    requireActorUserId(req),
    req,
  );
  res.json(result);
}
