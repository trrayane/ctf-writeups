import type { Request } from "express";
import { AuditLogModel } from "../database/models/audit-log.model.js";

export interface AuditLogInput {
  actorUserId?: string | null;
  roleSnapshot?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  method: string;
  route: string;
  ipAddress?: string;
  userAgent?: string;
}

export function getRequestIp(req: Request): string {
  if (typeof req.ip === "string" && req.ip.length > 0) {
    return req.ip;
  }

  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0]?.trim() ?? "";
  }

  return "";
}

export function getRequestUserAgent(req: Request): string {
  const userAgent = req.headers["user-agent"];
  return typeof userAgent === "string" ? userAgent : "";
}

export async function createAuditLog(input: AuditLogInput): Promise<void> {
  await AuditLogModel.create({
    actorUserId: input.actorUserId ?? null,
    roleSnapshot: input.roleSnapshot ?? "public",
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? "",
    metadata: input.metadata ?? {},
    method: input.method,
    route: input.route,
    ipAddress: input.ipAddress ?? "",
    userAgent: input.userAgent ?? "",
  });
}
