import path from "node:path";

import { parsePositiveInt } from "../utils/number.js";

const DEFAULT_PORT = 3000;
const DEFAULT_TEMP_DIR = path.resolve(process.cwd(), "tmp", "latex");
const DEFAULT_RETENTION_MINUTES = 30;
const DEFAULT_CLEANUP_INTERVAL_MINUTES = 30;
const DEFAULT_RENDER_URL_PREFIX = "/renders";

export interface AppConfig {
  port: number;
  publicDir: string;
  renderOutputDir: string;
  renderUrlPrefix: string;
  fileTtlMs: number;
  cleanupIntervalMs: number;
}

export function loadConfig(): AppConfig {
  // Normalizing here avoids duplicated slash handling across response builders.
  const renderUrlPrefix = (process.env.RENDER_URL_PREFIX || DEFAULT_RENDER_URL_PREFIX).replace(/\/+$/, "");

  return {
    port: parsePositiveInt(process.env.PORT, DEFAULT_PORT),
    publicDir: path.resolve(process.cwd(), "public"),
    renderOutputDir: process.env.RENDER_OUTPUT_DIR || DEFAULT_TEMP_DIR,
    renderUrlPrefix,
    fileTtlMs: parsePositiveInt(process.env.FILE_TTL_MINUTES, DEFAULT_RETENTION_MINUTES) * 60 * 1000,
    cleanupIntervalMs:
      parsePositiveInt(process.env.CLEANUP_INTERVAL_MINUTES, DEFAULT_CLEANUP_INTERVAL_MINUTES) * 60 * 1000,
  };
}
