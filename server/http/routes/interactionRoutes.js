import { Router } from "express";
import { asyncHandler } from "../asyncHandler.js";
import { sendCreated, sendOk } from "../response.js";
import {
  createInteraction,
  deleteInteraction,
  listInteractions,
  updateInteraction
} from "../../services/interactionService.js";

export const interactionRouter = Router();

interactionRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await listInteractions(req.query);
    return sendOk(res, items);
  })
);

interactionRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const created = await createInteraction(req.body, req.user);
    return sendCreated(res, created);
  })
);

interactionRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const updated = await updateInteraction(req.params.id, req.body);
    return sendOk(res, updated);
  })
);

interactionRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const result = await deleteInteraction(req.params.id);
    return sendOk(res, result);
  })
);
