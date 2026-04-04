export const institutionTypes = [
  { value: "clinic", label: "Clinica" },
  { value: "consulting_room", label: "Consultorio" },
  { value: "therapy_center", label: "Centro terapeutico" },
  { value: "education_institute", label: "Instituto educativo" },
  { value: "school", label: "Colegio" },
  { value: "academy", label: "Academia" },
  { value: "independent_professional", label: "Profesional independiente" },
  { value: "other", label: "Otro" }
];

export const opportunityStates = [
  { value: "new_lead", label: "Nuevo lead", color: "bg-slate-500/15 text-slate-200 ring-slate-400/40" },
  { value: "first_contact", label: "Primer contacto", color: "bg-sky-500/15 text-sky-200 ring-sky-400/40" },
  { value: "no_response", label: "Sin respuesta", color: "bg-amber-500/15 text-amber-200 ring-amber-400/40" },
  { value: "responded", label: "Respondio", color: "bg-cyan-500/15 text-cyan-200 ring-cyan-400/40" },
  { value: "interested", label: "Interesado", color: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/40" },
  { value: "discovery", label: "Relevamiento", color: "bg-indigo-500/15 text-indigo-200 ring-indigo-400/40" },
  { value: "interview_scheduled", label: "Entrevista agendada", color: "bg-blue-500/15 text-blue-200 ring-blue-400/40" },
  { value: "interview_completed", label: "Entrevista realizada", color: "bg-violet-500/15 text-violet-200 ring-violet-400/40" },
  { value: "proposal_preparation", label: "Propuesta en preparacion", color: "bg-fuchsia-500/15 text-fuchsia-200 ring-fuchsia-400/40" },
  { value: "proposal_sent", label: "Propuesta enviada", color: "bg-purple-500/15 text-purple-200 ring-purple-400/40" },
  { value: "negotiation", label: "Negociacion", color: "bg-orange-500/15 text-orange-100 ring-orange-400/40" },
  { value: "decision_pending", label: "Pendiente de decision", color: "bg-yellow-500/15 text-yellow-100 ring-yellow-400/40" },
  { value: "won", label: "Ganado", color: "bg-emerald-500/20 text-emerald-100 ring-emerald-300/40" },
  { value: "lost", label: "Perdido", color: "bg-rose-500/20 text-rose-100 ring-rose-300/40" },
  { value: "postponed", label: "Pospuesto", color: "bg-zinc-500/20 text-zinc-100 ring-zinc-300/40" }
];

export const activeOpportunityStateValues = opportunityStates
  .map((state) => state.value)
  .filter((state) => !["won", "lost"].includes(state));

export const interactionTypes = [
  { value: "call", label: "Llamada" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "in_person_meeting", label: "Reunion presencial" },
  { value: "video_call", label: "Videollamada" },
  { value: "interview", label: "Entrevista" },
  { value: "demo", label: "Demo" },
  { value: "proposal_sent", label: "Propuesta enviada" },
  { value: "follow_up", label: "Seguimiento" },
  { value: "no_response", label: "Sin respuesta" }
];

export const solutionTypes = [
  { value: "appointment_system", label: "Sistema de turnos" },
  { value: "admin_panel", label: "Panel administrativo" },
  { value: "professional_agenda", label: "Agenda profesional" },
  { value: "patient_follow_up", label: "Seguimiento de pacientes" },
  { value: "education_management", label: "Gestion educativa" },
  { value: "institutional_automation", label: "Automatizacion institucional" },
  { value: "custom_solution", label: "Solucion a medida" }
];

export const priorityOptions = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" }
];

export const interestLevels = [
  { value: "cold", label: "Frio" },
  { value: "warm", label: "Templado" },
  { value: "hot", label: "Caliente" },
  { value: "strategic", label: "Estrategico" }
];

export const taskStatuses = [
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En curso" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" }
];

export const catalogs = {
  institutionTypes,
  opportunityStates,
  interactionTypes,
  solutionTypes,
  priorityOptions,
  interestLevels,
  taskStatuses
};

export function findCatalogItem(catalog, value) {
  return catalog.find((item) => item.value === value) ?? null;
}

export function getCatalogLabel(catalog, value) {
  return findCatalogItem(catalog, value)?.label ?? value ?? "-";
}

export function isOpportunityClosed(status) {
  return ["won", "lost"].includes(status);
}

export function isTaskOpen(status) {
  return ["pending", "in_progress"].includes(status);
}
