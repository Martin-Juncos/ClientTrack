import { ApiError } from "../http/apiError.js";
import { Interaction } from "../models/Interaction.js";
import { Opportunity } from "../models/Opportunity.js";
import { refreshOpportunityDerivedFields } from "./opportunityService.js";
import {
  validateInteractionFilters,
  validateInteractionInput,
  validateObjectId
} from "../validation/schemas.js";

async function resolveOpportunity(opportunityId) {
  const opportunity = await Opportunity.findById(validateObjectId(opportunityId))
    .select("_id institutionId")
    .lean();

  if (!opportunity) {
    throw new ApiError(404, "La oportunidad no existe.", "opportunity_not_found");
  }

  return opportunity;
}

export async function listInteractions(filters = {}) {
  const input = validateInteractionFilters(filters);
  const query = {};

  if (input.opportunityId) {
    query.opportunityId = validateObjectId(input.opportunityId);
  }

  if (input.institutionId) {
    query.institutionId = validateObjectId(input.institutionId);
  }

  return Interaction.find(query)
    .populate("createdBy", "name email")
    .sort({ occurredAt: -1 })
    .lean();
}

export async function createInteraction(payload, actor) {
  const input = validateInteractionInput(payload);
  const opportunity = await resolveOpportunity(input.opportunityId);

  const interaction = await Interaction.create({
    ...input,
    institutionId: opportunity.institutionId,
    occurredAt: input.occurredAt ?? new Date(),
    createdBy: actor.id
  });

  await refreshOpportunityDerivedFields(opportunity._id.toString());

  return interaction;
}

export async function updateInteraction(id, payload) {
  const interaction = await Interaction.findById(validateObjectId(id));

  if (!interaction) {
    throw new ApiError(404, "La interaccion no existe.", "interaction_not_found");
  }

  const input = validateInteractionInput({
    ...interaction.toObject(),
    ...payload,
    opportunityId: interaction.opportunityId.toString()
  });

  const opportunity = await resolveOpportunity(input.opportunityId);
  interaction.set({
    ...input,
    institutionId: opportunity.institutionId
  });
  await interaction.save();
  await refreshOpportunityDerivedFields(opportunity._id.toString());

  return interaction;
}

export async function deleteInteraction(id) {
  const interaction = await Interaction.findById(validateObjectId(id));

  if (!interaction) {
    throw new ApiError(404, "La interaccion no existe.", "interaction_not_found");
  }

  await Interaction.findByIdAndDelete(interaction._id);
  await refreshOpportunityDerivedFields(interaction.opportunityId.toString());

  return { id: interaction._id.toString() };
}
