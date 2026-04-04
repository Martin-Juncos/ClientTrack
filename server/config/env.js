import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "./envSchema.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootEnvFile = path.resolve(currentDirectory, "../../.env");

if (typeof process.loadEnvFile === "function" && existsSync(rootEnvFile)) {
  process.loadEnvFile(rootEnvFile);
}

export const env = parseEnv(process.env);

export const adminSeedUsers = [
  {
    name: env.ADMIN_USER_1_NAME,
    email: env.ADMIN_USER_1_EMAIL.toLowerCase(),
    password: env.ADMIN_USER_1_PASSWORD
  },
  {
    name: env.ADMIN_USER_2_NAME,
    email: env.ADMIN_USER_2_EMAIL.toLowerCase(),
    password: env.ADMIN_USER_2_PASSWORD
  }
];
