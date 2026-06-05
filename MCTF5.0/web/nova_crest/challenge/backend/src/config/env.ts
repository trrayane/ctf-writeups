import dotenv from "dotenv";

dotenv.config();

function readString(value: string | undefined, fallback: string): string {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function readNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

export const env = {
  nodeEnv: readString(process.env.NODE_ENV, "development"),
  port: readNumber(process.env.PORT, 8000),
  mongoUri: readString(
    process.env.MONGO_URI,
    "mongodb://localhost:27017/novacrest_enterprise",
  ),
  appUrl: readString(process.env.APP_URL, "http://localhost:8000"),
  frontendUrl: readString(process.env.FRONTEND_URL, "http://localhost:5173"),
  jwtAccessSecret: readString(
    process.env.JWT_ACCESS_SECRET,
    "novacrest-access-secret-dev",
  ),
  jwtRefreshSecret: readString(
    process.env.JWT_REFRESH_SECRET,
    "novacrest-refresh-secret-dev",
  ),
  jwtAccessTtl: readString(process.env.JWT_ACCESS_TTL, "15m"),
  jwtRefreshTtl: readString(process.env.JWT_REFRESH_TTL, "7d"),
  seedAdminEmail: readString(
    process.env.SEED_ADMIN_EMAIL,
    "admin@novacrest-bio.com",
  ),
  seedAdminPassword: readString(
    process.env.SEED_ADMIN_PASSWORD,
    "ChangeMeNow!123",
  ),
  seedAdminLogsPassword: readString(
    process.env.SEED_ADMIN_LOGS_PASSWORD,
    "ChangeLogsNow!123",
  ),
  seedAdminLogsEnabled: readBoolean(
    process.env.SEED_ADMIN_LOGS_ENABLED,
    true,
  ),
  seedAdminName: readString(
    process.env.SEED_ADMIN_NAME,
    "NovaCrest Administrator",
  ),
  seedFakerSeed: readNumber(process.env.SEED_FAKER_SEED, 1337),
};
