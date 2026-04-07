import mongoose from "mongoose";
import { ApiError } from "../http/apiError.js";
import { Institution } from "../models/Institution.js";
import { Interaction } from "../models/Interaction.js";
import { Opportunity } from "../models/Opportunity.js";
import { Task } from "../models/Task.js";
import {
  validateInstitutionFilters,
  validateInstitutionInput,
  validateObjectId
} from "../validation/schemas.js";
import { assertActiveResponsibleUser } from "./userService.js";
import { createSafeSearchRegex } from "../utils/search.js";

function buildSearchFilter(search) {
  const regex = createSafeSearchRegex(search);

  if (!regex) {
    return null;
  }

  return {
    $or: [
      { name: regex },
      { city: regex },
      { province: regex },
      { phone: regex },
      { address: regex },
      { leadSource: regex },
      { "primaryContact.firstName": regex },
      { "primaryContact.lastName": regex },
      { "primaryContact.email": regex },
      { "primaryContact.phone": regex },
      { "additionalContacts.firstName": regex },
      { "additionalContacts.lastName": regex },
      { "additionalContacts.email": regex },
      { "additionalContacts.phone": regex }
    ]
  };
}

export async function listInstitutions(filters = {}) {
  const input = validateInstitutionFilters(filters);
  const query = {};

  if (input.type) {
    query.type = input.type;
  }

  if (input.responsibleId) {
    query.responsibleId = validateObjectId(input.responsibleId);
  }

  const searchFilter = buildSearchFilter(input.search);

  if (searchFilter) {
    Object.assign(query, searchFilter);
  }

  return Institution.find(query)
    .populate("responsibleId", "name email")
    .sort({ updatedAt: -1 })
    .lean();
}

export async function getInstitutionById(id) {
  const institution = await Institution.findById(validateObjectId(id))
    .populate("responsibleId", "name email")
    .lean();

  if (!institution) {
    throw new ApiError(404, "La institucion no existe.", "institution_not_found");
  }

  return institution;
}

export async function createInstitution(payload) {
  const input = validateInstitutionInput(payload);
  await assertActiveResponsibleUser(input.responsibleId);
  return Institution.create(input);
}

export async function updateInstitution(id, payload) {
  const existing = await Institution.findById(validateObjectId(id));

  if (!existing) {
    throw new ApiError(404, "La institucion no existe.", "institution_not_found");
  }

  const input = validateInstitutionInput({
    ...existing.toObject(),
    ...payload,
    socials: {
      ...existing.socials?.toObject?.(),
      ...payload.socials
    },
    primaryContact: {
      ...existing.primaryContact?.toObject?.(),
      ...payload.primaryContact
    },
    additionalContacts:
      payload.additionalContacts ??
      existing.additionalContacts?.map((contact) => contact.toObject?.() ?? contact) ??
      []
  });

  await assertActiveResponsibleUser(input.responsibleId);
  existing.set(input);
  await existing.save();

  return existing;
}

export async function deleteInstitution(id) {
  const institutionId = validateObjectId(id);
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const institution = await Institution.findById(institutionId).session(session);

      if (!institution) {
        throw new ApiError(404, "La institucion no existe.", "institution_not_found");
      }

      const opportunities = await Opportunity.find({ institutionId })
        .session(session)
        .select("_id")
        .lean();
      const opportunityIds = opportunities.map((item) => item._id);

      await Interaction.deleteMany({ institutionId }).session(session);
      await Task.deleteMany({ institutionId }).session(session);

      if (opportunityIds.length > 0) {
        await Interaction.deleteMany({ opportunityId: { $in: opportunityIds } }).session(session);
        await Task.deleteMany({ opportunityId: { $in: opportunityIds } }).session(session);
      }

      await Opportunity.deleteMany({ institutionId }).session(session);
      await Institution.findByIdAndDelete(institutionId).session(session);
    });
  } finally {
    await session.endSession();
  }

  return { id: institutionId };
}
