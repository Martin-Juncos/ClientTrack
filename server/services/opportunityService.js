import mongoose from "mongoose";
import {
  activeOpportunityStateValues,
  isOpportunityClosed,
  opportunityStates
} from "../../shared/catalogs.js";
import { ApiError } from "../http/apiError.js";
import { Institution } from "../models/Institution.js";
import { Interaction } from "../models/Interaction.js";
import { Opportunity } from "../models/Opportunity.js";
import { Task } from "../models/Task.js";
import {
  validateKanbanFilters,
  validateObjectId,
  validateOpportunityFilters,
  validateOpportunityInput
} from "../validation/schemas.js";
import { assertActiveResponsibleUser } from "./userService.js";
import { createSafeSearchRegex } from "../utils/search.js";

async function resolveInstitutionSearch(search) {
  const regex = createSafeSearchRegex(search);

  if (!regex) {
    return null;
  }
  const institutions = await Institution.find({
    $or: [
      { name: regex },
      { phone: regex },
      { address: regex },
      { "primaryContact.firstName": regex },
      { "primaryContact.lastName": regex },
      { "primaryContact.email": regex },
      { "primaryContact.phone": regex },
      { "additionalContacts.firstName": regex },
      { "additionalContacts.lastName": regex },
      { "additionalContacts.email": regex },
      { "additionalContacts.phone": regex }
    ]
  })
    .select("_id")
    .lean();

  return institutions.map((institution) => institution._id);
}

export async function refreshOpportunityDerivedFields(opportunityId) {
  const normalizedId = validateObjectId(opportunityId);
  const [earliestTask, latestInteraction] = await Promise.all([
    Task.findOne({
      opportunityId: normalizedId,
      status: { $in: ["pending", "in_progress"] }
    })
      .sort({ dueAt: 1 })
      .lean(),
    Interaction.findOne({ opportunityId: normalizedId }).sort({ occurredAt: -1 }).lean()
  ]);

  const nextActionSnapshot = earliestTask
    ? {
        title: earliestTask.title,
        dueAt: earliestTask.dueAt,
        responsibleId: earliestTask.responsibleId,
        sourceType: "task",
        sourceId: earliestTask._id
      }
    : latestInteraction && (latestInteraction.nextActionTitle || latestInteraction.nextActionDueAt)
      ? {
          title: latestInteraction.nextActionTitle,
          dueAt: latestInteraction.nextActionDueAt,
          responsibleId: latestInteraction.createdBy,
          sourceType: "interaction",
          sourceId: latestInteraction._id
        }
      : {
          title: "",
          dueAt: null,
          responsibleId: null,
          sourceType: "",
          sourceId: null
        };

  await Opportunity.findByIdAndUpdate(normalizedId, {
    nextActionSnapshot,
    lastInteractionAt: latestInteraction?.occurredAt ?? null
  });
}

export async function listOpportunities(filters = {}) {
  const input = validateOpportunityFilters(filters);
  const query = {};

  if (input.status) {
    query.status = input.status;
  }

  if (input.priority) {
    query.priority = input.priority;
  }

  if (input.solutionType) {
    query.solutionType = input.solutionType;
  }

  if (input.responsibleId) {
    query.responsibleId = validateObjectId(input.responsibleId);
  }

  if (input.institutionId) {
    query.institutionId = validateObjectId(input.institutionId);
  }

  const institutionIds = await resolveInstitutionSearch(input.search);

  if (input.search) {
    if (query.institutionId) {
      const matchesSelectedInstitution = institutionIds?.some(
        (institutionId) => institutionId.toString() === query.institutionId
      );

      if (!matchesSelectedInstitution) {
        query.institutionId = { $in: [] };
      }
    } else {
      query.institutionId = {
        $in: institutionIds?.length ? institutionIds : []
      };
    }
  }

  return Opportunity.find(query)
    .populate("institutionId", "name type primaryContact")
    .populate("responsibleId", "name email")
    .sort({
      "nextActionSnapshot.dueAt": 1,
      updatedAt: -1
    })
    .lean();
}

export async function getOpportunityById(id) {
  const opportunity = await Opportunity.findById(validateObjectId(id))
    .populate("institutionId", "name type city province leadSource primaryContact additionalContacts")
    .populate("responsibleId", "name email")
    .lean();

  if (!opportunity) {
    throw new ApiError(404, "La oportunidad no existe.", "opportunity_not_found");
  }

  return opportunity;
}

export async function createOpportunity(payload) {
  const input = validateOpportunityInput(payload);
  const [institution] = await Promise.all([
    Institution.findById(input.institutionId).select("_id"),
    assertActiveResponsibleUser(input.responsibleId)
  ]);

  if (!institution) {
    throw new ApiError(404, "La institucion asociada no existe.", "institution_not_found");
  }

  return Opportunity.create({
    ...input,
    closedAt: isOpportunityClosed(input.status) ? new Date() : null
  });
}

export async function updateOpportunity(id, payload) {
  const opportunity = await Opportunity.findById(validateObjectId(id));

  if (!opportunity) {
    throw new ApiError(404, "La oportunidad no existe.", "opportunity_not_found");
  }

  const input = validateOpportunityInput({
    ...opportunity.toObject(),
    ...payload
  });
  const [institution] = await Promise.all([
    Institution.findById(input.institutionId).select("_id"),
    assertActiveResponsibleUser(input.responsibleId)
  ]);

  if (!institution) {
    throw new ApiError(404, "La institucion asociada no existe.", "institution_not_found");
  }

  opportunity.set({
    ...input,
    closedAt: isOpportunityClosed(input.status) ? opportunity.closedAt ?? new Date() : null
  });

  await opportunity.save();
  await refreshOpportunityDerivedFields(opportunity._id.toString());

  return opportunity;
}

export async function deleteOpportunity(id) {
  const opportunityId = validateObjectId(id);
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const opportunity = await Opportunity.findById(opportunityId).session(session);

      if (!opportunity) {
        throw new ApiError(404, "La oportunidad no existe.", "opportunity_not_found");
      }

      await Interaction.deleteMany({ opportunityId }).session(session);
      await Task.deleteMany({ opportunityId }).session(session);
      await Opportunity.findByIdAndDelete(opportunityId).session(session);
    });
  } finally {
    await session.endSession();
  }

  return { id: opportunityId };
}

export async function getKanbanBoard(filters = {}) {
  const input = validateKanbanFilters(filters);
  const opportunities = await listOpportunities(input);

  return opportunityStates.map((state) => ({
    ...state,
    items: opportunities.filter((opportunity) => opportunity.status === state.value)
  }));
}

export async function getDashboardHighlights() {
  const now = new Date();
  const staleThreshold = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14);

  const [hotOpportunities, staleOpportunities] = await Promise.all([
    Opportunity.find({
      status: { $in: activeOpportunityStateValues },
      $or: [
        { priority: "urgent" },
        { interestLevel: { $in: ["hot", "strategic"] } },
        { winProbability: { $gte: 70 } }
      ]
    })
      .populate("institutionId", "name primaryContact")
      .sort({ winProbability: -1, updatedAt: -1 })
      .limit(5)
      .lean(),
    Opportunity.find({
      status: { $in: activeOpportunityStateValues },
      $or: [{ lastInteractionAt: { $lt: staleThreshold } }, { lastInteractionAt: null }],
      updatedAt: { $lt: staleThreshold }
    })
      .populate("institutionId", "name primaryContact")
      .sort({ updatedAt: 1 })
      .limit(5)
      .lean()
  ]);

  return { hotOpportunities, staleOpportunities };
}
