import type { Request, Response } from "express";
import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerExternalUser,
} from "../services/auth.service.js";
import { getPortalProfile } from "../services/profile.service.js";
import { AppError } from "../services/app-error.js";

function getBody(req: Request): Record<string, unknown> {
  return (req.body ?? {}) as Record<string, unknown>;
}

export async function register(req: Request, res: Response): Promise<void> {
  const result = await registerExternalUser(getBody(req), req);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await loginUser(getBody(req), req);
  res.json(result);
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const result = await refreshUserSession(getBody(req), req);
  res.json(result);
}

export async function logout(req: Request, res: Response): Promise<void> {
  const result = await logoutUser(getBody(req), req);
  res.json(result);
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.auth?.userId) {
    throw new AppError("Authentication is required", 401, "UNAUTHORIZED");
  }

  const user = await getPortalProfile(req.auth.userId);
  res.json({ user });
}
