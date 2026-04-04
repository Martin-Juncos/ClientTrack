import { ZodError } from "zod";
import { ApiError } from "./apiError.js";

export function notFoundHandler(_req, _res, next) {
  next(new ApiError(404, "El recurso solicitado no existe.", "not_found"));
}

export function errorHandler(error, _req, res, _next) {
  void _next;

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? undefined
      }
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "validation_error",
        message: "Algunos datos no son validos.",
        details: error.issues
      }
    });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: {
        code: "invalid_identifier",
        message: "El identificador enviado no es valido."
      }
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: "duplicate",
        message: "Ya existe un registro con esos datos unicos."
      }
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    error: {
      code: "internal_error",
      message: "Ocurrio un error inesperado."
    }
  });
}
