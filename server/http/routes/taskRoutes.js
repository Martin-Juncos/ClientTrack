import { Router } from "express";
import { asyncHandler } from "../asyncHandler.js";
import { sendCreated, sendOk } from "../response.js";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask
} from "../../services/taskService.js";

export const taskRouter = Router();

taskRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const tasks = await listTasks(req.query);
    return sendOk(res, tasks);
  })
);

taskRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const created = await createTask(req.body);
    return sendCreated(res, created);
  })
);

taskRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const updated = await updateTask(req.params.id, req.body);
    return sendOk(res, updated);
  })
);

taskRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const result = await deleteTask(req.params.id);
    return sendOk(res, result);
  })
);
