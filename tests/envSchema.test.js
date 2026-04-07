import { describe, expect, it } from "vitest";
import { parseEnv } from "../server/config/envSchema.js";

const baseEnv = {
  NODE_ENV: "test",
  PORT: "3001",
  APP_ORIGIN: "http://localhost:5173",
  MONGODB_URI: "mongodb+srv://user:pass@cluster.mongodb.net/clienttrack",
  JWT_SECRET: "super-secret-key-with-24-chars",
  JWT_EXPIRES_IN: "7d",
  COOKIE_NAME: "clienttrack_session",
  ADMIN_USER_1_NAME: "Admin Uno",
  ADMIN_USER_1_EMAIL: "admin1@example.com",
  ADMIN_USER_1_PASSWORD: "password123",
  ADMIN_USER_2_NAME: "Admin Dos",
  ADMIN_USER_2_EMAIL: "admin2@example.com",
  ADMIN_USER_2_PASSWORD: "password456"
};

describe("env schema", () => {
  it("arranca sin configuracion SMTP ni objetos derivados", () => {
    const env = parseEnv(baseEnv);

    expect(env).not.toHaveProperty("smtp");
    expect(env.APP_ORIGIN).toBe("http://localhost:5173");
  });

  it("normaliza origins adicionales para entornos con previews", () => {
    const env = parseEnv({
      ...baseEnv,
      ALLOWED_APP_ORIGINS: "https://clienttrack.example.com, https://preview-clienttrack.vercel.app"
    });

    expect(env.allowedAppOrigins).toEqual([
      "https://clienttrack.example.com",
      "https://preview-clienttrack.vercel.app"
    ]);
  });

  it("rechaza placeholders obvios en produccion", () => {
    expect(() =>
      parseEnv({
        ...baseEnv,
        NODE_ENV: "production",
        JWT_SECRET: "replace_with_a_long_random_secret",
        ADMIN_USER_1_EMAIL: "admin1@example.com",
        ADMIN_USER_1_PASSWORD: "replace_with_a_strong_password",
        ADMIN_USER_2_EMAIL: "admin2@example.com",
        ADMIN_USER_2_PASSWORD: "replace_with_a_strong_password"
      })
    ).toThrow(/contiene un valor de ejemplo/i);
  });
});
