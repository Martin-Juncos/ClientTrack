import { Router } from "express";
import { asyncHandler } from "../asyncHandler.js";
import { sendOk } from "../response.js";
import { getDashboardSummary } from "../../services/dashboardService.js";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/summary",
  asyncHandler(async (_req, res) => {
    const summary = await getDashboardSummary();
    return sendOk(res, summary);
  })
);
