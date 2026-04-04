function createSocialLinks(initial = {}) {
  return {
    linkedin: "",
    instagram: "",
    facebook: "",
    x: "",
    tiktok: "",
    ...initial
  };
}

function createContact(initial = {}) {
  return {
    localId:
      initial.localId ??
      initial._id ??
      `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    firstName: "",
    lastName: "",
    role: "",
    phone: "",
    email: "",
    ...initial
  };
}

export function createInstitutionForm(initial = {}) {
  const {
    primaryContact,
    additionalContacts,
    socials,
    ...rest
  } = initial;

  return {
    name: "",
    type: "clinic",
    city: "",
    province: "",
    leadSource: "",
    notes: "",
    responsibleId: "",
    ...rest,
    socials: createSocialLinks(socials),
    primaryContact: createContact(primaryContact),
    additionalContacts: Array.isArray(additionalContacts)
      ? additionalContacts.map((contact) => createContact(contact))
      : []
  };
}

export function createOpportunityForm(initial = {}) {
  return {
    institutionId: "",
    responsibleId: "",
    solutionType: "appointment_system",
    status: "new_lead",
    interestLevel: "warm",
    priority: "medium",
    estimatedBudget: "",
    estimatedCloseDate: "",
    winProbability: 25,
    needSummary: "",
    problemStatement: "",
    currentSystem: "",
    objections: "",
    commercialNotes: "",
    ...initial
  };
}

export function createInteractionForm(initial = {}) {
  return {
    opportunityId: "",
    type: "call",
    occurredAt: new Date().toISOString().slice(0, 16),
    summary: "",
    clientResponse: "",
    result: "",
    nextActionTitle: "",
    nextActionDueAt: "",
    internalNotes: "",
    ...initial
  };
}

export function createTaskForm(initial = {}) {
  return {
    institutionId: "",
    opportunityId: "",
    responsibleId: "",
    title: "",
    priority: "medium",
    dueAt: "",
    status: "pending",
    comment: "",
    ...initial
  };
}

export function createCommunicationForm(initial = {}) {
  return {
    channel: "email",
    targetName: "",
    targetRole: "",
    targetEmail: "",
    targetPhone: "",
    subject: "",
    body: "",
    ...initial
  };
}
