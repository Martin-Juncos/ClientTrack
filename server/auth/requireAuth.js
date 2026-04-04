import cookie from "cookie";
import { env } from "../config/env.js";
import { verifyAuthToken } from "./jwt.js";
import { ApiError } from "../http/apiError.js";
import { User } from "../models/User.js";

export async function requireAuth(req, _res, next) {
  try {
    const cookies = cookie.parse(req.headers.cookie ?? "");
    const token = cookies[env.COOKIE_NAME];

    if (!token) {
      throw new ApiError(401, "Debes iniciar sesion para continuar.", "auth_required");
    }

    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.sub).select("_id name email role active").lean();

    if (!user || !user.active) {
      throw new ApiError(401, "La sesion ya no es valida.", "auth_invalid");
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    };
    req.auth = payload;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "La sesion no pudo verificarse.", "auth_invalid"));
  }
}
