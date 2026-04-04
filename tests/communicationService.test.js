import { beforeEach, describe, expect, it, vi } from "vitest";

const mockState = vi.hoisted(() => ({
  env: {
    EMAIL_FROM: "ClientTrack <test@gmail.com>",
    smtp: {
      enabled: true,
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      user: "test@gmail.com",
      pass: "app-password",
      from: "ClientTrack <test@gmail.com>"
    }
  },
  verify: vi.fn(),
  sendMail: vi.fn(),
  createTransport: vi.fn(),
  findInstitutionById: vi.fn(),
  findOpportunityById: vi.fn(),
  createCommunication: vi.fn(),
  findCommunicationById: vi.fn()
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: mockState.createTransport
  }
}));

vi.mock("../server/config/env.js", () => ({
  env: mockState.env
}));

vi.mock("../server/models/Institution.js", () => ({
  Institution: {
    findById: mockState.findInstitutionById
  }
}));

vi.mock("../server/models/Opportunity.js", () => ({
  Opportunity: {
    findById: mockState.findOpportunityById
  }
}));

vi.mock("../server/models/Communication.js", () => ({
  Communication: {
    create: mockState.createCommunication,
    findById: mockState.findCommunicationById
  }
}));

function createQueryResult(value) {
  return {
    select() {
      return {
        lean: vi.fn().mockResolvedValue(value)
      };
    }
  };
}

describe("communication service", () => {
  const payload = {
    institutionId: "507f1f77bcf86cd799439011",
    opportunityId: "507f1f77bcf86cd799439012",
    targetName: "Ana Lopez",
    targetRole: "Directora",
    targetEmail: "ana@example.com",
    subject: "Seguimiento comercial",
    body: "Te comparto una propuesta resumida."
  };

  const actor = { id: "507f1f77bcf86cd799439099" };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockState.env.EMAIL_FROM = "ClientTrack <test@gmail.com>";
    mockState.env.smtp.enabled = true;
    mockState.env.smtp.host = "smtp.gmail.com";
    mockState.env.smtp.port = 465;
    mockState.env.smtp.secure = true;
    mockState.env.smtp.user = "test@gmail.com";
    mockState.env.smtp.pass = "app-password";
    mockState.env.smtp.from = "ClientTrack <test@gmail.com>";

    mockState.createTransport.mockReturnValue({
      verify: mockState.verify,
      sendMail: mockState.sendMail
    });

    mockState.verify.mockResolvedValue(true);
    mockState.sendMail.mockResolvedValue({
      messageId: "<message-id@example.com>",
      accepted: ["ana@example.com"],
      rejected: []
    });

    mockState.findInstitutionById.mockReturnValue(
      createQueryResult({
        _id: payload.institutionId,
        name: "Clinica Aurora"
      })
    );

    mockState.findOpportunityById.mockReturnValue(
      createQueryResult({
        _id: payload.opportunityId,
        institutionId: {
          toString() {
            return payload.institutionId;
          }
        }
      })
    );

    mockState.createCommunication.mockResolvedValue({ _id: "comm-1" });
    mockState.findCommunicationById.mockReturnValue({
      populate() {
        return {
          lean: vi.fn().mockResolvedValue({
            _id: "comm-1",
            institutionId: payload.institutionId,
            opportunityId: payload.opportunityId,
            createdBy: {
              _id: actor.id,
              name: "Admin Uno",
              email: "admin1@example.com"
            },
            channel: "email",
            direction: "outbound",
            status: "sent",
            subject: payload.subject,
            body: payload.body,
            targetName: payload.targetName,
            targetRole: payload.targetRole,
            targetEmail: payload.targetEmail,
            provider: "smtp",
            externalId: "<message-id@example.com>",
            sentAt: new Date("2026-04-03T12:00:00.000Z")
          })
        };
      }
    });
  });

  it("envia un email por SMTP y registra la comunicacion", async () => {
    const { sendCommunicationEmail } = await import("../server/services/communicationService.js");
    const result = await sendCommunicationEmail(payload, actor);

    expect(mockState.createTransport).toHaveBeenCalledWith({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "test@gmail.com",
        pass: "app-password"
      }
    });
    expect(mockState.verify).toHaveBeenCalled();
    expect(mockState.sendMail).toHaveBeenCalledWith({
      from: "ClientTrack <test@gmail.com>",
      to: "ana@example.com",
      subject: "Seguimiento comercial",
      text: "Te comparto una propuesta resumida."
    });
    expect(mockState.createCommunication).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "email",
        provider: "smtp",
        externalId: "<message-id@example.com>",
        targetEmail: "ana@example.com"
      })
    );
    expect(result.externalId).toBe("<message-id@example.com>");
  });

  it("devuelve un error operativo si falla la autenticacion SMTP", async () => {
    mockState.verify.mockRejectedValue({
      code: "EAUTH",
      message: "Invalid login"
    });

    const { sendCommunicationEmail } = await import("../server/services/communicationService.js");

    await expect(sendCommunicationEmail(payload, actor)).rejects.toMatchObject({
      statusCode: 503,
      code: "email_smtp_auth_failed"
    });
  });

  it("devuelve un error operativo si falla la conexion SMTP", async () => {
    mockState.verify.mockRejectedValue({
      code: "ECONNECTION",
      message: "Connection closed"
    });

    const { sendCommunicationEmail } = await import("../server/services/communicationService.js");

    await expect(sendCommunicationEmail(payload, actor)).rejects.toMatchObject({
      statusCode: 503,
      code: "email_smtp_connection_failed"
    });
  });

  it("devuelve un error claro si el remitente es rechazado", async () => {
    mockState.sendMail.mockRejectedValue({
      code: "EENVELOPE",
      command: "MAIL FROM",
      response: "550 sender rejected"
    });

    const { sendCommunicationEmail } = await import("../server/services/communicationService.js");

    await expect(sendCommunicationEmail(payload, actor)).rejects.toMatchObject({
      statusCode: 502,
      code: "email_sender_rejected"
    });
  });

  it("responde 503 cuando SMTP no esta configurado", async () => {
    mockState.env.EMAIL_FROM = undefined;
    mockState.env.smtp.enabled = false;
    mockState.env.smtp.from = "";

    const { sendCommunicationEmail } = await import("../server/services/communicationService.js");

    await expect(sendCommunicationEmail(payload, actor)).rejects.toMatchObject({
      statusCode: 503,
      code: "email_not_configured"
    });
    expect(mockState.createTransport).not.toHaveBeenCalled();
  });
});
