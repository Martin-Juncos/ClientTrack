import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { LoaderPanel } from "../components/ui/LoaderPanel.jsx";
import { ErrorState } from "../components/ui/ErrorState.jsx";
import { InstitutionForm } from "../modules/institutions/InstitutionForm.jsx";
import { useMetaOptions } from "../hooks/useMetaOptions.js";
import { createInstitutionForm } from "../lib/utils/forms.js";
import { setValueAtPath } from "../lib/utils/objectPaths.js";
import { institutionsApi } from "../lib/api/institutionsApi.js";

function createEmptyAdditionalContact() {
  return createInstitutionForm().primaryContact;
}

function sanitizeContact(contact) {
  const { localId, _id, ...rest } = contact;
  return rest;
}

const fieldLabelMap = {
  name: "Institucion",
  type: "Tipo de institucion",
  city: "Ciudad",
  province: "Provincia / ubicacion",
  phone: "Telefono institucional",
  address: "Direccion institucional",
  leadSource: "Fuente del lead",
  responsibleId: "Responsable",
  notes: "Observaciones generales",
  "socials.linkedin": "Red institucional: LinkedIn",
  "socials.instagram": "Red institucional: Instagram",
  "socials.facebook": "Red institucional: Facebook",
  "socials.x": "Red institucional: X",
  "socials.tiktok": "Red institucional: TikTok",
  "primaryContact.firstName": "Contacto principal: Nombre",
  "primaryContact.lastName": "Contacto principal: Apellido",
  "primaryContact.role": "Contacto principal: Cargo",
  "primaryContact.phone": "Contacto principal: Telefono",
  "primaryContact.email": "Contacto principal: Email"
};

function normalizeIssuePath(path) {
  return path.map((segment) => String(segment)).join(".");
}

function getFriendlyFieldLabel(path) {
  if (fieldLabelMap[path]) {
    return fieldLabelMap[path];
  }

  const additionalContactMatch = path.match(/^additionalContacts\.(\d+)\.(.+)$/);

  if (additionalContactMatch) {
    const index = Number(additionalContactMatch[1]) + 1;
    const field = additionalContactMatch[2];
    const suffixMap = {
      firstName: "Nombre",
      lastName: "Apellido",
      role: "Cargo",
      phone: "Telefono",
      email: "Email"
    };

    return `Contacto adicional ${index}: ${suffixMap[field] ?? field}`;
  }

  return path;
}

function mapValidationDetails(details = []) {
  const fieldErrors = {};
  const fieldLabels = [];

  details.forEach((detail) => {
    const path = normalizeIssuePath(detail.path ?? []);

    if (!path || fieldErrors[path]) {
      return;
    }

    fieldErrors[path] = detail.message;
    fieldLabels.push(getFriendlyFieldLabel(path));
  });

  return {
    fieldErrors,
    summary:
      fieldLabels.length === 0
        ? ""
        : fieldLabels.length === 1
          ? `Revisa este campo antes de continuar: ${fieldLabels[0]}.`
          : `Revisa estos campos antes de continuar: ${fieldLabels.slice(0, 3).join(", ")}${fieldLabels.length > 3 ? "..." : ""}.`
  };
}

export function InstitutionFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: meta, loading: loadingMeta, error: metaError, reload: reloadMeta } = useMetaOptions();
  const [form, setForm] = useState(createInstitutionForm());
  const [loading, setLoading] = useState(mode === "edit");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (mode !== "edit" || !id) {
      return;
    }

    institutionsApi
      .getById(id)
      .then((institution) => {
        setForm(createInstitutionForm(institution));
        setFieldErrors({});
      })
      .catch((currentError) => setError(currentError.message))
      .finally(() => setLoading(false));
  }, [id, mode]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    try {
      const payload = {
        ...form,
        socials: form.socials,
        primaryContact: sanitizeContact(form.primaryContact),
        additionalContacts: form.additionalContacts.map(sanitizeContact)
      };

      const result = mode === "edit" ? await institutionsApi.update(id, payload) : await institutionsApi.create(payload);
      navigate(`/instituciones/${result._id ?? result.id}`);
    } catch (submitError) {
      if (Array.isArray(submitError.details)) {
        const mapped = mapValidationDetails(submitError.details);
        setFieldErrors(mapped.fieldErrors);
        setError(mapped.summary || submitError.message);
        return;
      }

      setError(submitError.message);
    }
  }

  function handleChange(path, value) {
    setForm((current) => setValueAtPath(current, path, value));
    setFieldErrors((current) => {
      if (!current[path]) {
        return current;
      }

      const next = { ...current };
      delete next[path];
      return next;
    });
  }

  function handleAdditionalContactChange(localId, field, value) {
    let errorPath = "";

    setForm((current) => ({
      ...current,
      additionalContacts: current.additionalContacts.map((contact, index) => {
        if (contact.localId !== localId) {
          return contact;
        }

        errorPath = `additionalContacts.${index}.${field}`;
        return { ...contact, [field]: value };
      })
    }));

    setFieldErrors((current) => {
      if (!errorPath || !current[errorPath]) {
        return current;
      }

      const next = { ...current };
      delete next[errorPath];
      return next;
    });
  }

  function handleAddContact() {
    setForm((current) => ({
      ...current,
      additionalContacts: [...current.additionalContacts, createEmptyAdditionalContact()]
    }));
  }

  function handleRemoveContact(localId) {
    setForm((current) => ({
      ...current,
      additionalContacts: current.additionalContacts.filter((contact) => contact.localId !== localId)
    }));
  }

  if (!loadingMeta && !meta) {
    return (
      <ErrorState
        title="No pudimos preparar este formulario"
        message={metaError?.message ?? "No pudimos cargar los catalogos base."}
        onAction={reloadMeta}
      />
    );
  }

  if (loadingMeta || loading) {
    return <LoaderPanel label="Preparando formulario..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Instituciones"
        title={mode === "edit" ? "Editar institucion" : "Nueva institucion"}
        description="Construye una ficha clara desde el primer contacto."
      />
      <InstitutionForm
        form={form}
        error={error}
        fieldErrors={fieldErrors}
        onChange={handleChange}
        onAdditionalContactChange={handleAdditionalContactChange}
        onAddContact={handleAddContact}
        onRemoveContact={handleRemoveContact}
        onSubmit={handleSubmit}
        submitLabel={mode === "edit" ? "Guardar cambios" : "Crear institucion"}
        institutionTypes={meta.catalogs.institutionTypes}
        users={meta.users}
      />
    </div>
  );
}
