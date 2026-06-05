import type { Request } from "express";
import {
  createAuditLog,
  getRequestIp,
  getRequestUserAgent,
} from "./audit-log.service.js";
import { getUserById, sanitizeUser } from "./user-role.service.js";
import {
  optionalString,
  optionalUrl,
  requireString,
} from "./validation.service.js";
import { da } from "@faker-js/faker/.";

export async function getPortalProfile(userId: string) {
  const user = await getUserById(userId);
  return sanitizeUser(user);
}

export async function updatePortalProfile(
  userId: string,
  payload: Record<string, unknown>,
  req: Request,
) {
  const user = await getUserById(userId);

  for (const key of Object.keys(payload)) {
    const value = payload[key];

    const k= key as keyof typeof user
    user[k] = value as never;
  }


  // if (payload.fullName !== undefined) {
  //   user.fullName = requireString(payload.fullName, "fullName");
  // }
  // if (payload.phoneNumber !== undefined) {
  //   user.phoneNumber = optionalString(payload.phoneNumber, "phoneNumber");
  // }
  // if (payload.title !== undefined) {
  //   user.title = optionalString(payload.title, "title");
  // }
  // if (payload.avatarUrl !== undefined) {
  //   user.avatarUrl = optionalUrl(payload.avatarUrl, "avatarUrl");
  // }


  await user.save();

  await createAuditLog({
    actorUserId: user.id,
    roleSnapshot: "external",
    action: "portal.update_profile",
    entityType: "User",
    entityId: user.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return sanitizeUser(user);
}
