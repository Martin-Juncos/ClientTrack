import { Router } from "express";
import { asyncHandler } from "../asyncHandler.js";
import { sendCreated, sendOk } from "../response.js";
import {
  createOpportunity,
  deleteOpportunity,
  getKanbanBoard,
  getOpportunityById,
  listOpportunities,
  updateOpportunity
} from "../../services/opportunityService.js";

export const opportunityRouter = Router();

opportunityRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await listOpportunities(req.query);
    return sendOk(res, items);
  })
);

opportunityRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const created = await createOpportunity(req.body);
    return sendCreated(res, created);
  })
);

opportunityRouter.get(
  "/kanban",
  asyncHandler(async (req, res) => {
    const board = await getKanbanBoard(req.query);
    return sendOk(res, board);
  })
);

opportunityRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const opportunity = await getOpportunityById(req.params.id);
    return sendOk(res, opportunity);
  })
);

opportunityRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const updated = await updateOpportunity(req.params.id, req.body);
    return sendOk(res, updated);
  })
);

opportunityRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const result = await deleteOpportunity(req.params.id);
    return sendOk(res, result);
  })
);
