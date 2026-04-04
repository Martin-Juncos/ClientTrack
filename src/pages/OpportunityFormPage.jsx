import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { LoaderPanel } from "../components/ui/LoaderPanel.jsx";
import { Card } from "../components/ui/Card.jsx";
import { ErrorState } from "../components/ui/ErrorState.jsx";
import { OpportunityForm } from "../modules/opportunities/OpportunityForm.jsx";
import { useMetaOptions } from "../hooks/useMetaOptions.js";
import { createOpportunityForm } from "../lib/utils/forms.js";
import { opportunitiesApi } from "../lib/api/opportunitiesApi.js";
import { institutionsApi } from "../lib/api/institutionsApi.js";

export function OpportunityFormPage({ mode }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: meta, loading: loadingMeta, error: metaError, reload: reloadMeta } = useMetaOptions();
  const [institutions, setInstitutions] = useState([]);
  const [form, setForm] = useState(createOpportunityForm());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!meta) {
      return;
    }

    const preselectedInstitutionId = searchParams.get("institutionId");

    Promise.all([
      institutionsApi.list({}),
      mode === "edit" && id ? opportunitiesApi.getById(id) : Promise.resolve(null)
    ])
      .then(([institutionOptions, opportunity]) => {
        setInstitutions(institutionOptions);
        if (opportunity) {
          setForm(
            createOpportunityForm({
              ...opportunity,
              institutionId: opportunity.institutionId?._id ?? opportunity.institutionId,
              responsibleId: opportunity.responsibleId?._id ?? opportunity.responsibleId,
              estimatedBudget: opportunity.estimatedBudget ?? "",
              estimatedCloseDate: opportunity.estimatedCloseDate?.slice(0, 10) ?? ""
            })
          );
        } else if (preselectedInstitutionId) {
          setForm((current) => ({
            ...current,
            institutionId: preselectedInstitutionId,
            responsibleId: current.responsibleId || meta.users[0]?.id || ""
          }));
        } else {
          setForm((current) => ({
            ...current,
            responsibleId: current.responsibleId || meta.users[0]?.id || ""
          }));
        }
      })
      .catch((currentError) => setError(currentError.message))
      .finally(() => setLoading(false));
  }, [meta, id, mode, searchParams]);

  const catalogs = meta?.catalogs ?? null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const payload = {
        ...form,
        estimatedBudget: form.estimatedBudget === "" ? null : Number(form.estimatedBudget),
        estimatedCloseDate: form.estimatedCloseDate || null,
        winProbability: Number(form.winProbability)
      };

      const result = mode === "edit" ? await opportunitiesApi.update(id, payload) : await opportunitiesApi.create(payload);
      navigate(`/oportunidades/${result._id ?? result.id}`);
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  if (!loadingMeta && (!meta || !catalogs)) {
    return (
      <ErrorState
        title="No pudimos preparar este formulario"
        message={metaError?.message ?? "No pudimos cargar los catalogos base."}
        onAction={reloadMeta}
      />
    );
  }

  if (loadingMeta || loading) {
    return <LoaderPanel label="Preparando oportunidad..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Oportunidades"
        title={mode === "edit" ? "Editar oportunidad" : "Nueva oportunidad"}
        description="Define claramente la solucion ofrecida, el estado y la lectura comercial del caso."
      />
      {error ? (
        <Card>
          <p className="text-sm text-danger">{error}</p>
        </Card>
      ) : null}
      <OpportunityForm
        form={form}
        onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
        onSubmit={handleSubmit}
        submitLabel={mode === "edit" ? "Guardar cambios" : "Crear oportunidad"}
        institutions={institutions}
        users={meta.users}
        catalogs={catalogs}
      />
    </div>
  );
}
