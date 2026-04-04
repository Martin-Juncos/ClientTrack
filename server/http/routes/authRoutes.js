import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../auth/requireAuth.js";
import { getAuthCookieOptions, signAuthToken } from "../../auth/jwt.js";
import { env } from "../../config/env.js";
import { asyncHandler } from "../asyncHandler.js";
import { sendOk } from "../response.js";
import { loginUser, seedAdminUsers } from "../../services/authService.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "La contrasena es obligatoria")
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await loginUser(input);
    const token = signAuthToken(user);

    res.cookie(env.COOKIE_NAME, token, getAuthCookieOptions());
    return sendOk(res, { user });
  })
);

authRouter.post(
  "/logout",
  asyncHandler(async (_req, res) => {
    res.clearCookie(env.COOKIE_NAME, {
      ...getAuthCookieOptions(),
      maxAge: undefined
    });

    return sendOk(res, { loggedOut: true });
  })
);

authRouter.get(
  "/me",
  asyncHandler(async (req, res, next) => {
    await seedAdminUsers();
    next();
  }),
  requireAuth,
  asyncHandler(async (req, res) => sendOk(res, { user: req.user }))
);
