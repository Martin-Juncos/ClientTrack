import { Router } from "express";
import { asyncHandler } from "../asyncHandler.js";
import { sendCreated, sendOk } from "../response.js";
import {
  createInstitution,
  deleteInstitution,
  getInstitutionById,
  listInstitutions,
  updateInstitution
} from "../../services/institutionService.js";

export const institutionRouter = Router();

institutionRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const data = await listInstitutions(req.query);
    return sendOk(res, data);
  })
);

institutionRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const created = await createInstitution(req.body);
    return sendCreated(res, created);
  })
);

institutionRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const institution = await getInstitutionById(req.params.id);
    return sendOk(res, institution);
  })
);

institutionRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const updated = await updateInstitution(req.params.id, req.body);
    return sendOk(res, updated);
  })
);

institutionRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const result = await deleteInstitution(req.params.id);
    return sendOk(res, result);
  })
);
