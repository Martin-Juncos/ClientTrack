import { Router } from "express";
import { asyncHandler } from "../asyncHandler.js";
import { sendCreated, sendOk } from "../response.js";
import {
  createCommunicationWhatsappLink,
  listCommunications,
  sendCommunicationEmail
} from "../../services/communicationService.js";

export const communicationRouter = Router();

communicationRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await listCommunications(req.query);
    return sendOk(res, items);
  })
);

communicationRouter.post(
  "/email",
  asyncHandler(async (req, res) => {
    const created = await sendCommunicationEmail(req.body, req.user);
    return sendCreated(res, created);
  })
);

communicationRouter.post(
  "/whatsapp-link",
  asyncHandler(async (req, res) => {
    const result = await createCommunicationWhatsappLink(req.body, req.user);
    return sendCreated(res, result);
  })
);
