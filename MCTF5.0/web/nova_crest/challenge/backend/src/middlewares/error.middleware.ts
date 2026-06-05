import type { NextFunction, Request, Response } from "express";
import { AppError } from "../services/app-error.js";
import { persistExpressError } from "../services/error-log.service.js";

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "NOT_FOUND"));
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    persistExpressError(error, req, {
      category: "handled_request_error",
      metadata: {
        appErrorCode: error.code,
        statusCode: error.statusCode,
      },
    }).catch((persistError) => {
      console.error("Failed to persist handled request error", persistError);
    });

    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      details: error.details ?? null,
    });
    return;
  }

  if ("code" in error && error.code === 11000) {
    persistExpressError(error, req, {
      category: "duplicate_key",
      metadata: {
        statusCode: 409,
      },
    }).catch((persistError) => {
      console.error("Failed to persist duplicate key error", persistError);
    });

    res.status(409).json({
      error: "A record with one of these unique fields already exists",
      code: "DUPLICATE_KEY",
    });
    return;
  }

  persistExpressError(error, req).catch((persistError) => {
    console.error("Failed to persist express error log", persistError);
  });

  console.error(error);
  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
}
