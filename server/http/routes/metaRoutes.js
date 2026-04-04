import { Router } from "express";
import { asyncHandler } from "../asyncHandler.js";
import { sendOk } from "../response.js";
import { getMetaOptions } from "../../services/metaService.js";

export const metaRouter = Router();

metaRouter.get(
  "/options",
  asyncHandler(async (_req, res) => {
    const options = await getMetaOptions();
    return sendOk(res, options);
  })
);
