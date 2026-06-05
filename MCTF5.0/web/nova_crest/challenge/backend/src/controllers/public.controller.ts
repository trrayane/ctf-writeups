import type { Request, Response } from "express";
import {
  getPublicContentBySlug,
  listPublicContent,
  type CmsResourceKey,
} from "../services/content.service.js";
import { createPublicInquiry } from "../services/workflow.service.js";

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

export function createListPublicContentHandler(resource: CmsResourceKey) {
  return async function listPublicContentHandler(
    req: Request,
    res: Response,
  ): Promise<void> {
    const result = await listPublicContent(resource, getQuery(req));
    res.json(result);
  };
}

export function createGetPublicContentHandler(resource: CmsResourceKey) {
  return async function getPublicContentHandler(
    req: Request,
    res: Response,
  ): Promise<void> {
    const item = await getPublicContentBySlug(resource, getParam(req, "slug"));
    res.json({ item });
  };
}

export async function createInquiry(req: Request, res: Response): Promise<void> {
  const inquiry = await createPublicInquiry(getBody(req), req);
  res.status(201).json({ inquiry });
}
