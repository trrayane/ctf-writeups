import { Router, type Router as ExpressRouter } from "express";
import {
  createGetPublicContentHandler,
  createInquiry,
  createListPublicContentHandler,
} from "../controllers/public.controller.js";
import {
  validateCreatePublicInquiry,
  validateGetBySlug,
  validateListPublicArticles,
  validateListPublicJobPostings,
  validateListPublicPipelinePrograms,
  validateListPublicTeamProfiles,
} from "../middlewares/validators/public.validators.js";

const publicRouter: ExpressRouter = Router();

publicRouter.get("/articles", validateListPublicArticles, createListPublicContentHandler("articles"));
publicRouter.get("/articles/:slug", validateGetBySlug, createGetPublicContentHandler("articles"));
publicRouter.get(
  "/pipeline-programs",
  validateListPublicPipelinePrograms,
  createListPublicContentHandler("pipeline-programs"),
);
publicRouter.get(
  "/pipeline-programs/:slug",
  validateGetBySlug,
  createGetPublicContentHandler("pipeline-programs"),
);
publicRouter.get(
  "/team-profiles",
  validateListPublicTeamProfiles,
  createListPublicContentHandler("team-profiles"),
);
publicRouter.get(
  "/team-profiles/:slug",
  validateGetBySlug,
  createGetPublicContentHandler("team-profiles"),
);
publicRouter.get("/job-postings", validateListPublicJobPostings, createListPublicContentHandler("job-postings"));
publicRouter.get(
  "/job-postings/:slug",
  validateGetBySlug,
  createGetPublicContentHandler("job-postings"),
);
publicRouter.post("/inquiries", validateCreatePublicInquiry, createInquiry);

export { publicRouter };
