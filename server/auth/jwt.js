import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const TOKEN_ISSUER = "clienttrack";
const TOKEN_AUDIENCE = "clienttrack-app";
const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    {
      algorithm: "HS256",
      audience: TOKEN_AUDIENCE,
      issuer: TOKEN_ISSUER,
      expiresIn: env.JWT_EXPIRES_IN
    }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
    audience: TOKEN_AUDIENCE,
    issuer: TOKEN_ISSUER
  });
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProduction,
    path: "/",
    maxAge: COOKIE_MAX_AGE_MS
  };
}
