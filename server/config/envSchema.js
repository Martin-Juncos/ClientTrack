import { z } from "zod";

const emailAddressSchema = z.string().trim().email("EMAIL_FROM invalido");
const emailAddressWithNameSchema = z
  .string()
  .trim()
  .regex(/^[^<>]+<[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+>$/, "EMAIL_FROM invalido");

const optionalNonEmptyString = (fieldName) =>
  z.preprocess((value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed ? trimmed : undefined;
    }

    return value;
  }, z.string().min(1, `${fieldName} es obligatorio`).optional());

const optionalStringArray = (fieldName) =>
  z.preprocess((value) => {
    if (value === undefined || value === null) {
      return [];
    }

    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (Array.isArray(value)) {
      return value;
    }

    return value;
  }, z.array(z.string().url(`${fieldName} invalido`)).default([]));

const optionalPort = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? Number(trimmed) : undefined;
  }

  return value;
}, z.number().int("SMTP_PORT invalido").positive("SMTP_PORT invalido").optional());

const optionalBooleanLike = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      return undefined;
    }

    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return value;
}, z.boolean("SMTP_SECURE invalido").optional());

const smtpPresenceKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"];
const smtpRequiredKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"];
const productionPlaceholderChecks = {
  MONGODB_URI: [/username:password@cluster\.mongodb\.net/i, /mongodb\+srv:\/\/user:pass@/i],
  JWT_SECRET: [/^replace_with_/i],
  ADMIN_USER_1_EMAIL: [/@example\.com$/i],
  ADMIN_USER_2_EMAIL: [/@example\.com$/i],
  ADMIN_USER_1_PASSWORD: [/^replace_with_/i],
  ADMIN_USER_2_PASSWORD: [/^replace_with_/i],
  SMTP_USER: [/^tu_cuenta@gmail\.com$/i, /@example\.com$/i],
  SMTP_PASS: [/^replace_with_/i],
  EMAIL_FROM: [/tu_cuenta@gmail\.com/i, /example\.com/i]
};

function isObviousPlaceholder(fieldName, value) {
  if (typeof value !== "string") {
    return false;
  }

  return (productionPlaceholderChecks[fieldName] ?? []).some((pattern) => pattern.test(value.trim()));
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3001),
    APP_ORIGIN: z.string().url().default("http://localhost:5173"),
    ALLOWED_APP_ORIGINS: optionalStringArray("ALLOWED_APP_ORIGINS"),
    VERCEL_URL: optionalNonEmptyString("VERCEL_URL"),
    MONGODB_URI: z.string().min(1, "MONGODB_URI es obligatorio"),
    JWT_SECRET: z.string().min(24, "JWT_SECRET debe tener al menos 24 caracteres"),
    JWT_EXPIRES_IN: z.string().default("7d"),
    COOKIE_NAME: z.string().default("clienttrack_session"),
    SMTP_HOST: optionalNonEmptyString("SMTP_HOST"),
    SMTP_PORT: optionalPort,
    SMTP_SECURE: optionalBooleanLike,
    SMTP_USER: optionalNonEmptyString("SMTP_USER"),
    SMTP_PASS: optionalNonEmptyString("SMTP_PASS"),
    EMAIL_FROM: z.union([emailAddressSchema, emailAddressWithNameSchema]).optional(),
    ADMIN_USER_1_NAME: z.string().min(1, "ADMIN_USER_1_NAME es obligatorio"),
    ADMIN_USER_1_EMAIL: z.string().email("ADMIN_USER_1_EMAIL invalido"),
    ADMIN_USER_1_PASSWORD: z.string().min(8, "ADMIN_USER_1_PASSWORD debe tener al menos 8 caracteres"),
    ADMIN_USER_2_NAME: z.string().min(1, "ADMIN_USER_2_NAME es obligatorio"),
    ADMIN_USER_2_EMAIL: z.string().email("ADMIN_USER_2_EMAIL invalido"),
    ADMIN_USER_2_PASSWORD: z.string().min(8, "ADMIN_USER_2_PASSWORD debe tener al menos 8 caracteres")
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "production") {
      Object.keys(productionPlaceholderChecks).forEach((fieldName) => {
        if (isObviousPlaceholder(fieldName, data[fieldName])) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [fieldName],
            message: `${fieldName} contiene un valor de ejemplo y debe reemplazarse antes de producir.`
          });
        }
      });
    }

    const hasAnySmtpValue = smtpPresenceKeys.some((key) => data[key] !== undefined);

    if (!hasAnySmtpValue) {
      return;
    }

    const missingRequiredKeys = smtpRequiredKeys.filter((key) => data[key] === undefined);

    if (missingRequiredKeys.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["SMTP_HOST"],
        message: `Configuracion SMTP incompleta. Faltan: ${missingRequiredKeys.join(", ")}.`
      });
    }
  });

function formatValidationIssues(issues) {
  return issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");
}

export function parseEnv(rawEnv) {
  const parsedEnv = envSchema.safeParse(rawEnv);

  if (!parsedEnv.success) {
    throw new Error(`Configuracion invalida:\n${formatValidationIssues(parsedEnv.error.issues)}`);
  }

  const smtpEnabled = smtpRequiredKeys.every((key) => parsedEnv.data[key] !== undefined);
  const smtpSecure = smtpEnabled ? parsedEnv.data.SMTP_SECURE ?? parsedEnv.data.SMTP_PORT === 465 : false;

  return {
    ...parsedEnv.data,
    isProduction: parsedEnv.data.NODE_ENV === "production",
    allowedAppOrigins: parsedEnv.data.ALLOWED_APP_ORIGINS,
    smtp: {
      enabled: smtpEnabled,
      host: parsedEnv.data.SMTP_HOST ?? "",
      port: parsedEnv.data.SMTP_PORT ?? 0,
      secure: smtpSecure,
      user: parsedEnv.data.SMTP_USER ?? "",
      pass: parsedEnv.data.SMTP_PASS ?? "",
      from: parsedEnv.data.EMAIL_FROM ?? ""
    }
  };
}
