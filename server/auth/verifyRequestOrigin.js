import { ApiError } from "../http/apiError.js";
import { env } from "../config/env.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function normalizeOrigin(origin) {
  if (!origin) {
    return "";
  }

  try {
    return new URL(origin).origin;
  } catch {
    try {
      return new URL(`https://${origin}`).origin;
    } catch {
      return "";
    }
  }
}

const allowedOrigins = new Set(
  [
    ...(env.allowedAppOrigins ?? []),
    env.APP_ORIGIN,
    env.VERCEL_URL
  ]
    .map(normalizeOrigin)
    .filter(Boolean)
);

export function verifyRequestOrigin(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const requestOrigin = normalizeOrigin(req.headers.origin);

  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    next();
    return;
  }

  next(new ApiError(403, "El origen de la solicitud no esta permitido.", "origin_not_allowed"));
}
