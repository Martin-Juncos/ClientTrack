import { ApiError } from "../http/apiError.js";
import { Institution } from "../models/Institution.js";
import { Opportunity } from "../models/Opportunity.js";
import { Task } from "../models/Task.js";
import { refreshOpportunityDerivedFields } from "./opportunityService.js";
import { assertActiveResponsibleUser } from "./userService.js";
import { validateObjectId, validateTaskFilters, validateTaskInput } from "../validation/schemas.js";

async function resolveLinkedEntities(input) {
  const institutionId = input.institutionId ? validateObjectId(input.institutionId) : null;
  const opportunityId = input.opportunityId ? validateObjectId(input.opportunityId) : null;

  if (opportunityId) {
    const opportunity = await Opportunity.findById(opportunityId).select("_id institutionId").lean();

    if (!opportunity) {
      throw new ApiError(404, "La oportunidad no existe.", "opportunity_not_found");
    }

    return {
      institutionId: opportunity.institutionId,
      opportunityId: opportunity._id
    };
  }

  if (institutionId) {
    const institution = await Institution.findById(institutionId).select("_id").lean();

    if (!institution) {
      throw new ApiError(404, "La institucion no existe.", "institution_not_found");
    }

    return {
      institutionId,
      opportunityId: null
    };
  }

  throw new ApiError(400, "La tarea necesita una institucion o una oportunidad.", "task_context_required");
}

export async function listTasks(filters = {}) {
  const input = validateTaskFilters(filters);
  const query = {};

  if (input.status) {
    query.status = input.status;
  }

  if (input.priority) {
    query.priority = input.priority;
  }

  if (input.responsibleId) {
    query.responsibleId = validateObjectId(input.responsibleId);
  }

  if (input.opportunityId) {
    query.opportunityId = validateObjectId(input.opportunityId);
  }

  if (input.institutionId) {
    query.institutionId = validateObjectId(input.institutionId);
  }

  if (input.overdue === "true") {
    query.status = { $in: ["pending", "in_progress"] };
    query.dueAt = { $lt: new Date() };
  }

  return Task.find(query)
    .populate("institutionId", "name type primaryContact")
    .populate("opportunityId", "solutionType status")
    .populate("responsibleId", "name email")
    .sort({ dueAt: 1 })
    .lean();
}

export async function createTask(payload) {
  const input = validateTaskInput(payload);
  await assertActiveResponsibleUser(input.responsibleId);
  const linked = await resolveLinkedEntities(input);

  const task = await Task.create({
    ...input,
    ...linked,
    dueAt: input.dueAt
  });

  if (linked.opportunityId) {
    await refreshOpportunityDerivedFields(linked.opportunityId.toString());
  }

  return task;
}

export async function updateTask(id, payload) {
  const task = await Task.findById(validateObjectId(id));

  if (!task) {
    throw new ApiError(404, "La tarea no existe.", "task_not_found");
  }

  const input = validateTaskInput({
    ...task.toObject(),
    ...payload,
    institutionId: payload.institutionId ?? task.institutionId?.toString(),
    opportunityId: payload.opportunityId ?? task.opportunityId?.toString() ?? undefined
  });
  await assertActiveResponsibleUser(input.responsibleId);
  const linked = await resolveLinkedEntities(input);
  const previousOpportunityId = task.opportunityId?.toString() ?? null;

  task.set({
    ...input,
    ...linked
  });

  await task.save();

  if (previousOpportunityId) {
    await refreshOpportunityDerivedFields(previousOpportunityId);
  }

  if (linked.opportunityId) {
    await refreshOpportunityDerivedFields(linked.opportunityId.toString());
  }

  return task;
}

export async function deleteTask(id) {
  const task = await Task.findById(validateObjectId(id));

  if (!task) {
    throw new ApiError(404, "La tarea no existe.", "task_not_found");
  }

  const opportunityId = task.opportunityId?.toString() ?? null;
  await Task.findByIdAndDelete(task._id);

  if (opportunityId) {
    await refreshOpportunityDerivedFields(opportunityId);
  }

  return { id: task._id.toString() };
}
