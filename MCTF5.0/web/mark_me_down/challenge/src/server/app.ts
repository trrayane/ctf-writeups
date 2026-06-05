import express, { type Application } from "express";

import type { AppConfig } from "./config/env.js";
import { createRenderRouter } from "./routes/renderRoutes.js";

export function createApp(config: AppConfig): Application {
  const app = express();

  app.use(express.json({ limit: "8kb" }));
  app.use(express.static(config.publicDir));
  app.use(createRenderRouter(config));

  return app;
}
