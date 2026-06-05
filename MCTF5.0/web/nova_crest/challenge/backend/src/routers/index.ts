import { Router, type Router as ExpressRouter } from "express";
import type { QMongo } from "../tools/QMongo/index.js";
import { createAdminRouter } from "./admin.router.js";
import { authRouter } from "./auth.router.js";
import { portalRouter } from "./portal.router.js";
import { publicRouter } from "./public.router.js";
import { staffRouter } from "./staff.router.js";

export function createApiRouter(qmongo: QMongo): ExpressRouter {
  const router: ExpressRouter = Router();

  router.use("/auth", authRouter);
  router.use("/public", publicRouter);
  router.use("/portal", portalRouter);
  router.use("/staff", staffRouter);
  router.use("/admin", createAdminRouter(qmongo));

  return router;
}
