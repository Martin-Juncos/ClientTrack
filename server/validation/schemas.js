import { z } from "zod";
import {
  institutionTypes,
  interestLevels,
  interactionTypes,
  opportunityStates,
  priorityOptions,
  solutionTypes,
  taskStatuses
} from "../../shared/catalogs.js";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Identificador invalido");
const queryValueOrUndefined = (value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  return value;
};
const optionalString = (max = 3000) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().max(max).optional().default("")
  );
const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z.union([z.string().url(), z.literal("")]).optional().default("")
);
const nullableNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return value;
}, z.number().nonnegative().nullable());

const nullableProbability = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return value;
}, z.number().min(0).max(100));

const nullableDate = z.preprocess((value) => {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}, z.date().nullable());
const searchFilterSchema = z.preprocess(
  queryValueOrUndefined,
  z.string().max(120, "La busqueda supera el largo permitido.").optional()
);
const optionalObjectIdFilter = z.preprocess(queryValueOrUndefined, objectIdSchema.optional());
const optionalBooleanFilter = z.preprocess(queryValueOrUndefined, z.enum(["true", "false"]).optional());
const optionalInstitutionTypeFilter = z.preprocess(
  queryValueOrUndefined,
  z.enum(institutionTypes.map((item) => item.value)).optional()
);
const optionalOpportunityStateFilter = z.preprocess(
  queryValueOrUndefined,
  z.enum(opportunityStates.map((item) => item.value)).optional()
);
const optionalSolutionTypeFilter = z.preprocess(
  queryValueOrUndefined,
  z.enum(solutionTypes.map((item) => item.value)).optional()
);
const optionalPriorityFilter = z.preprocess(
  queryValueOrUndefined,
  z.enum(priorityOptions.map((item) => item.value)).optional()
);
const optionalTaskStatusFilter = z.preprocess(
  queryValueOrUndefined,
  z.enum(taskStatuses.map((item) => item.value)).optional()
);

const communicationBaseSchema = z.object({
  institutionId: objectIdSchema,
  opportunityId: objectIdSchema.optional(),
  targetName: z.string().trim().min(1, "Indica el nombre del contacto."),
  targetRole: optionalString(120)
});

const contactInputSchema = z
  .object({
    firstName: z.string().trim().min(1, "Indica el nombre del contacto."),
    lastName: optionalString(120),
    role: optionalString(120),
    phone: optionalString(50),
    email: z
      .union([z.string().trim().email("Email invalido"), z.literal("")])
      .optional()
      .default("")
  })
  .refine((data) => Boolean(data.phone || data.email), {
    message: "Debes indicar al menos telefono o email del contacto.",
    path: ["phone"]
  });

const socialLinksInputSchema = z
  .object({
    linkedin: optionalUrl,
    instagram: optionalUrl,
    facebook: optionalUrl,
    x: optionalUrl,
    tiktok: optionalUrl
  })
  .default({});

export const institutionInputSchema = z
  .object({
    name: z.string().trim().min(2, "Indica el nombre de la institucion."),
    type: z.enum(institutionTypes.map((item) => item.value)),
    city: optionalString(120),
    province: optionalString(120),
    leadSource: optionalString(120),
    notes: optionalString(2000),
    responsibleId: objectIdSchema,
    socials: socialLinksInputSchema,
    primaryContact: contactInputSchema,
    additionalContacts: z.array(contactInputSchema).default([])
  });

export const opportunityInputSchema = z.object({
  institutionId: objectIdSchema,
  responsibleId: objectIdSchema,
  solutionType: z.enum(solutionTypes.map((item) => item.value)),
  status: z.enum(opportunityStates.map((item) => item.value)).default("new_lead"),
  interestLevel: z.enum(interestLevels.map((item) => item.value)).default("warm"),
  priority: z.enum(priorityOptions.map((item) => item.value)).default("medium"),
  estimatedBudget: nullableNumber.default(null),
  estimatedCloseDate: nullableDate.default(null),
  winProbability: nullableProbability.default(25),
  needSummary: optionalString(2000),
  problemStatement: optionalString(2000),
  currentSystem: optionalString(300),
  objections: optionalString(2000),
  commercialNotes: optionalString(2000)
});

export const interactionInputSchema = z.object({
  opportunityId: objectIdSchema,
  type: z.enum(interactionTypes.map((item) => item.value)),
  occurredAt: nullableDate.optional(),
  summary: z.string().trim().min(4, "Resume la interaccion."),
  clientResponse: optionalString(2000),
  result: optionalString(600),
  nextActionTitle: optionalString(240),
  nextActionDueAt: nullableDate.default(null),
  internalNotes: optionalString(2000)
});

export const taskInputSchema = z
  .object({
    institutionId: objectIdSchema.optional(),
    opportunityId: objectIdSchema.optional(),
    responsibleId: objectIdSchema,
    title: z.string().trim().min(3, "Indica la tarea o seguimiento."),
    priority: z.enum(priorityOptions.map((item) => item.value)).default("medium"),
    dueAt: nullableDate.refine((value) => Boolean(value), "Indica la fecha limite."),
    status: z.enum(taskStatuses.map((item) => item.value)).default("pending"),
    comment: optionalString(1000)
  })
  .refine((data) => Boolean(data.institutionId || data.opportunityId), {
    message: "La tarea debe vincularse a una institucion o a una oportunidad.",
    path: ["institutionId"]
  });

export const communicationEmailInputSchema = communicationBaseSchema.extend({
  targetEmail: z.string().trim().email("Email invalido"),
  subject: z.string().trim().min(3, "Indica el asunto del email."),
  body: z.string().trim().min(5, "Escribe el contenido del email.")
});

export const communicationWhatsappInputSchema = communicationBaseSchema.extend({
  targetPhone: z.string().trim().min(6, "Indica un telefono valido."),
  body: z.string().trim().min(3, "Escribe el mensaje de WhatsApp.")
});

export const communicationListFiltersSchema = z.object({
  institutionId: objectIdSchema.optional(),
  opportunityId: objectIdSchema.optional()
});
export const institutionListFiltersSchema = z.object({
  type: optionalInstitutionTypeFilter,
  responsibleId: optionalObjectIdFilter,
  search: searchFilterSchema
});
export const opportunityListFiltersSchema = z.object({
  status: optionalOpportunityStateFilter,
  priority: optionalPriorityFilter,
  solutionType: optionalSolutionTypeFilter,
  responsibleId: optionalObjectIdFilter,
  institutionId: optionalObjectIdFilter,
  search: searchFilterSchema
});
export const kanbanFiltersSchema = z.object({
  responsibleId: optionalObjectIdFilter,
  search: searchFilterSchema
});
export const taskListFiltersSchema = z.object({
  status: optionalTaskStatusFilter,
  priority: optionalPriorityFilter,
  responsibleId: optionalObjectIdFilter,
  opportunityId: optionalObjectIdFilter,
  institutionId: optionalObjectIdFilter,
  overdue: optionalBooleanFilter
});
export const interactionListFiltersSchema = z.object({
  opportunityId: optionalObjectIdFilter,
  institutionId: optionalObjectIdFilter
});

export function validateInstitutionInput(payload) {
  return institutionInputSchema.parse(payload);
}

export function validateOpportunityInput(payload) {
  return opportunityInputSchema.parse(payload);
}

export function validateInteractionInput(payload) {
  return interactionInputSchema.parse(payload);
}

export function validateTaskInput(payload) {
  return taskInputSchema.parse(payload);
}

export function validateCommunicationEmailInput(payload) {
  return communicationEmailInputSchema.parse(payload);
}

export function validateCommunicationWhatsappInput(payload) {
  return communicationWhatsappInputSchema.parse(payload);
}

export function validateCommunicationListFilters(payload) {
  return communicationListFiltersSchema.parse(payload);
}

export function validateInstitutionFilters(payload) {
  return institutionListFiltersSchema.parse(payload);
}

export function validateOpportunityFilters(payload) {
  return opportunityListFiltersSchema.parse(payload);
}

export function validateKanbanFilters(payload) {
  return kanbanFiltersSchema.parse(payload);
}

export function validateTaskFilters(payload) {
  return taskListFiltersSchema.parse(payload);
}

export function validateInteractionFilters(payload) {
  return interactionListFiltersSchema.parse(payload);
}

export function validateObjectId(value) {
  return objectIdSchema.parse(value);
}
