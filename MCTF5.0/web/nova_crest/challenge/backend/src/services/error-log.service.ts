import type { Request } from "express";
import { ErrorLogModel } from "../database/models/index.js";

const SENSITIVE_KEY_PATTERN = /(password|token|authorization|cookie|secret)/i;
const MAX_TEXT_LENGTH = 8_000;

type ErrorLogCategory =
  | "internal_server_error"
  | "handled_request_error"
  | "duplicate_key"
  | "uncaught_exception"
  | "unhandled_rejection"
  | "startup_failure";

function truncateText(value: string): string {
  if (value.length <= MAX_TEXT_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_TEXT_LENGTH)}...`;
}

function toSafeText(value: unknown, fallback = "Unknown error"): string {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized ? truncateText(normalized) : fallback;
  }

  if (value instanceof Error) {
    return truncateText(value.message || fallback);
  }

  try {
    const serialized = JSON.stringify(value);
    return serialized ? truncateText(serialized) : fallback;
  } catch {
    return fallback;
  }
}

function toSafeStack(value: unknown): string {
  if (value instanceof Error && typeof value.stack === "string") {
    return truncateText(value.stack);
  }

  return "";
}

function sanitizeForLog(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.slice(0, 50).map((entry) => sanitizeForLog(entry));
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};

    Object.entries(value as Record<string, unknown>)
      .slice(0, 50)
      .forEach(([key, entry]) => {
        if (SENSITIVE_KEY_PATTERN.test(key)) {
          result[key] = "[REDACTED]";
          return;
        }

        result[key] = sanitizeForLog(entry);
      });

    return result;
  }

  if (typeof value === "string") {
    return truncateText(value);
  }

  return value;
}

export async function persistExpressError(
  error: unknown,
  req: Request,
  options?: {
    category?: "internal_server_error" | "handled_request_error" | "duplicate_key";
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await ErrorLogModel.create({
    source: "express",
    category: options?.category ?? "internal_server_error",
    message: toSafeText(error),
    stack: toSafeStack(error),
    method: req.method,
    route: req.originalUrl,
    metadata: sanitizeForLog({
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || "",
      actorUserId: req.auth?.userId || null,
      ...(options?.metadata ?? {}),
    }),
  });
}

export async function persistProcessError(
  category: Exclude<ErrorLogCategory, "internal_server_error">,
  error: unknown,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await ErrorLogModel.create({
    source: "process",
    category,
    message: toSafeText(error),
    stack: toSafeStack(error),
    metadata: sanitizeForLog(metadata ?? {}),
  });
}

export function toPublicErrorLogMetadata(metadata: unknown): unknown {
  return sanitizeForLog(metadata);
}