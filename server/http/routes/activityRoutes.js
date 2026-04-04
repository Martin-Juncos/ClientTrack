import { Router } from "express";
import { asyncHandler } from "../asyncHandler.js";
import { sendOk } from "../response.js";
import { getRecentActivity } from "../../services/activityService.js";

export const activityRouter = Router();

activityRouter.get(
  "/recent",
  asyncHandler(async (_req, res) => {
    const activity = await getRecentActivity();
    return sendOk(res, activity);
  })
);
