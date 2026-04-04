import { ApiError } from "../http/apiError.js";
import { Communication } from "../models/Communication.js";
import { Institution } from "../models/Institution.js";
import { Opportunity } from "../models/Opportunity.js";
import { assertSmtpConfigured, sendSmtpEmail } from "./smtpService.js";
import {
  validateCommunicationEmailInput,
  validateCommunicationListFilters,
  validateCommunicationWhatsappInput,
  validateObjectId
} from "../validation/schemas.js";

async function resolveContext(institutionId, opportunityId) {
  const normalizedInstitutionId = validateObjectId(institutionId);
  let normalizedOpportunityId = null;

  const institution = await Institution.findById(normalizedInstitutionId).select("_id name").lean();

  if (!institution) {
    throw new ApiError(404, "La institucion no existe.", "institution_not_found");
  }

  if (opportunityId) {
    normalizedOpportunityId = validateObjectId(opportunityId);
    const opportunity = await Opportunity.findById(normalizedOpportunityId).select("_id institutionId").lean();

    if (!opportunity) {
      throw new ApiError(404, "La oportunidad no existe.", "opportunity_not_found");
    }

    if (opportunity.institutionId.toString() !== normalizedInstitutionId) {
      throw new ApiError(400, "La oportunidad no pertenece a la institucion indicada.", "communication_context_invalid");
    }
  }

  return {
    institutionId: normalizedInstitutionId,
    opportunityId: normalizedOpportunityId
  };
}

function normalizePhoneNumber(phone) {
  return phone.replace(/[^\d]/g, "");
}

function serializeCommunication(item) {
  return {
    ...item,
    _id: item._id.toString(),
    institutionId: item.institutionId?._id?.toString?.() ?? item.institutionId?.toString?.() ?? item.institutionId,
    opportunityId: item.opportunityId?._id?.toString?.() ?? item.opportunityId?.toString?.() ?? item.opportunityId,
    createdBy: item.createdBy?.name
      ? {
          id: item.createdBy._id?.toString?.() ?? "",
          name: item.createdBy.name,
          email: item.createdBy.email ?? ""
        }
      : item.createdBy
  };
}

export async function listCommunications(filters = {}) {
  const input = validateCommunicationListFilters(filters);
  const query = {};

  if (input.institutionId) {
    query.institutionId = input.institutionId;
  }

  if (input.opportunityId) {
    query.opportunityId = input.opportunityId;
  }

  const items = await Communication.find(query)
    .populate("createdBy", "name email")
    .sort({ sentAt: -1, createdAt: -1 })
    .limit(50)
    .lean();

  return items.map(serializeCommunication);
}

export async function sendCommunicationEmail(payload, actor) {
  assertSmtpConfigured();
  const input = validateCommunicationEmailInput(payload);
  const context = await resolveContext(input.institutionId, input.opportunityId);
  const info = await sendSmtpEmail({
    to: input.targetEmail,
    subject: input.subject,
    text: input.body
  });

  const communication = await Communication.create({
    ...context,
    createdBy: actor.id,
    channel: "email",
    direction: "outbound",
    status: "sent",
    subject: input.subject,
    body: input.body,
    targetName: input.targetName,
    targetRole: input.targetRole,
    targetEmail: input.targetEmail,
    provider: "smtp",
    externalId: info.messageId ?? "",
    sentAt: new Date()
  });

  const saved = await Communication.findById(communication._id).populate("createdBy", "name email").lean();
  return serializeCommunication(saved);
}

export async function createCommunicationWhatsappLink(payload, actor) {
  const input = validateCommunicationWhatsappInput(payload);
  const context = await resolveContext(input.institutionId, input.opportunityId);
  const normalizedPhone = normalizePhoneNumber(input.targetPhone);
  const url = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(input.body)}`;

  const communication = await Communication.create({
    ...context,
    createdBy: actor.id,
    channel: "whatsapp",
    direction: "outbound",
    status: "opened",
    body: input.body,
    targetName: input.targetName,
    targetRole: input.targetRole,
    targetPhone: normalizedPhone,
    provider: "click_to_chat",
    sentAt: new Date()
  });

  const saved = await Communication.findById(communication._id).populate("createdBy", "name email").lean();

  return {
    url,
    communication: serializeCommunication(saved)
  };
}
