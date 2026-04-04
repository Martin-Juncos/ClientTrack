import express from "express";
import { connectDb, ensureDbReady } from "./db/connectDb.js";
import { requireAuth } from "./auth/requireAuth.js";
import { verifyRequestOrigin } from "./auth/verifyRequestOrigin.js";
import { asyncHandler } from "./http/asyncHandler.js";
import { ApiError } from "./http/apiError.js";
import { errorHandler, notFoundHandler } from "./http/errorHandler.js";
import { activityRouter } from "./http/routes/activityRoutes.js";
import { authRouter } from "./http/routes/authRoutes.js";
import { communicationRouter } from "./http/routes/communicationRoutes.js";
import { dashboardRouter } from "./http/routes/dashboardRoutes.js";
import { institutionRouter } from "./http/routes/institutionRoutes.js";
import { interactionRouter } from "./http/routes/interactionRoutes.js";
import { metaRouter } from "./http/routes/metaRoutes.js";
import { opportunityRouter } from "./http/routes/opportunityRoutes.js";
import { taskRouter } from "./http/routes/taskRoutes.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok"
    }
  });
});

app.get(
  "/api/ready",
  asyncHandler(async (_req, res) => {
    try {
      await ensureDbReady();
    } catch {
      throw new ApiError(
        503,
        "La API no pudo validar conectividad con MongoDB.",
        "service_unavailable"
      );
    }

    res.json({
      success: true,
      data: {
        status: "ready"
      }
    });
  })
);

app.use(
  "/api",
  asyncHandler(async (_req, _res, next) => {
    await connectDb();
    next();
  })
);

app.use("/api", verifyRequestOrigin);
app.use("/api/auth", authRouter);
app.use("/api", requireAuth);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/activity", activityRouter);
app.use("/api/communications", communicationRouter);
app.use("/api/meta", metaRouter);
app.use("/api/institutions", institutionRouter);
app.use("/api/opportunities", opportunityRouter);
app.use("/api/interactions", interactionRouter);
app.use("/api/tasks", taskRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
