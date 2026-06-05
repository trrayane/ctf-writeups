import type { Request, Response } from "express";
import { getStaffDashboardSummary } from "../services/dashboard.service.js";
import {
  getAdminContentById,
  listStaffContent,
  type CmsResourceKey,
} from "../services/content.service.js";

function getQuery(req: Request): Record<string, unknown> {
  return req.query as Record<string, unknown>;
}

function getParam(req: Request, key: string): string {
  const value = req.params[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function createListStaffContentHandler(resource: CmsResourceKey) {
  return async function listStaffContentHandler(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await listStaffContent(resource, getQuery(req));
    res.json(result);
  };
}

export async function getStaffSummary(
  _req: Request,
  res: Response,
): Promise<void> {
  const summary = await getStaffDashboardSummary();
  res.json({ summary });
}

export function createGetStaffContentHandler(resource: CmsResourceKey) {
  return async function getStaffContentHandler(
    req: Request,
    res: Response,
  ): Promise<void> {
    const item = await getAdminContentById(resource, getParam(req, "id"));
    res.json({ item });
  };
}
