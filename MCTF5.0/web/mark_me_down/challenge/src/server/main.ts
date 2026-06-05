import fs from "node:fs";

import { createApp } from "./app.js";
import { loadConfig } from "./config/env.js";
import { startWorkdirCleanupTimer } from "./services/workdirCleanup.js";

const config = loadConfig();

fs.mkdirSync(config.renderOutputDir, { recursive: true });

startWorkdirCleanupTimer(config.renderOutputDir, config.fileTtlMs, config.cleanupIntervalMs);

const app = createApp(config);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Serving static files from ${config.publicDir}`);
});
