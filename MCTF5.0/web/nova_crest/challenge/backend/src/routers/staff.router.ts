import { Router, type Router as ExpressRouter } from "express";
import {
  createGetStaffContentHandler,
  createListStaffContentHandler,
  getStaffSummary,
} from "../controllers/staff.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRoles } from "../middlewares/rbac.middleware.js";
import {
  validateStaffGetContentById,
  validateStaffListContent,
} from "../middlewares/validators/staff.validators.js";

const staffRouter: ExpressRouter = Router();

staffRouter.use(requireAuth, requireRoles("staff", "admin"));

staffRouter.get("/dashboard-summary", getStaffSummary);
staffRouter.get("/articles", validateStaffListContent, createListStaffContentHandler("articles"));
staffRouter.get("/articles/:id", validateStaffGetContentById, createGetStaffContentHandler("articles"));
staffRouter.get(
  "/pipeline-programs",
  validateStaffListContent,
  createListStaffContentHandler("pipeline-programs"),
);
staffRouter.get(
  "/pipeline-programs/:id",
  validateStaffGetContentById,
  createGetStaffContentHandler("pipeline-programs"),
);
staffRouter.get("/team-profiles", validateStaffListContent, createListStaffContentHandler("team-profiles"));
staffRouter.get("/team-profiles/:id", validateStaffGetContentById, createGetStaffContentHandler("team-profiles"));
staffRouter.get("/job-postings", validateStaffListContent, createListStaffContentHandler("job-postings"));
staffRouter.get("/job-postings/:id", validateStaffGetContentById, createGetStaffContentHandler("job-postings"));

export { staffRouter };
