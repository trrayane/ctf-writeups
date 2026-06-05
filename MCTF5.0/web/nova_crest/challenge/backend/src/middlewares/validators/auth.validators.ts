import type { RequestHandler } from "express";
import { validateRequest, validators as v } from "./common.js";

export const validateRegister: RequestHandler = validateRequest({
  body: {
    email: v.requiredEmail(),
    fullName: v.requiredString(1),
    password: v.requiredString(8),
    phoneNumber: v.optionalString(),
    title: v.optionalString(),
    avatarUrl: v.optionalUrl(),
  },
});

export const validateLogin: RequestHandler = validateRequest({
  body: {
    email: v.requiredEmail(),
    password: v.requiredString(1),
  },
});

export const validateRefresh: RequestHandler = validateRequest({
  body: {
    refreshToken: v.requiredString(1),
  },
});

export const validateLogout: RequestHandler = validateRequest({
  body: {
    refreshToken: v.requiredString(1),
  },
});
