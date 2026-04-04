import http from "node:http";
import express from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { errorHandler, notFoundHandler } from "../server/http/errorHandler.js";
import { authRouter } from "../server/http/routes/authRoutes.js";

const mockState = vi.hoisted(() => ({
  getAuthCookieOptions: vi.fn(),
  loginUser: vi.fn(),
  seedAdminUsers: vi.fn(),
  signAuthToken: vi.fn(),
  verifyAuthToken: vi.fn(),
  findUserById: vi.fn()
}));

vi.mock("../server/config/env.js", () => ({
  env: {
    COOKIE_NAME: "clienttrack_session",
    APP_ORIGIN: "http://localhost:5173"
  }
}));

vi.mock("../server/services/authService.js", () => ({
  loginUser: mockState.loginUser,
  seedAdminUsers: mockState.seedAdminUsers
}));

vi.mock("../server/auth/jwt.js", () => ({
  getAuthCookieOptions: mockState.getAuthCookieOptions,
  signAuthToken: mockState.signAuthToken,
  verifyAuthToken: mockState.verifyAuthToken
}));

vi.mock("../server/models/User.js", () => ({
  User: {
    findById: mockState.findUserById
  }
}));

function createUserQuery(user) {
  return {
    select() {
      return {
        lean: vi.fn().mockResolvedValue(user)
      };
    }
  };
}

describe("auth routes", () => {
  let server;
  let baseUrl = "";

  beforeEach(async () => {
    mockState.loginUser.mockReset();
    mockState.seedAdminUsers.mockReset();
    mockState.signAuthToken.mockReset();
    mockState.getAuthCookieOptions.mockReset();
    mockState.verifyAuthToken.mockReset();
    mockState.findUserById.mockReset();

    mockState.loginUser.mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
      name: "Admin Uno",
      email: "admin1@example.com",
      role: "admin"
    });
    mockState.seedAdminUsers.mockResolvedValue(undefined);
    mockState.signAuthToken.mockReturnValue("signed-token");
    mockState.getAuthCookieOptions.mockReturnValue({
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 604800000
    });
    mockState.verifyAuthToken.mockImplementation((token) => {
      if (token !== "signed-token") {
        throw new Error("token invalido");
      }

      return { sub: "507f1f77bcf86cd799439011" };
    });
    mockState.findUserById.mockReturnValue(
      createUserQuery({
        _id: "507f1f77bcf86cd799439011",
        name: "Admin Uno",
        email: "admin1@example.com",
        role: "admin",
        active: true
      })
    );

    const app = express();

    app.use(express.json());
    app.use("/api/auth", authRouter);
    app.use(notFoundHandler);
    app.use(errorHandler);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it("hace login, lee la sesion por cookie y permite logout", async () => {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "admin1@example.com",
        password: "password123"
      })
    });
    const loginPayload = await loginResponse.json();
    const cookieHeader = loginResponse.headers.get("set-cookie");

    expect(loginResponse.status).toBe(200);
    expect(loginPayload.data.user.email).toBe("admin1@example.com");
    expect(cookieHeader).toContain("clienttrack_session=signed-token");

    const sessionCookie = cookieHeader.split(";")[0];
    const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        cookie: sessionCookie
      }
    });
    const mePayload = await meResponse.json();

    expect(meResponse.status).toBe(200);
    expect(mePayload.data.user.email).toBe("admin1@example.com");

    const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        cookie: sessionCookie
      }
    });

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.headers.get("set-cookie")).toContain("clienttrack_session=");
  });

  it("rechaza acceso protegido si solo llega bearer token", async () => {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: "Bearer signed-token"
      }
    });
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error.code).toBe("auth_required");
  });
});
