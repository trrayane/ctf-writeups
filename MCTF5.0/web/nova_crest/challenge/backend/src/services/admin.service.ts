import type { Request } from "express";
import { QMongo } from "../tools/QMongo/index.js";
import {
  AuditLogModel,
  ErrorLogModel,
  RoleModel,
  SessionModel,
  UserModel,
} from "../database/models/index.js";
import { createAuditLog, getRequestIp, getRequestUserAgent } from "./audit-log.service.js";
import { AppError } from "./app-error.js";
import { revokeSessionById } from "./auth.service.js";
import { verifyPassword } from "./crypto.service.js";
import { toPublicErrorLogMetadata } from "./error-log.service.js";
import { getRoleByCode, getRoleById, getUserById, sanitizeUser } from "./user-role.service.js";
import {
  optionalBoolean,
  optionalEnum,
  optionalObjectId,
  optionalString,
  optionalUrl,
  parsePagination,
  requireEmail,
  requireObjectId,
  requireString,
} from "./validation.service.js";
import { USER_STATUSES, USER_TYPES } from "../types/domain.types.js";

export async function listUsers(query: Record<string, unknown>) {
  const pagination = parsePagination(query.page, query.limit);
  const filter: Record<string, unknown> = { deletedAt: null };

  if (query.userType) {
    filter.userType = optionalEnum(query.userType, "userType", USER_TYPES);
  }

  if (query.status) {
    filter.status = optionalEnum(query.status, "status", USER_STATUSES);
  }

  if (query.roleId) {
    filter.roleId = requireString(query.roleId, "roleId");
  }

  const searchValue = typeof query.search === "string" ? query.search.trim() : "";

  if (searchValue) {
    const regex = new RegExp(searchValue, "i");
    filter.$or = [{ email: regex }, { fullName: regex }, { title: regex }];
  }

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    UserModel.countDocuments(filter),
  ]);

  const items = await Promise.all(users.map((user) => sanitizeUser(user)));

  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getUserDetail(userId: string) {
  const user = await UserModel.findOne({
    _id: requireObjectId(userId, "userId"),
    deletedAt: null,
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return sanitizeUser(user);
}

export async function updateUserByAdmin(
  userId: string,
  payload: Record<string, unknown>,
  actorUserId: string,
  req: Request,
) {
  const user = await getUserById(userId);

  if (payload.email !== undefined) {
    user.email = requireEmail(payload.email);
  }
  if (payload.fullName !== undefined) {
    user.fullName = requireString(payload.fullName, "fullName");
  }
  if (payload.phoneNumber !== undefined) {
    user.phoneNumber = optionalString(payload.phoneNumber, "phoneNumber");
  }
  if (payload.title !== undefined) {
    user.title = optionalString(payload.title, "title");
  }
  if (payload.avatarUrl !== undefined) {
    user.avatarUrl = optionalUrl(payload.avatarUrl, "avatarUrl");
  }
  if (payload.status !== undefined) {
    user.status =
      optionalEnum(payload.status, "status", USER_STATUSES) ?? user.status;
  }
  if (payload.userType !== undefined) {
    user.userType =
      optionalEnum(payload.userType, "userType", USER_TYPES) ?? user.userType;
  }
  if (payload.roleCode !== undefined) {
    const role = await getRoleByCode(requireString(payload.roleCode, "roleCode"));
    user.roleId = role.id;
  }
  if (payload.roleId !== undefined) {
    const role = await getRoleById(requireString(payload.roleId, "roleId"));
    user.roleId = role.id;
  }
  if (payload.mustSetPassword !== undefined) {
    user.mustSetPassword =
      optionalBoolean(payload.mustSetPassword, "mustSetPassword") ?? false;
  }

  await user.save();

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: "admin.update_user",
    entityType: "User",
    entityId: user.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return sanitizeUser(user);
}

export async function archiveUser(
  userId: string,
  actorUserId: string,
  req: Request,
) {
  const user = await getUserById(userId);
  user.status = "archived";
  user.deletedAt = new Date();
  user.set("deletedBy", actorUserId);
  await user.save();

  await SessionModel.updateMany(
    { userId: user._id, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: "admin.archive_user",
    entityType: "User",
    entityId: user.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return { success: true };
}

export async function listRoles(query: Record<string, unknown>) {
  const pagination = parsePagination(query.page, query.limit);
  const filter: Record<string, unknown> = { deletedAt: null };
  const searchValue = typeof query.search === "string" ? query.search.trim() : "";

  if (searchValue) {
    const regex = new RegExp(searchValue, "i");
    filter.$or = [{ code: regex }, { name: regex }, { description: regex }];
  }

  const [items, total] = await Promise.all([
    RoleModel.find(filter)
      .sort({ isSystem: -1, createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    RoleModel.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getRoleDetail(roleId: string) {
  const role = await RoleModel.findOne({
    _id: requireString(roleId, "roleId"),
    deletedAt: null,
  }).lean();

  if (!role) {
    throw new AppError("Role not found", 404, "ROLE_NOT_FOUND");
  }

  return role;
}

export async function createRole(
  payload: Record<string, unknown>,
  actorUserId: string,
  req: Request,
) {
  const role = await RoleModel.create({
    code: requireString(payload.code, "code").toLowerCase(),
    name: requireString(payload.name, "name"),
    description: optionalString(payload.description, "description"),
    isSystem: false,
  });

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: "admin.create_role",
    entityType: "Role",
    entityId: role.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return role;
}

export async function updateRole(
  roleId: string,
  payload: Record<string, unknown>,
  actorUserId: string,
  req: Request,
) {
  const role = await getRoleById(requireString(roleId, "roleId"));

  if (payload.code !== undefined && !role.isSystem) {
    role.code = requireString(payload.code, "code").toLowerCase();
  }
  if (payload.name !== undefined) {
    role.name = requireString(payload.name, "name");
  }
  if (payload.description !== undefined) {
    role.description = optionalString(payload.description, "description");
  }

  await role.save();

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: "admin.update_role",
    entityType: "Role",
    entityId: role.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return role;
}

export async function archiveRole(
  roleId: string,
  actorUserId: string,
  req: Request,
) {
  const role = await getRoleById(requireString(roleId, "roleId"));

  if (role.isSystem) {
    throw new AppError("System roles cannot be archived", 400, "ROLE_PROTECTED");
  }

  const usersUsingRole = await UserModel.countDocuments({
    roleId: role.id,
    deletedAt: null,
  });

  if (usersUsingRole > 0) {
    throw new AppError(
      "This role is still assigned to users",
      400,
      "ROLE_IN_USE",
    );
  }

  role.deletedAt = new Date();
  role.set("deletedBy", actorUserId);
  await role.save();

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: "admin.archive_role",
    entityType: "Role",
    entityId: role.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return { success: true };
}

export async function listSessions(query: Record<string, unknown>) {
  const pagination = parsePagination(query.page, query.limit);
  const filter: Record<string, unknown> = {};

  if (query.userId) {
    filter.userId = requireObjectId(query.userId, "userId");
  }

  if (query.revoked === "true") {
    filter.revokedAt = { $ne: null };
  } else if (query.revoked === "false") {
    filter.revokedAt = null;
  }

  const [items, total] = await Promise.all([
    SessionModel.find(filter)
      .select("-refreshTokenHash")
      .populate("userId", "email fullName")
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    SessionModel.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getSessionDetail(sessionId: string) {
  const session = await SessionModel.findOne({
    _id: requireObjectId(sessionId, "sessionId"),
  })
    .select("-refreshTokenHash")
    .populate("userId", "email fullName")
    .lean();

  if (!session) {
    throw new AppError("Session not found", 404, "SESSION_NOT_FOUND");
  }

  return session;
}

export async function revokeAdminSession(
  sessionId: string,
  actorUserId: string,
  req: Request,
) {
  const session = await revokeSessionById(sessionId, actorUserId, req);
  return {
    id: session.id,
    revokedAt: session.revokedAt,
  };
}

export async function listAuditLogs(query: Record<string, unknown>) {
  const pagination = parsePagination(query.page, query.limit);
  const filter: Record<string, unknown> = {};

  if (query.actorUserId) {
    filter.actorUserId = requireObjectId(query.actorUserId, "actorUserId");
  }
  if (query.entityType) {
    filter.entityType = requireString(query.entityType, "entityType");
  }
  if (query.action) {
    filter.action = requireString(query.action, "action");
  }

  const [items, total] = await Promise.all([
    AuditLogModel.find(filter)
      .populate("actorUserId", "email fullName")
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    AuditLogModel.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}

export async function getAuditLog(auditLogId: string) {
  const auditLog = await AuditLogModel.findById(
    requireObjectId(auditLogId, "auditLogId"),
  )
    .populate("actorUserId", "email fullName")
    .lean();

  if (!auditLog) {
    throw new AppError("Audit log not found", 404, "AUDIT_LOG_NOT_FOUND");
  }

  return auditLog;
}

export async function runAdminQMongo(
  qmongo: QMongo,
  payload: Record<string, unknown>,
  actorUserId: string,
  req: Request,
) {
  const query = requireString(payload.query, "query");
  const results = await qmongo.run(query);
  const data = results.map((result) => {
    if (result instanceof Error) {
      return { error: result.message };
    }

    return result.data;
  });

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: "admin.run_qmongo",
    entityType: "QMongo",
    entityId: "",
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
    metadata: { query },
  });

  return { data };
}

export async function listErrorLogs(
  payload: Record<string, unknown>,
  actorUserId: string,
  req: Request,
) {
  const logsPasswordValue = payload.logsPassword ?? payload.adminPassword;
  const logsPassword = requireString(logsPasswordValue, "logsPassword", 1);
  const source = optionalEnum(payload.source, "source", ["express", "process"] as const);
  const pagination = parsePagination(payload.page, payload.limit);

  const actor = await UserModel.findOne({
    _id: requireObjectId(actorUserId, "actorUserId"),
    deletedAt: null,
  }).lean();

  if (!actor) {
    throw new AppError("Authentication failed", 401, "UNAUTHORIZED");
  }

  const logsEnabled = actor.logs_enabled === true;
  const logsPasswordHash =
    typeof actor.logs_password === "string" ? actor.logs_password : "";

  if (!logsEnabled || !logsPasswordHash) {
    await createAuditLog({
      actorUserId,
      roleSnapshot: "admin",
      action: "admin.read_error_logs_denied",
      entityType: "ErrorLog",
      entityId: "",
      method: req.method,
      route: req.originalUrl,
      ipAddress: getRequestIp(req),
      userAgent: getRequestUserAgent(req),
      metadata: { reason: "logs_access_not_configured" },
    });

    throw new AppError(
      "Error log access is not configured for this account",
      403,
      "LOGS_ACCESS_DISABLED",
    );
  }

  const passwordMatches = await verifyPassword(logsPassword, logsPasswordHash);

  if (!passwordMatches) {
    await createAuditLog({
      actorUserId,
      roleSnapshot: "admin",
      action: "admin.read_error_logs_denied",
      entityType: "ErrorLog",
      entityId: "",
      method: req.method,
      route: req.originalUrl,
      ipAddress: getRequestIp(req),
      userAgent: getRequestUserAgent(req),
      metadata: { reason: "invalid_logs_password" },
    });

    throw new AppError("Invalid logs password", 401, "INVALID_CREDENTIALS");
  }

  const filter: Record<string, unknown> = {};
  if (source) {
    filter.source = source;
  }

  const [itemsRaw, total] = await Promise.all([
    ErrorLogModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    ErrorLogModel.countDocuments(filter),
  ]);

  const items = itemsRaw.map((entry) => ({
    ...entry,
    metadata: toPublicErrorLogMetadata(entry.metadata),
  }));

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: "admin.read_error_logs",
    entityType: "ErrorLog",
    entityId: "",
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
    metadata: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      source: source ?? "all",
    },
  });

  return {
    items,
    total,
    page: pagination.page,
    limit: pagination.limit,
  };
}
