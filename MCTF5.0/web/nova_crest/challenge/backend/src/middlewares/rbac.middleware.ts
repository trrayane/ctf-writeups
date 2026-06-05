import type { NextFunction, Request, Response } from "express";
import type { RoleCode } from "../types/domain.types.js";
import { AppError } from "../services/app-error.js";

export function requireRoles(...allowedRoles: RoleCode[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new AppError("Authentication is required", 401, "UNAUTHORIZED"));
      return;
    }

    if (!allowedRoles.includes(req.auth.roleCode as RoleCode)) {
      next(new AppError("You do not have access to this resource", 403, "FORBIDDEN"));
      return;
    }

    next();
  };
}
