import mongoose from "mongoose";
import { env } from "../config/env.js";
import { runHardcodedSeeds } from "./seeds/hardcoded.js";
import { ensureSystemRoles } from "../services/auth.service.js";
import { hashPassword, verifyPassword } from "../services/crypto.service.js";
import { getRoleByCode } from "../services/user-role.service.js";
import { UserModel } from "./models/user.model.js";

async function seedBootstrapAdmin() {
  await ensureSystemRoles();

  const adminRole = await getRoleByCode("admin");
  const existingAdmin = await UserModel.findOne({ email: env.seedAdminEmail });

  if (existingAdmin) {
    let changed = false;

    if (existingAdmin.roleId.toString() !== adminRole.id) {
      existingAdmin.roleId = adminRole.id;
      changed = true;
    }
    if (existingAdmin.userType !== "internal") {
      existingAdmin.userType = "internal";
      changed = true;
    }
    if (existingAdmin.status !== "active") {
      existingAdmin.status = "active";
      changed = true;
    }
    if (!existingAdmin.emailVerifiedAt) {
      existingAdmin.emailVerifiedAt = new Date();
      changed = true;
    }
    if (existingAdmin.deletedAt) {
      existingAdmin.set("deletedAt", null);
      existingAdmin.set("deletedBy", null);
      changed = true;
    }

    if (existingAdmin.get("logs_enabled") !== env.seedAdminLogsEnabled) {
      existingAdmin.set("logs_enabled", env.seedAdminLogsEnabled);
      changed = true;
    }

    if (env.seedAdminLogsEnabled) {
      const existingLogsPasswordHash = existingAdmin.get("logs_password");
      const isConfigured =
        typeof existingLogsPasswordHash === "string" &&
        (await verifyPassword(env.seedAdminLogsPassword, existingLogsPasswordHash));

      if (!isConfigured) {
        existingAdmin.set(
          "logs_password",
          await hashPassword(env.seedAdminLogsPassword),
        );
        changed = true;
      }
    }

    if (changed) {
      await existingAdmin.save();
    }

    return;
  }

  await UserModel.create({
    email: env.seedAdminEmail,
    fullName: env.seedAdminName,
    passwordHash: await hashPassword(env.seedAdminPassword),
    logs_password: env.seedAdminLogsEnabled
      ? await hashPassword(env.seedAdminLogsPassword)
      : undefined,
    logs_enabled: env.seedAdminLogsEnabled,
    roleId: adminRole.id,
    userType: "internal",
    status: "active",
    emailVerifiedAt: new Date(),
    mustSetPassword: false,
  });
}

export async function initDB() {
  try {
    await mongoose.connect(env.mongoUri);
    await seedBootstrapAdmin();
    await runHardcodedSeeds();
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return false;
  }
}
