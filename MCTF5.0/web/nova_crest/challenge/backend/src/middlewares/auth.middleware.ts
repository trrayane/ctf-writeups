import type { NextFunction, Request, Response } from "express";
import { RoleModel, SessionModel, UserModel } from "../database/models/index.js";
import { AppError } from "../services/app-error.js";
import { verifyAccessToken } from "../services/token.service.js";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(new AppError("Authentication is required", 401, "UNAUTHORIZED"));
    return;
  }

  try {
    const token = authorization.replace(/^Bearer\s+/i, "").trim();
    const payload = verifyAccessToken(token);

    if (payload.type !== "access") {
      throw new AppError("Invalid access token", 401, "UNAUTHORIZED");
    }

    const [session, user] = await Promise.all([
      SessionModel.findById(payload.sessionId).lean(),
      UserModel.findOne({
        _id: payload.sub,
        deletedAt: null,
      }).lean(),
    ]);

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new AppError("Session is no longer valid", 401, "UNAUTHORIZED");
    }

    if (session.userId.toString() !== payload.sub) {
      throw new AppError("Session is no longer valid", 401, "UNAUTHORIZED");
    }

    if (!user) {
      throw new AppError("Authentication failed", 401, "UNAUTHORIZED");
    }

    if (user.status !== "active") {
      throw new AppError("This account is not active", 403, "ACCOUNT_INACTIVE");
    }

    const role = await RoleModel.findOne({
      _id: user.roleId,
      deletedAt: null,
    }).lean();

    if (!role) {
      throw new AppError("Authentication failed", 401, "UNAUTHORIZED");
    }

    req.auth = {
      userId: user._id.toString(),
      roleCode: role.code,
      userType: user.userType,
      sessionId: payload.sessionId,
    };

    next();
  } catch (error) {
    next(
      error instanceof AppError
        ? error
        : new AppError("Authentication failed", 401, "UNAUTHORIZED"),
    );
  }
}
