import fs from "node:fs";
import path from "node:path";

export function removeWorkdir(workdir: string): void {
  if (!workdir) {
    return;
  }

  try {
    fs.rmSync(workdir, { recursive: true, force: true });
  } catch {
    // Best-effort cleanup only.
  }
}

export function cleanupExpiredWorkdirs(baseDir: string, retentionMs: number): void {
  let entries: fs.Dirent[] = [];

  try {
    entries = fs.readdirSync(baseDir, { withFileTypes: true });
  } catch {
    return;
  }

  const cutoff = Date.now() - retentionMs;

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const workdir = path.join(baseDir, entry.name);

    try {
      const stats = fs.statSync(workdir);

      if (stats.mtimeMs < cutoff) {
        removeWorkdir(workdir);
      }
    } catch {
      // Best-effort cleanup only.
    }
  }
}

export function startWorkdirCleanupTimer(
  baseDir: string,
  retentionMs: number,
  cleanupIntervalMs: number,
): void {
  // Run once at boot, then on a periodic schedule.
  cleanupExpiredWorkdirs(baseDir, retentionMs);

  const timer = setInterval(() => {
    cleanupExpiredWorkdirs(baseDir, retentionMs);
  }, cleanupIntervalMs);

  timer.unref();
}
