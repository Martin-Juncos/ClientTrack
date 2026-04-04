import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { ApiError } from "../http/apiError.js";

let transporter = null;

function createSmtpNotConfiguredError() {
  return new ApiError(
    503,
    "El envio de email no esta configurado. Revisa SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y EMAIL_FROM.",
    "email_not_configured",
    { provider: "smtp" }
  );
}

function getTransporter() {
  if (!env.smtp.enabled) {
    return null;
  }

  transporter ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass
    }
  });

  return transporter;
}

function mapSmtpError(error) {
  const code = String(error?.code || "").toUpperCase();
  const command = String(error?.command || "").toUpperCase();
  const providerMessage = String(error?.response || error?.message || "").trim();

  if (code === "EAUTH") {
    return new ApiError(
      503,
      "El servidor SMTP rechazo la autenticacion. Revisa SMTP_USER y SMTP_PASS.",
      "email_smtp_auth_failed",
      { provider: "smtp" }
    );
  }

  if (["ECONNECTION", "ESOCKET", "ETIMEDOUT", "EDNS"].includes(code)) {
    return new ApiError(
      503,
      "No se pudo conectar al servidor SMTP. Revisa SMTP_HOST, SMTP_PORT y SMTP_SECURE.",
      "email_smtp_connection_failed",
      { provider: "smtp" }
    );
  }

  if (code === "EENVELOPE" || command === "MAIL FROM" || /sender|from address|mail from|domain/i.test(providerMessage)) {
    return new ApiError(
      502,
      "El servidor SMTP rechazo el remitente. EMAIL_FROM debe usar una direccion valida y, si aplica, un dominio verificado.",
      "email_sender_rejected",
      { provider: "smtp" }
    );
  }

  if (command === "RCPT TO" || /recipient|rcpt to|mailbox unavailable|user unknown/i.test(providerMessage)) {
    return new ApiError(
      502,
      "El servidor SMTP rechazo el destinatario. Revisa el email del contacto.",
      "email_recipient_rejected",
      { provider: "smtp" }
    );
  }

  return new ApiError(
    502,
    "El servidor SMTP no acepto el envio. Revisa la configuracion del remitente o intenta nuevamente.",
    "email_provider_rejected",
    { provider: "smtp" }
  );
}

function assertAcceptedDelivery(info) {
  const accepted = Array.isArray(info?.accepted) ? info.accepted : [];
  const rejected = Array.isArray(info?.rejected) ? info.rejected : [];

  if (!info?.messageId || accepted.length === 0 || rejected.length > 0) {
    throw new ApiError(
      502,
      "No se pudo confirmar la aceptacion del email por parte del servidor SMTP.",
      "email_provider_unconfirmed",
      { provider: "smtp" }
    );
  }
}

export function assertSmtpConfigured() {
  if (!env.smtp.enabled) {
    throw createSmtpNotConfiguredError();
  }
}

export async function sendSmtpEmail({ to, subject, text }) {
  assertSmtpConfigured();
  const currentTransporter = getTransporter();

  try {
    await currentTransporter.verify();

    const info = await currentTransporter.sendMail({
      from: env.smtp.from,
      to,
      subject,
      text
    });

    assertAcceptedDelivery(info);
    return info;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw mapSmtpError(error);
  }
}
