import { describe, expect, it } from "vitest";
import {
  validateCommunicationEmailInput,
  validateInstitutionInput,
  validateOpportunityInput,
  validateTaskInput
} from "../server/validation/schemas.js";

describe("validation schemas", () => {
  it("acepta una institucion valida", () => {
    const payload = validateInstitutionInput({
      name: "Clinica Aurora",
      type: "clinic",
      city: "San Rafael",
      province: "Mendoza",
      leadSource: "Referido",
      notes: "",
      responsibleId: "507f1f77bcf86cd799439011",
      socials: {
        linkedin: "https://linkedin.com/company/clinica-aurora"
      },
      primaryContact: {
        firstName: "Ana",
        lastName: "Lopez",
        role: "Directora",
        phone: "2604000000",
        email: ""
      },
      additionalContacts: [
        {
          firstName: "Lucia",
          lastName: "Sosa",
          role: "Coordinadora",
          phone: "",
          email: "lucia@example.com"
        }
      ]
    });

    expect(payload.name).toBe("Clinica Aurora");
    expect(payload.socials.linkedin).toContain("linkedin.com");
    expect(payload.additionalContacts).toHaveLength(1);
  });

  it("requiere contexto para tareas", () => {
    expect(() =>
      validateTaskInput({
        responsibleId: "507f1f77bcf86cd799439011",
        title: "Llamar",
        dueAt: "2026-04-10T10:00"
      })
    ).toThrow();
  });

  it("normaliza presupuesto y probabilidad en oportunidades", () => {
    const payload = validateOpportunityInput({
      institutionId: "507f1f77bcf86cd799439011",
      responsibleId: "507f1f77bcf86cd799439012",
      solutionType: "appointment_system",
      status: "new_lead",
      interestLevel: "warm",
      priority: "high",
      estimatedBudget: "250000",
      estimatedCloseDate: "2026-05-20",
      winProbability: "60"
    });

    expect(payload.estimatedBudget).toBe(250000);
    expect(payload.winProbability).toBe(60);
  });

  it("valida un email de comunicacion saliente", () => {
    const payload = validateCommunicationEmailInput({
      institutionId: "507f1f77bcf86cd799439011",
      opportunityId: "507f1f77bcf86cd799439012",
      targetName: "Ana Lopez",
      targetRole: "Directora",
      targetEmail: "ana@example.com",
      subject: "Seguimiento comercial",
      body: "Te comparto una propuesta resumida."
    });

    expect(payload.targetEmail).toBe("ana@example.com");
    expect(payload.subject).toBe("Seguimiento comercial");
  });
});
