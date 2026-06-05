import { Router, type Router as ExpressRouter } from "express";
import type { QMongo } from "../tools/QMongo/index.js";
import {
  archiveInquiryController,
  archiveJobApplicationController,
  archiveRoleController,
  archiveUserController,
  createArchiveAdminContentHandler,
  createCreateAdminContentHandler,
  createGetAdminContentHandler,
  createInquiryController,
  createJobApplicationController,
  createListErrorLogsController,
  createListAdminContentHandler,
  createRoleController,
  createRunQMongoController,
  createStaffAccountController,
  createUpdateAdminContentHandler,
  getAuditLogController,
  getAdminSummaryController,
  getInquiryController,
  getJobApplicationController,
  getRoleDetailController,
  getSessionDetailController,
  getUserDetailController,
  listAuditLogsController,
  listInquiriesController,
  listJobApplicationsController,
  listRolesController,
  listSessionsController,
  listUsersController,
  revokeSessionController,
  updateInquiryController,
  updateJobApplicationController,
  updateRoleController,
  updateUserController,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/rbac.middleware.js";
import {
  validateAdminAuditLogIdParam,
  validateAdminContentIdParam,
  validateAdminCreateArticle,
  validateAdminCreateInquiry,
  validateAdminCreateJobApplication,
  validateAdminCreateJobPosting,
  validateAdminCreatePipelineProgram,
  validateAdminCreateRole,
  validateAdminCreateStaffUser,
  validateAdminFetchErrorLogs,
  validateAdminCreateTeamProfile,
  validateAdminInquiryIdParam,
  validateAdminJobApplicationIdParam,
  validateAdminListArticles,
  validateAdminListAuditLogs,
  validateAdminListInquiries,
  validateAdminListJobApplications,
  validateAdminListJobPostings,
  validateAdminListPipelinePrograms,
  validateAdminListRoles,
  validateAdminListSessions,
  validateAdminListTeamProfiles,
  validateAdminListUsers,
  validateAdminRoleIdParam,
  validateAdminRunQMongo,
  validateAdminSessionIdParam,
  validateAdminUpdateArticle,
  validateAdminUpdateInquiry,
  validateAdminUpdateJobApplication,
  validateAdminUpdateJobPosting,
  validateAdminUpdatePipelineProgram,
  validateAdminUpdateRole,
  validateAdminUpdateTeamProfile,
  validateAdminUpdateUser,
  validateAdminUserIdParam,
} from "../middlewares/validators/admin.validators.js";

export function createAdminRouter(qmongo: QMongo): ExpressRouter {
  const adminRouter: ExpressRouter = Router();

  adminRouter.use(requireAuth, requireRoles("admin"));

  adminRouter.get("/dashboard-summary", getAdminSummaryController);

  adminRouter.get("/users", validateAdminListUsers, listUsersController);
  adminRouter.post("/users/staff", validateAdminCreateStaffUser, createStaffAccountController);
  adminRouter.get("/users/:userId", validateAdminUserIdParam, getUserDetailController);
  adminRouter.patch("/users/:userId", validateAdminUpdateUser, updateUserController);
  adminRouter.delete("/users/:userId", validateAdminUserIdParam, archiveUserController);

  adminRouter.get("/roles", validateAdminListRoles, listRolesController);
  adminRouter.post("/roles", validateAdminCreateRole, createRoleController);
  adminRouter.get("/roles/:roleId", validateAdminRoleIdParam, getRoleDetailController);
  adminRouter.patch("/roles/:roleId", validateAdminUpdateRole, updateRoleController);
  adminRouter.delete("/roles/:roleId", validateAdminRoleIdParam, archiveRoleController);

  adminRouter.get("/sessions", validateAdminListSessions, listSessionsController);
  adminRouter.get("/sessions/:sessionId", validateAdminSessionIdParam, getSessionDetailController);
  adminRouter.delete("/sessions/:sessionId", validateAdminSessionIdParam, revokeSessionController);

  adminRouter.get("/audit-logs", validateAdminListAuditLogs, listAuditLogsController);
  adminRouter.get("/audit-logs/:auditLogId", validateAdminAuditLogIdParam, getAuditLogController);
  adminRouter.post("/error-logs/fetch", validateAdminFetchErrorLogs, createListErrorLogsController);

  adminRouter.get("/articles", validateAdminListArticles, createListAdminContentHandler("articles"));
  adminRouter.post("/articles", validateAdminCreateArticle, createCreateAdminContentHandler("articles"));
  adminRouter.get("/articles/:id", validateAdminContentIdParam, createGetAdminContentHandler("articles"));
  adminRouter.patch("/articles/:id", validateAdminUpdateArticle, createUpdateAdminContentHandler("articles"));
  adminRouter.delete("/articles/:id", validateAdminContentIdParam, createArchiveAdminContentHandler("articles"));

  adminRouter.get(
    "/pipeline-programs",
    validateAdminListPipelinePrograms,
    createListAdminContentHandler("pipeline-programs"),
  );
  adminRouter.post(
    "/pipeline-programs",
    validateAdminCreatePipelineProgram,
    createCreateAdminContentHandler("pipeline-programs"),
  );
  adminRouter.get(
    "/pipeline-programs/:id",
    validateAdminContentIdParam,
    createGetAdminContentHandler("pipeline-programs"),
  );
  adminRouter.patch(
    "/pipeline-programs/:id",
    validateAdminUpdatePipelineProgram,
    createUpdateAdminContentHandler("pipeline-programs"),
  );
  adminRouter.delete(
    "/pipeline-programs/:id",
    validateAdminContentIdParam,
    createArchiveAdminContentHandler("pipeline-programs"),
  );

  adminRouter.get("/team-profiles", validateAdminListTeamProfiles, createListAdminContentHandler("team-profiles"));
  adminRouter.post("/team-profiles", validateAdminCreateTeamProfile, createCreateAdminContentHandler("team-profiles"));
  adminRouter.get("/team-profiles/:id", validateAdminContentIdParam, createGetAdminContentHandler("team-profiles"));
  adminRouter.patch(
    "/team-profiles/:id",
    validateAdminUpdateTeamProfile,
    createUpdateAdminContentHandler("team-profiles"),
  );
  adminRouter.delete(
    "/team-profiles/:id",
    validateAdminContentIdParam,
    createArchiveAdminContentHandler("team-profiles"),
  );

  adminRouter.get("/job-postings", validateAdminListJobPostings, createListAdminContentHandler("job-postings"));
  adminRouter.post("/job-postings", validateAdminCreateJobPosting, createCreateAdminContentHandler("job-postings"));
  adminRouter.get("/job-postings/:id", validateAdminContentIdParam, createGetAdminContentHandler("job-postings"));
  adminRouter.patch(
    "/job-postings/:id",
    validateAdminUpdateJobPosting,
    createUpdateAdminContentHandler("job-postings"),
  );
  adminRouter.delete(
    "/job-postings/:id",
    validateAdminContentIdParam,
    createArchiveAdminContentHandler("job-postings"),
  );

  adminRouter.get("/job-applications", validateAdminListJobApplications, listJobApplicationsController);
  adminRouter.post("/job-applications", validateAdminCreateJobApplication, createJobApplicationController);
  adminRouter.get("/job-applications/:applicationId", validateAdminJobApplicationIdParam, getJobApplicationController);
  adminRouter.patch("/job-applications/:applicationId", validateAdminUpdateJobApplication, updateJobApplicationController);
  adminRouter.delete(
    "/job-applications/:applicationId",
    validateAdminJobApplicationIdParam,
    archiveJobApplicationController,
  );

  adminRouter.get("/inquiries", validateAdminListInquiries, listInquiriesController);
  adminRouter.post("/inquiries", validateAdminCreateInquiry, createInquiryController);
  adminRouter.get("/inquiries/:inquiryId", validateAdminInquiryIdParam, getInquiryController);
  adminRouter.patch("/inquiries/:inquiryId", validateAdminUpdateInquiry, updateInquiryController);
  adminRouter.delete("/inquiries/:inquiryId", validateAdminInquiryIdParam, archiveInquiryController);

  adminRouter.post("/qmongo/run", validateAdminRunQMongo, createRunQMongoController(qmongo));

  return adminRouter;
}
