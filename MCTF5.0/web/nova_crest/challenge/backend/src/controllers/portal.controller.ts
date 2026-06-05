import type { Request, Response } from "express";
import { AppError } from "../services/app-error.js";
import { getPortalDashboardSummary } from "../services/dashboard.service.js";
import { getPortalProfile, updatePortalProfile } from "../services/profile.service.js";
import {
  createPortalInquiry,
  createPortalJobApplication,
  getPortalInquiry,
  getPortalJobApplication,
  listPortalInquiries,
  listPortalJobApplications,
} from "../services/workflow.service.js";

function getBody(req: Request): Record<string, unknown> {
  return (req.body ?? {}) as Record<string, unknown>;
}

function getQuery(req: Request): Record<string, unknown> {
  return req.query as Record<string, unknown>;
}

function getParam(req: Request, key: string): string {
  const value = req.params[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function requireActorUserId(req: Request): string {
  if (!req.auth?.userId) {
    throw new AppError("Authentication is required", 401, "UNAUTHORIZED");
  }

  return req.auth.userId;
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const user = await getPortalProfile(requireActorUserId(req));
  res.json({ user });
}

export async function getPortalSummary(
  req: Request,
  res: Response,
): Promise<void> {
  const summary = await getPortalDashboardSummary(requireActorUserId(req));
  res.json({ summary });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {

  // if (getBody(req).roleId !== undefined) {
  //   throw new AppError("Updating roleId is not allowed", 400, "VALIDATION_ERROR");
  // }



  const user = await updatePortalProfile(requireActorUserId(req), getBody(req), req);


  res.json({ user });
}

export async function createJobApplication(
  req: Request,
  res: Response,
): Promise<void> {
  const application = await createPortalJobApplication(
    requireActorUserId(req),
    getBody(req),
    req,
  );
  res.status(201).json({ application });
}

export async function listJobApplications(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await listPortalJobApplications(
    requireActorUserId(req),
    getQuery(req),
  );
  res.json(result);
}

export async function getJobApplication(
  req: Request,
  res: Response,
): Promise<void> {
  const application = await getPortalJobApplication(
    requireActorUserId(req),
    getParam(req, "applicationId"),
  );
  res.json({ application });
}

export async function createInquiry(req: Request, res: Response): Promise<void> {
  const inquiry = await createPortalInquiry(requireActorUserId(req), getBody(req), req);
  res.status(201).json({ inquiry });
}

export async function listInquiries(req: Request, res: Response): Promise<void> {
  const result = await listPortalInquiries(requireActorUserId(req), getQuery(req));
  res.json(result);
}

export async function getInquiry(req: Request, res: Response): Promise<void> {
  const inquiry = await getPortalInquiry(
    requireActorUserId(req),
    getParam(req, "inquiryId"),
  );
  res.json({ inquiry });
}
