import { RoleModel, UserModel } from "../database/models/index.js";
import type { RoleCode } from "../types/domain.types.js";
import { AppError } from "./app-error.js";

export interface SafeUserResponse {
  id: string;
  email: string;
  fullName: string;
  roleCode: string;
  roleName: string;
  roleId: string;
  userType: string;
  status: string;
  emailVerifiedAt: Date | null;
  phoneNumber: string;
  title: string;
  avatarUrl: string;
  mustSetPassword: boolean;
  lastLoginAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getRoleByCode(roleCode: RoleCode | string) {
  const role = await RoleModel.findOne({
    code: roleCode,
    deletedAt: null,
  });

  if (!role) {
    throw new AppError("Role not found", 404, "ROLE_NOT_FOUND");
  }

  return role;
}

export async function getRoleById(roleId: string) {
  const role = await RoleModel.findOne({
    _id: roleId,
    deletedAt: null,
  });

  if (!role) {
    throw new AppError("Role not found", 404, "ROLE_NOT_FOUND");
  }

  return role;
}

export async function getUserById(userId: string) {
  const user = await UserModel.findOne({
    _id: userId,
    deletedAt: null,
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return user;
}

export async function getUserByEmail(email: string) {
  return UserModel.findOne({
    email: email.toLowerCase(),
    deletedAt: null,
  });
}

export async function sanitizeUser(user: Awaited<ReturnType<typeof getUserById>>) {
  const role = await getRoleById(user.roleId.toString());

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roleCode: role.code,
    roleName: role.name,
    roleId: user.roleId.toString(),
    userType: user.userType,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt,
    phoneNumber: user.phoneNumber,
    title: user.title,
    avatarUrl: user.avatarUrl,
    mustSetPassword: user.mustSetPassword,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies SafeUserResponse;
}
