import type { NextFunction, Request, RequestHandler, Response } from "express";
import { AppError } from "../../services/app-error.js";
import {
  optionalNumber,
  optionalObjectId,
  optionalString,
  optionalUrl,
  requireEmail,
  requireEnum,
  requireObjectId,
  requireString,
} from "../../services/validation.service.js";

type Dict = Record<string, unknown>;
type FieldValidator = (value: unknown, fieldName: string) => void;
type FieldValidators = Record<string, FieldValidator>;

interface RequestValidationSchema {
  body?: FieldValidators;
  query?: FieldValidators;
  params?: FieldValidators;
}

function asObject(value: unknown, label: string): Dict {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError(`${label} must be an object`, 400, "VALIDATION_ERROR");
  }

  return value as Dict;
}

function rejectUnknownFields(
  target: Dict,
  allowed: string[],
  label: string,
): void {
  const unknown = Object.keys(target).filter((key) => !allowed.includes(key));

  if (unknown.length > 0) {
    throw new AppError(
      `${label} contains unsupported field(s): ${unknown.join(", ")}`,
      400,
      "VALIDATION_ERROR",
    );
  }
}

function runFieldValidators(target: Dict, validators: FieldValidators): void {
  Object.entries(validators).forEach(([field, validator]) => {
    validator(target[field], field);
  });
}

export function validateRequest(
  schema: RequestValidationSchema,
): RequestHandler {
  return function validateRequestMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void {
    try {
      if (schema.body) {
        const body = asObject(req.body ?? {}, "body");
        //const allowed = Object.keys(schema.body);
        //  rejectUnknownFields(body, allowed, "body");
        runFieldValidators(body, schema.body);
      }

      if (schema.query) {
        const query = asObject(req.query ?? {}, "query");
        const allowed = Object.keys(schema.query);
         rejectUnknownFields(query, allowed, "query");
        runFieldValidators(query, schema.query);
      }

      if (schema.params) {
        const params = asObject(req.params ?? {}, "params");
        const allowed = Object.keys(schema.params);
         rejectUnknownFields(params, allowed, "params");
        runFieldValidators(params, schema.params);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export const validators = {
  requiredString(minimumLength = 1): FieldValidator {
    return (value, fieldName) => {
      requireString(value, fieldName, minimumLength);
    };
  },
  optionalString(): FieldValidator {
    return (value, fieldName) => {
      if (value === undefined) {
        return;
      }

      optionalString(value, fieldName);
    };
  },
  requiredEmail(): FieldValidator {
    return (value) => {
      requireEmail(value);
    };
  },
  optionalEmail(): FieldValidator {
    return (value) => {
      if (value === undefined) {
        return;
      }

      const normalized = requireString(value, "email", 1).toLowerCase();
      requireEmail(normalized);
    };
  },
  requiredObjectId(): FieldValidator {
    return (value, fieldName) => {
      requireObjectId(value, fieldName);
    };
  },
  optionalObjectId(): FieldValidator {
    return (value, fieldName) => {
      if (value === undefined) {
        return;
      }

      optionalObjectId(value, fieldName);
    };
  },
  requiredEnum<T extends readonly string[]>(options: T): FieldValidator {
    return (value, fieldName) => {
      requireEnum(value, fieldName, options);
    };
  },
  optionalEnum<T extends readonly string[]>(options: T): FieldValidator {
    return (value, fieldName) => {
      if (value === undefined) {
        return;
      }

      requireEnum(value, fieldName, options);
    };
  },
  optionalUrl(): FieldValidator {
    return (value, fieldName) => {
      if (value === undefined) {
        return;
      }

      optionalUrl(value, fieldName);
    };
  },
  requiredUrl(): FieldValidator {
    return (value, fieldName) => {
      requireString(value, fieldName, 1);
      optionalUrl(value, fieldName);
    };
  },
  optionalStringArray(): FieldValidator {
    return (value, fieldName) => {
      if (value === undefined) {
        return;
      }

      if (!Array.isArray(value)) {
        throw new AppError(
          `${fieldName} must be an array of strings`,
          400,
          "VALIDATION_ERROR",
        );
      }

      value.forEach((item) => {
        if (typeof item !== "string") {
          throw new AppError(
            `${fieldName} must be an array of strings`,
            400,
            "VALIDATION_ERROR",
          );
        }
      });
    };
  },
  optionalBoolean(): FieldValidator {
    return (value, fieldName) => {
      if (value === undefined) {
        return;
      }

      if (typeof value !== "boolean") {
        throw new AppError(
          `${fieldName} must be a boolean`,
          400,
          "VALIDATION_ERROR",
        );
      }
    };
  },
  optionalPositiveInt(max = 100): FieldValidator {
    return (value, fieldName) => {
      if (value === undefined) {
        return;
      }

      const numeric = optionalNumber(value, fieldName);

      if (
        !numeric ||
        !Number.isInteger(numeric) ||
        numeric < 1 ||
        numeric > max
      ) {
        throw new AppError(
          `${fieldName} must be an integer between 1 and ${max}`,
          400,
          "VALIDATION_ERROR",
        );
      }
    };
  },
  optionalNonNegativeInt(max = 100): FieldValidator {
    return (value, fieldName) => {
      if (value === undefined) {
        return;
      }

      const numeric = optionalNumber(value, fieldName);

      if (
        numeric === undefined ||
        numeric === null ||
        !Number.isInteger(numeric) ||
        numeric < 0 ||
        numeric > max
      ) {
        throw new AppError(
          `${fieldName} must be an integer between 0 and ${max}`,
          400,
          "VALIDATION_ERROR",
        );
      }
    };
  },
  optionalSearch(): FieldValidator {
    return (value, fieldName) => {
      if (value === undefined) {
        return;
      }

      optionalString(value, fieldName);
    };
  },
  slug(): FieldValidator {
    return (value, fieldName) => {
      const slug = requireString(value, fieldName);

      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new AppError(
          `${fieldName} must be a valid slug`,
          400,
          "VALIDATION_ERROR",
        );
      }
    };
  },
};
