import { describe, expect, it, vi } from "vitest";

vi.mock("../server/config/env.js", () => ({
  env: {
    APP_ORIGIN: "http://localhost:5173",
    ALLOWED_APP_ORIGINS: "https://clienttrack.example.com",
    allowedAppOrigins: ["https://clienttrack.example.com"],
    VERCEL_URL: "clienttrack-preview.vercel.app"
  }
}));

import { verifyRequestOrigin } from "../server/auth/verifyRequestOrigin.js";

describe("verifyRequestOrigin", () => {
  it("permite metodos seguros sin validar origin", () => {
    const next = vi.fn();

    verifyRequestOrigin({ method: "GET", headers: {} }, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("permite mutaciones desde el origin configurado", () => {
    const next = vi.fn();

    verifyRequestOrigin(
      {
        method: "POST",
        headers: {
          origin: "http://localhost:5173"
        }
      },
      {},
      next
    );

    expect(next).toHaveBeenCalledWith();
  });

  it("permite mutaciones desde origins adicionales configurados", () => {
    const next = vi.fn();

    verifyRequestOrigin(
      {
        method: "POST",
        headers: {
          origin: "https://clienttrack.example.com"
        }
      },
      {},
      next
    );

    expect(next).toHaveBeenCalledWith();
  });

  it("permite mutaciones desde el dominio preview de Vercel", () => {
    const next = vi.fn();

    verifyRequestOrigin(
      {
        method: "PATCH",
        headers: {
          origin: "https://clienttrack-preview.vercel.app"
        }
      },
      {},
      next
    );

    expect(next).toHaveBeenCalledWith();
  });

  it("rechaza mutaciones desde un origin distinto", () => {
    const next = vi.fn();

    verifyRequestOrigin(
      {
        method: "DELETE",
        headers: {
          origin: "https://otro-origen.example"
        }
      },
      {},
      next
    );

    expect(next).toHaveBeenCalledTimes(1);
    const [error] = next.mock.calls[0];
    expect(error?.statusCode).toBe(403);
    expect(error?.code).toBe("origin_not_allowed");
  });
});
