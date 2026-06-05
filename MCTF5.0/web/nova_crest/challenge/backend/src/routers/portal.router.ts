import { Router, type Router as ExpressRouter } from "express";
import {
  createInquiry,
  createJobApplication,
  getInquiry,
  getJobApplication,
  getProfile,
  getPortalSummary,
  listInquiries,
  listJobApplications,
  updateProfile,
} from "../controllers/portal.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/rbac.middleware.js";
import {
  validateCreatePortalInquiry,
  validateCreatePortalJobApplication,
  validateGetPortalInquiry,
  validateGetPortalJobApplication,
  validateListPortalInquiries,
  validateListPortalJobApplications,
  validatePortalProfileUpdate,
} from "../middlewares/validators/portal.validators.js";

const portalRouter: ExpressRouter = Router();

portalRouter.use(requireAuth, requireRoles("external"));

portalRouter.get("/dashboard-summary", getPortalSummary);
portalRouter.get("/profile", getProfile);
portalRouter.patch("/profile", validatePortalProfileUpdate, updateProfile);

portalRouter.post("/job-applications", validateCreatePortalJobApplication, createJobApplication);
portalRouter.get("/job-applications", validateListPortalJobApplications, listJobApplications);
portalRouter.get("/job-applications/:applicationId", validateGetPortalJobApplication, getJobApplication);

portalRouter.post("/inquiries", validateCreatePortalInquiry, createInquiry);
portalRouter.get("/inquiries", validateListPortalInquiries, listInquiries);
portalRouter.get("/inquiries/:inquiryId", validateGetPortalInquiry, getInquiry);

export { portalRouter };
