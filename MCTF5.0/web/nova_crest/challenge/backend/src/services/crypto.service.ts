import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { AppError } from "./app-error.js";

const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string): Promise<string> {
  const normalized = password.trim();

  if (normalized.length < 8) {
    throw new AppError(
      "Password must be at least 8 characters long",
      400,
      "WEAK_PASSWORD",
    );
  }

  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(normalized, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  const [algorithm, salt, storedHash] = passwordHash.split("$");

  if (algorithm !== "scrypt" || !salt || !storedHash) {
    return false;
  }

  const derivedKey = (await scrypt(password.trim(), salt, 64)) as Buffer;
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (derivedKey.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedBuffer);
}

export function createOpaqueToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("hex");
}

export function hashOpaqueToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
