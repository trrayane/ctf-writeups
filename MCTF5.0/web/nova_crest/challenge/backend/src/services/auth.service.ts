import type { Request } from "express";
import { RoleModel, SessionModel, UserModel } from "../database/models/index.js";
import { createAuditLog, getRequestIp, getRequestUserAgent } from "./audit-log.service.js";
import { AppError } from "./app-error.js";
import {
  hashOpaqueToken,
  hashPassword,
  verifyPassword,
} from "./crypto.service.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "./token.service.js";
import type { RoleCode, UserType } from "../types/domain.types.js";
import {
  optionalString,
  optionalUrl,
  requireEmail,
  requireObjectId,
  requireString,
} from "./validation.service.js";
import { getRoleByCode, getRoleById, getUserByEmail, getUserById, sanitizeUser } from "./user-role.service.js";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

async function createSessionTokens(
  userId: string,
  roleCode: string,
  userType: UserType,
  req: Request,
): Promise<AuthTokens> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await SessionModel.create({
    userId,
    refreshTokenHash: "pending",
    userAgent: getRequestUserAgent(req),
    ipAddress: getRequestIp(req),
    expiresAt,
    lastUsedAt: new Date(),
  });

  const accessToken = signAccessToken({
    userId,
    roleCode,
    userType,
    sessionId: session.id,
  });

  const refreshToken = signRefreshToken({
    userId,
    roleCode,
    userType,
    sessionId: session.id,
  });

  session.refreshTokenHash = hashOpaqueToken(refreshToken);
  await session.save();

  return { accessToken, refreshToken };
}

export async function registerExternalUser(
  payload: Record<string, unknown>,
  req: Request,
) {
  const email = requireEmail(payload.email);
  const fullName = requireString(payload.fullName, "fullName");
  const password = requireString(payload.password, "password", 8);
  const phoneNumber = optionalString(payload.phoneNumber, "phoneNumber");
  const title = optionalString(payload.title, "title");
  const avatarUrl = optionalUrl(payload.avatarUrl, "avatarUrl");

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409, "EMAIL_IN_USE");
  }

  const role = await getRoleByCode("external");
  const passwordHash = await hashPassword(password);

  const user = await UserModel.create({
    email,
    fullName,
    passwordHash,
    roleId: role.id,
    userType: "external",
    status: "active",
    emailVerifiedAt: new Date(),
    phoneNumber,
    title,
    avatarUrl,
    mustSetPassword: false,
  });

  await createAuditLog({
    action: "auth.register",
    entityType: "User",
    entityId: user.id,
    roleSnapshot: "external",
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
    metadata: { email },
  });

  return {
    user: await sanitizeUser(user),
  };
}

export async function loginUser(payload: Record<string, unknown>, req: Request) {
  const email = requireEmail(payload.email);
  const password = requireString(payload.password, "password", 1);
  const user = await getUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  if (user.status === "pending_verification") {
    throw new AppError(
      "Please verify your email before logging in",
      403,
      "EMAIL_VERIFICATION_REQUIRED",
    );
  }

  if (user.status !== "active") {
    throw new AppError("This account is not active", 403, "ACCOUNT_INACTIVE");
  }

  const role = await getRoleById(user.roleId.toString());
  const tokens = await createSessionTokens(user.id, role.code, user.userType, req);
  user.lastLoginAt = new Date();
  await user.save();

  await createAuditLog({
    actorUserId: user.id,
    roleSnapshot: role.code,
    action: "auth.login",
    entityType: "User",
    entityId: user.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return {
    user: await sanitizeUser(user),
    tokens,
  };
}

export async function refreshUserSession(
  payload: Record<string, unknown>,
  req: Request,
) {
  const refreshToken = requireString(payload.refreshToken, "refreshToken");
  const decoded = verifyRefreshToken(refreshToken);

  if (decoded.type !== "refresh") {
    throw new AppError("Invalid refresh token", 401, "UNAUTHORIZED");
  }

  const session = await SessionModel.findById(decoded.sessionId);

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    throw new AppError("Session is no longer valid", 401, "UNAUTHORIZED");
  }

  if (session.refreshTokenHash !== hashOpaqueToken(refreshToken)) {
    throw new AppError("Invalid refresh token", 401, "UNAUTHORIZED");
  }

  const user = await getUserById(decoded.sub);

  if (user.status !== "active") {
    throw new AppError("This account is not active", 403, "ACCOUNT_INACTIVE");
  }

  const role = await getRoleById(user.roleId.toString());
  const nextAccessToken = signAccessToken({
    userId: user.id,
    roleCode: role.code,
    userType: user.userType,
    sessionId: session.id,
  });
  const nextRefreshToken = signRefreshToken({
    userId: user.id,
    roleCode: role.code,
    userType: user.userType,
    sessionId: session.id,
  });

  session.refreshTokenHash = hashOpaqueToken(nextRefreshToken);
  session.lastUsedAt = new Date();
  await session.save();

  await createAuditLog({
    actorUserId: user.id,
    roleSnapshot: role.code,
    action: "auth.refresh",
    entityType: "Session",
    entityId: session.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return {
    user: await sanitizeUser(user),
    tokens: {
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
    },
  };
}

export async function logoutUser(payload: Record<string, unknown>, req: Request) {
  const refreshToken = requireString(payload.refreshToken, "refreshToken");

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const session = await SessionModel.findById(decoded.sessionId);

    if (session && !session.revokedAt) {
      session.revokedAt = new Date();
      await session.save();

      await createAuditLog({
        actorUserId: decoded.sub,
        roleSnapshot: decoded.roleCode,
        action: "auth.logout",
        entityType: "Session",
        entityId: session.id,
        method: req.method,
        route: req.originalUrl,
        ipAddress: getRequestIp(req),
        userAgent: getRequestUserAgent(req),
      });
    }
  } catch {
    return { success: true };
  }

  return { success: true };
}

export async function createStaffAccount(
  payload: Record<string, unknown>,
  req: Request,
  actorUserId: string,
) {
  const email = requireEmail(payload.email);
  const fullName = requireString(payload.fullName, "fullName");
  const title = optionalString(payload.title, "title");
  const phoneNumber = optionalString(payload.phoneNumber, "phoneNumber");
  const avatarUrl = optionalUrl(payload.avatarUrl, "avatarUrl");
  const roleCode = (payload.roleCode
    ? requireString(payload.roleCode, "roleCode")
    : "staff") as RoleCode | string;
  const requestedUserType = payload.userType
    ? requireString(payload.userType, "userType")
    : "internal";

  if (requestedUserType !== "internal") {
    throw new AppError(
      "Staff accounts must use the internal user type",
      400,
      "VALIDATION_ERROR",
    );
  }

  if (!["admin", "staff"].includes(roleCode)) {
    throw new AppError(
      "roleCode must be either admin or staff",
      400,
      "VALIDATION_ERROR",
    );
  }

  const userType: UserType = "internal";

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409, "EMAIL_IN_USE");
  }

  const role = await getRoleByCode(roleCode);
  const staffPassword = requireString(payload.password, "password", 8);
  const passwordHash = await hashPassword(staffPassword);

  const user = await UserModel.create({
    email,
    fullName,
    passwordHash,
    roleId: role.id,
    userType,
    status: "active",
    emailVerifiedAt: new Date(),
    phoneNumber,
    title,
    avatarUrl,
    mustSetPassword: false,
  });

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: "admin.create_staff_account",
    entityType: "User",
    entityId: user.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
    metadata: { createdRoleCode: role.code, createdUserType: user.userType },
  });

  return {
    user: await sanitizeUser(user),
  };
}

export async function revokeSessionById(
  sessionId: string,
  actorUserId: string,
  req: Request,
) {
  const validSessionId = requireObjectId(sessionId, "sessionId");
  const session = await SessionModel.findById(validSessionId);

  if (!session) {
    throw new AppError("Session not found", 404, "SESSION_NOT_FOUND");
  }

  session.revokedAt = new Date();
  await session.save();

  await createAuditLog({
    actorUserId,
    roleSnapshot: "admin",
    action: "admin.revoke_session",
    entityType: "Session",
    entityId: session.id,
    method: req.method,
    route: req.originalUrl,
    ipAddress: getRequestIp(req),
    userAgent: getRequestUserAgent(req),
  });

  return session;
}

export async function ensureSystemRoles(): Promise<void> {
  const roles = [
    {
      _id: "0",
      code: "admin",
      name: "Administrator",
      description: "Full enterprise administration access",
      isSystem: true,
    },
    {
      _id: "1",
      code: "staff",
      name: "Staff",
      description: "Read-only internal CMS dashboard access",
      isSystem: true,
    },
    {
      _id: "2",
      code: "external",
      name: "External",
      description: "External user portal access",
      isSystem: true,
    },
  ];

  for (const role of roles) {
    await RoleModel.findOneAndUpdate(
      { _id: role._id },
      {
        $set: role,
      },
      { upsert: true, new: true },
    );
  }
}
