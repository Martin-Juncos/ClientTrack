import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaPhone,
  FaTiktok,
  FaLocationDot,
  FaUserGroup,
  FaWhatsapp,
  FaXTwitter
} from "react-icons/fa6";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { ConfirmationModal } from "../components/ui/ConfirmationModal.jsx";
import { LoaderPanel } from "../components/ui/LoaderPanel.jsx";
import { ErrorState } from "../components/ui/ErrorState.jsx";
import { institutionsApi } from "../lib/api/institutionsApi.js";
import { opportunitiesApi } from "../lib/api/opportunitiesApi.js";
import { formatInstitutionType, formatOpportunityState, formatSolutionType } from "../lib/utils/formatters.js";

const socialEntries = [
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedinIn },
  { key: "instagram", label: "Instagram", icon: FaInstagram },
  { key: "facebook", label: "Facebook", icon: FaFacebookF },
  { key: "x", label: "X", icon: FaXTwitter },
  { key: "tiktok", label: "TikTok", icon: FaTiktok }
];

function createWhatsappUrl(phone) {
  const normalizedPhone = String(phone ?? "").replace(/[^\d]/g, "");

  if (!normalizedPhone) {
    return "";
  }

  return `https://wa.me/${normalizedPhone}`;
}

function createGmailComposeUrl(email) {
  const normalizedEmail = String(email ?? "").trim();

  if (!normalizedEmail) {
    return "";
  }

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(normalizedEmail)}`;
}

export function InstitutionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [institution, setInstitution] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadInstitutionDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [institutionData, opportunitiesData] = await Promise.all([
        institutionsApi.getById(id),
        opportunitiesApi.list({ institutionId: id })
      ]);
      setInstitution(institutionData);
      setOpportunities(opportunitiesData);
    } catch (currentError) {
      setError(currentError.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInstitutionDetail();
  }, [loadInstitutionDetail]);

  function handleOpenDeleteModal() {
    setDeleteError("");
    setIsDeleteModalOpen(true);
  }

  function handleCloseDeleteModal() {
    if (isDeleting) {
      return;
    }

    setDeleteError("");
    setIsDeleteModalOpen(false);
  }

  async function handleDelete() {
    setDeleteError("");
    setIsDeleting(true);

    try {
      await institutionsApi.remove(id);
      navigate("/instituciones");
    } catch (currentError) {
      setDeleteError(currentError.message);
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return <LoaderPanel label="Cargando contexto de la institucion..." />;
  }

  if (error || !institution) {
    return <ErrorState message={error || "No pudimos cargar la institucion."} onAction={loadInstitutionDetail} />;
  }

  const visibleSocials = socialEntries.filter(({ key }) => institution.socials?.[key]);
  const opportunityCount = opportunities.length;
  const deleteDescription =
    opportunityCount > 0
      ? `Se eliminara ${institution.name}, ${opportunityCount} ${
          opportunityCount === 1 ? "oportunidad asociada" : "oportunidades asociadas"
        } y todos los seguimientos e interacciones vinculados. Esta accion no se puede deshacer.`
      : `Se eliminara ${institution.name} y todos los seguimientos e interacciones vinculados. Actualmente no tiene oportunidades asociadas. Esta accion no se puede deshacer.`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ficha institucional"
        title={institution.name}
        description="Unifica contacto principal, contexto base y oportunidades asociadas."
        actions={
          <>
            <Button as={Link} to={`/instituciones/${id}/editar`} variant="secondary">
              Editar
            </Button>
            <Button as={Link} to={`/oportunidades/nueva?institutionId=${id}`}>
              Nueva oportunidad
            </Button>
            <Button variant="ghost" onClick={handleOpenDeleteModal}>
              Eliminar
            </Button>
          </>
        }
      />

      <section className="space-y-6">
        <Card className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Datos generales</h2>
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-6">
              <dl className="grid gap-3 text-sm text-subtle sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.24em] text-subtle/80">Tipo</dt>
                  <dd className="mt-1">{formatInstitutionType(institution.type)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.24em] text-subtle/80">Responsable</dt>
                  <dd className="mt-1">{institution.responsibleId?.name ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.24em] text-subtle/80">Ciudad</dt>
                  <dd className="mt-1">{institution.city || "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.24em] text-subtle/80">Telefono institucional</dt>
                  <dd className="mt-1">{institution.phone || "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.24em] text-subtle/80">Direccion</dt>
                  <dd className="mt-1">{institution.address || "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.24em] text-subtle/80">Fuente</dt>
                  <dd className="mt-1">{institution.leadSource || "-"}</dd>
                </div>
              </dl>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Canales institucionales</p>
                <div className="mt-3 space-y-2 text-sm text-subtle">
                  <p className="flex items-center gap-2">
                    <FaPhone className="h-3.5 w-3.5 text-subtle" />
                    {institution.phone || "-"}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaLocationDot className="h-3.5 w-3.5 text-subtle" />
                    {institution.address || "-"}
                  </p>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-subtle">
                {institution.notes || "Sin observaciones generales."}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {institution.primaryContact.firstName} {institution.primaryContact.lastName}
                    </p>
                    <p className="mt-1 text-sm text-subtle">{institution.primaryContact.role || "Sin cargo cargado"}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {institution.primaryContact.email ? (
                      <Button
                        as="a"
                        href={createGmailComposeUrl(institution.primaryContact.email)}
                        target="_blank"
                        rel="noreferrer"
                        variant="secondary"
                        size="sm"
                      >
                        <FaEnvelope className="h-3.5 w-3.5" />
                        Email
                      </Button>
                    ) : (
                      <Button type="button" variant="secondary" size="sm" disabled>
                        <FaEnvelope className="h-3.5 w-3.5" />
                        Email
                      </Button>
                    )}
                    {institution.primaryContact.phone ? (
                      <Button
                        as="a"
                        href={createWhatsappUrl(institution.primaryContact.phone)}
                        target="_blank"
                        rel="noreferrer"
                        variant="secondary"
                        size="sm"
                      >
                        <FaWhatsapp className="h-3.5 w-3.5" />
                        WhatsApp
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm text-subtle">
                  <p className="flex items-center gap-2">
                    <FaEnvelope className="h-3.5 w-3.5 text-subtle" />
                    {institution.primaryContact.email || "-"}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaPhone className="h-3.5 w-3.5 text-subtle" />
                    {institution.primaryContact.phone || "-"}
                  </p>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2">
                  <FaUserGroup className="h-4 w-4 text-accent" />
                  <p className="text-sm font-semibold text-white">Contactos adicionales</p>
                </div>
                {institution.additionalContacts?.length ? (
                  <div className="mt-4 space-y-3">
                    {institution.additionalContacts.map((contact) => (
                      <article key={contact._id} className="rounded-2xl border border-white/10 bg-black/10 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {contact.firstName} {contact.lastName}
                            </p>
                            <p className="mt-1 text-xs text-subtle">{contact.role || "Sin cargo cargado"}</p>
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {contact.email ? (
                              <Button
                                as="a"
                                href={createGmailComposeUrl(contact.email)}
                                target="_blank"
                                rel="noreferrer"
                                variant="secondary"
                                size="sm"
                              >
                                <FaEnvelope className="h-3.5 w-3.5" />
                                Email
                              </Button>
                            ) : (
                              <Button type="button" variant="secondary" size="sm" disabled>
                                <FaEnvelope className="h-3.5 w-3.5" />
                                Email
                              </Button>
                            )}
                            {contact.phone ? (
                              <Button
                                as="a"
                                href={createWhatsappUrl(contact.phone)}
                                target="_blank"
                                rel="noreferrer"
                                variant="secondary"
                                size="sm"
                              >
                                <FaWhatsapp className="h-3.5 w-3.5" />
                                WhatsApp
                              </Button>
                            ) : null}
                          </div>
                        </div>
                        <div className="mt-3 space-y-1 text-xs text-subtle">
                          <p className="flex items-center gap-2">
                            <FaEnvelope className="h-3 w-3" />
                            {contact.email || "-"}
                          </p>
                          <p className="flex items-center gap-2">
                            <FaPhone className="h-3 w-3" />
                            {contact.phone || "-"}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-subtle">No se cargaron contactos secundarios.</p>
                )}
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Redes institucionales</p>
                {visibleSocials.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {visibleSocials.map(({ key, label, icon: Icon }) => (
                      <a
                        key={key}
                        href={institution.socials[key]}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/10 px-3 py-2 text-sm text-copy transition-all duration-300 hover:border-accent/30 hover:text-white"
                      >
                        <Icon className="h-3.5 w-3.5 text-accent" />
                        {label}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-subtle">No se cargaron redes institucionales.</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Oportunidades asociadas</h2>
          <div className="space-y-3">
            {opportunities.map((item) => (
              <article key={item._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{formatSolutionType(item.solutionType)}</p>
                    <p className="mt-1 text-xs text-subtle">{formatOpportunityState(item.status)}</p>
                  </div>
                  <Button as={Link} to={`/oportunidades/${item._id}`} variant="secondary" size="sm">
                    Abrir
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <ConfirmationModal
        open={isDeleteModalOpen}
        title="Eliminar institucion"
        description={deleteDescription}
        confirmLabel="Eliminar institucion"
        onConfirm={handleDelete}
        onCancel={handleCloseDeleteModal}
        loading={isDeleting}
        error={deleteError}
      />
    </div>
  );
}
