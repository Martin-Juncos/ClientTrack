import { useCallback, useEffect, useMemo, useState } from "react";
import { FaEnvelope, FaWhatsapp } from "react-icons/fa6";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { FormField } from "../../components/ui/FormField.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { LoaderPanel } from "../../components/ui/LoaderPanel.jsx";
import { communicationsApi } from "../../lib/api/communicationsApi.js";
import { createCommunicationForm } from "../../lib/utils/forms.js";
import { formatDateTime } from "../../lib/utils/formatters.js";

function getContactLabel(contact) {
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ").trim();
  return fullName || contact.name || "Contacto sin nombre";
}

function getStatusLabel(item) {
  if (item.status === "opened") {
    return item.channel === "email" ? "draft" : "opened";
  }

  return item.status;
}

export function CommunicationPanel({
  institutionId,
  opportunityId,
  contacts,
  composerTitle = "Comunicaciones",
  composerDescription = "Escribe, envia y registra cada comunicacion saliente.",
  selectedContactId,
  preferredChannel = "email",
  onSelectedContactChange
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(createCommunicationForm());

  const contactOptions = useMemo(
    () =>
      contacts.map((contact, index) => ({
        id: contact.id ?? contact._id ?? `contact-${index}`,
        label: getContactLabel(contact),
        role: contact.role || "",
        email: contact.email || "",
        phone: contact.phone || ""
      })),
    [contacts]
  );

  const applySelectedContact = useCallback(
    (contactId, preferredChannel = "email") => {
      const nextContact = contactOptions.find((item) => item.id === contactId);

      if (!nextContact) {
        return;
      }

      onSelectedContactChange?.(contactId);
      setSubmitError("");
      setSuccessMessage("");
      setForm((current) =>
        createCommunicationForm({
          ...current,
          channel: preferredChannel,
          targetName: nextContact.label,
          targetRole: nextContact.role,
          targetEmail: nextContact.email,
          targetPhone: nextContact.phone
        })
      );
    },
    [contactOptions, onSelectedContactChange]
  );

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const history = await communicationsApi.list({ institutionId, opportunityId });
      setItems(history);
    } catch (currentError) {
      setError(currentError.message);
    } finally {
      setLoading(false);
    }
  }, [institutionId, opportunityId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (selectedContactId) {
      applySelectedContact(selectedContactId, preferredChannel);
      return;
    }

    if (!form.targetName && contactOptions[0]) {
      applySelectedContact(contactOptions[0].id);
    }
  }, [applySelectedContact, contactOptions, form.targetName, preferredChannel, selectedContactId]);

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    try {
      await communicationsApi.sendEmail({
        institutionId,
        opportunityId: opportunityId || undefined,
        targetName: form.targetName,
        targetRole: form.targetRole,
        targetEmail: form.targetEmail,
        subject: form.subject,
        body: form.body
      });
      setSuccessMessage("Email enviado y registrado en la ficha.");
      setForm((current) => createCommunicationForm({ ...current, body: "", subject: "" }));
      await loadHistory();
    } catch (currentError) {
      setSubmitError(currentError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWhatsappClick() {
    setSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    try {
      const result = await communicationsApi.createWhatsappLink({
        institutionId,
        opportunityId: opportunityId || undefined,
        targetName: form.targetName,
        targetRole: form.targetRole,
        targetPhone: form.targetPhone,
        body: form.body
      });
      window.open(result.url, "_blank", "noopener,noreferrer");
      setSuccessMessage("Acceso a WhatsApp generado y registrado.");
      await loadHistory();
    } catch (currentError) {
      setSubmitError(currentError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{composerTitle}</h2>
          <p className="mt-1 text-sm text-subtle">{composerDescription}</p>
        </div>

        <form className="space-y-4" onSubmit={handleEmailSubmit}>
          <FormField label="Contacto">
            <Select
              value={selectedContactId || ""}
              disabled={contactOptions.length === 0}
              onChange={(event) => applySelectedContact(event.target.value)}
            >
              {contactOptions.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.label}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Email">
              <Input
                value={form.targetEmail}
                onChange={(event) => setForm((current) => ({ ...current, targetEmail: event.target.value }))}
                placeholder="contacto@institucion.com"
              />
            </FormField>
            <FormField label="Telefono">
              <Input
                value={form.targetPhone}
                onChange={(event) => setForm((current) => ({ ...current, targetPhone: event.target.value }))}
                placeholder="54911..."
              />
            </FormField>
          </div>

          <FormField label="Asunto" hint="Solo se usa para email.">
            <Input
              value={form.subject}
              onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
              placeholder="Seguimiento comercial ClientTrack"
            />
          </FormField>

          <FormField label="Mensaje">
            <Textarea
              value={form.body}
              onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
              placeholder="Escribe un mensaje claro y accionable."
            />
          </FormField>

          {submitError ? <p className="text-sm text-danger">{submitError}</p> : null}
          {successMessage ? <p className="text-sm text-success">{successMessage}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={submitting || contactOptions.length === 0 || !form.targetEmail || !form.subject || !form.body}
            >
              <FaEnvelope className="h-3.5 w-3.5" />
              Enviar email
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={submitting || contactOptions.length === 0 || !form.targetPhone || !form.body}
              onClick={handleWhatsappClick}
            >
              <FaWhatsapp className="h-3.5 w-3.5" />
              Abrir WhatsApp
            </Button>
          </div>
        </form>

        <div className="border-t border-white/10 pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Historial registrado</h3>
            <Button size="sm" variant="ghost" onClick={loadHistory}>
              Actualizar
            </Button>
          </div>

          {loading ? (
            <LoaderPanel label="Cargando comunicaciones..." />
          ) : error ? (
            <p className="text-sm text-danger">{error}</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-subtle">Todavia no hay comunicaciones registradas.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <article key={item._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.channel === "email" ? "Email" : "WhatsApp"} a {item.targetName || item.targetEmail || item.targetPhone}
                      </p>
                      <p className="mt-1 text-xs text-subtle">
                        {item.createdBy?.name ?? "Sin usuario"} - {formatDateTime(item.sentAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-accent/80">
                      {getStatusLabel(item)}
                    </span>
                  </div>
                  {item.subject ? <p className="mt-3 text-sm text-white">{item.subject}</p> : null}
                  <p className="mt-2 text-sm text-subtle whitespace-pre-wrap">{item.body}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
