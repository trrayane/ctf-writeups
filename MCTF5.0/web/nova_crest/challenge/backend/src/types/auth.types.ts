import type { RoleCode, UserType } from "./domain.types.js";

export interface AccessTokenPayload {
  sub: string;
  roleCode: RoleCode | string;
  userType: UserType;
  sessionId: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  roleCode: RoleCode | string;
  userType: UserType;
  sessionId: string;
  type: "refresh";
}

export interface AuthenticatedRequestUser {
  userId: string;
  roleCode: RoleCode | string;
  userType: UserType;
  sessionId: string;
}
