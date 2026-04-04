import http from "node:http";
import express from "express";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { errorHandler, notFoundHandler } from "../server/http/errorHandler.js";
import { institutionRouter } from "../server/http/routes/institutionRoutes.js";
import { interactionRouter } from "../server/http/routes/interactionRoutes.js";
import { opportunityRouter } from "../server/http/routes/opportunityRoutes.js";
import { taskRouter } from "../server/http/routes/taskRoutes.js";

describe("filter route validation", () => {
  let server;
  let baseUrl = "";

  beforeEach(async () => {
    const app = express();

    app.use("/api/institutions", institutionRouter);
    app.use("/api/opportunities", opportunityRouter);
    app.use("/api/interactions", interactionRouter);
    app.use("/api/tasks", taskRouter);
    app.use(notFoundHandler);
    app.use(errorHandler);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it("devuelve 400 para filtros invalidos de instituciones", async () => {
    const response = await fetch(`${baseUrl}/api/institutions?responsibleId=bad-id`);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("validation_error");
  });

  it("devuelve 400 para filtros invalidos de oportunidades", async () => {
    const response = await fetch(`${baseUrl}/api/opportunities?status=nope`);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("validation_error");
  });

  it("devuelve 400 para filtros invalidos del kanban", async () => {
    const response = await fetch(`${baseUrl}/api/opportunities/kanban?responsibleId=bad-id`);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("validation_error");
  });

  it("devuelve 400 para filtros invalidos de tareas", async () => {
    const response = await fetch(`${baseUrl}/api/tasks?overdue=maybe`);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("validation_error");
  });

  it("devuelve 400 para filtros invalidos de interacciones", async () => {
    const response = await fetch(`${baseUrl}/api/interactions?institutionId=bad-id`);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("validation_error");
  });
});
