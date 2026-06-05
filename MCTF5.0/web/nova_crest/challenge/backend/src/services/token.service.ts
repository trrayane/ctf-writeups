import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "../types/auth.types.js";
import type { RoleCode, UserType } from "../types/domain.types.js";

interface TokenSubjectInput {
  userId: string;
  roleCode: RoleCode | string;
  userType: UserType;
  sessionId: string;
}

export function signAccessToken(input: TokenSubjectInput): string {
  const payload: AccessTokenPayload = {
    sub: input.userId,
    roleCode: input.roleCode,
    userType: input.userType,
    sessionId: input.sessionId,
    type: "access",
  };

  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessTtl as SignOptions["expiresIn"],
  });
}

export function signRefreshToken(input: TokenSubjectInput): string {
  const payload: RefreshTokenPayload = {
    sub: input.userId,
    roleCode: input.roleCode,
    userType: input.userType,
    sessionId: input.sessionId,
    type: "refresh",
  };

  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshTtl as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
}
