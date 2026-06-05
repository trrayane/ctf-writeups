import { Router } from "express";

import type { AppConfig } from "../config/env.js";
import { createRenderController } from "../controllers/renderController.js";

export function createRenderRouter(config: AppConfig): Router {
  const router = Router();
  const renderController = createRenderController(config);

  router.post("/markdown/render", renderController);
  router.post("/api/markdown/render", renderController);

  return router;
}
