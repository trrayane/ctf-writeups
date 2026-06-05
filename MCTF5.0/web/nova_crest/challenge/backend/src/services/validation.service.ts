import { Types } from "mongoose";
import { AppError } from "./app-error.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requireString(
  value: unknown,
  fieldName: string,
  minimumLength = 1,
): string {
  if (typeof value !== "string") {
    throw new AppError(`${fieldName} is required`, 400, "VALIDATION_ERROR");
  }

  const normalized = value.trim();

  if (normalized.length < minimumLength) {
    throw new AppError(`${fieldName} is required`, 400, "VALIDATION_ERROR");
  }

  return normalized;
}

export function optionalString(value: unknown, fieldName: string): string {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw new AppError(`${fieldName} must be a string`, 400, "VALIDATION_ERROR");
  }

  return value.trim();
}

export function requireEmail(value: unknown): string {
  const email = requireString(value, "email");

  if (!EMAIL_PATTERN.test(email)) {
    throw new AppError("email must be valid", 400, "VALIDATION_ERROR");
  }

  return email.toLowerCase();
}

export function optionalUrl(value: unknown, fieldName: string): string {
  const url = optionalString(value, fieldName);

  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    throw new AppError(`${fieldName} must be a valid URL`, 400, "VALIDATION_ERROR");
  }
}

export function optionalStringArray(value: unknown, fieldName: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new AppError(
      `${fieldName} must be an array of strings`,
      400,
      "VALIDATION_ERROR",
    );
  }

  return value
    .map((entry) => {
      if (typeof entry !== "string") {
        throw new AppError(
          `${fieldName} must be an array of strings`,
          400,
          "VALIDATION_ERROR",
        );
      }

      return entry.trim();
    })
    .filter((entry) => entry.length > 0);
}

export function optionalBoolean(value: unknown, fieldName: string): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw new AppError(`${fieldName} must be a boolean`, 400, "VALIDATION_ERROR");
  }

  return value;
}

export function optionalNumber(value: unknown, fieldName: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    throw new AppError(`${fieldName} must be a number`, 400, "VALIDATION_ERROR");
  }

  return numeric;
}

export function requireEnum<T extends readonly string[]>(
  value: unknown,
  fieldName: string,
  options: T,
): T[number] {
  const normalized = requireString(value, fieldName);

  if (!options.includes(normalized as T[number])) {
    throw new AppError(
      `${fieldName} must be one of: ${options.join(", ")}`,
      400,
      "VALIDATION_ERROR",
    );
  }

  return normalized as T[number];
}

export function optionalEnum<T extends readonly string[]>(
  value: unknown,
  fieldName: string,
  options: T,
): T[number] | undefined {
  if (value === undefined) {
    return undefined;
  }

  return requireEnum(value, fieldName, options);
}

export function requireObjectId(value: unknown, fieldName: string): string {
  const identifier = requireString(value, fieldName);

  if (!Types.ObjectId.isValid(identifier)) {
    throw new AppError(`${fieldName} must be a valid id`, 400, "VALIDATION_ERROR");
  }

  return identifier;
}

export function optionalObjectId(value: unknown, fieldName: string): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return requireObjectId(value, fieldName);
}

export function parsePagination(
  pageValue: unknown,
  limitValue: unknown,
  defaultLimit = 20,
): { page: number; limit: number; skip: number } {
  const page = Math.max(1, Number(pageValue ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(limitValue ?? defaultLimit) || defaultLimit));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function createSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
