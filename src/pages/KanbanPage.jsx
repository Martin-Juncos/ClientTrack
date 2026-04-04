import { useDeferredValue, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { FormField } from "../components/ui/FormField.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Select } from "../components/ui/Select.jsx";
import { LoaderPanel } from "../components/ui/LoaderPanel.jsx";
import { ErrorState } from "../components/ui/ErrorState.jsx";
import { KanbanBoard } from "../modules/opportunities/KanbanBoard.jsx";
import { useMetaOptions } from "../hooks/useMetaOptions.js";
import { opportunitiesApi } from "../lib/api/opportunitiesApi.js";

export function KanbanPage() {
  const navigate = useNavigate();
  const { data: meta, loading: loadingMeta, error: metaError, reload: reloadMeta } = useMetaOptions();
  const [filters, setFilters] = useState({ search: "", responsibleId: "" });
  const deferredSearch = useDeferredValue(filters.search);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!meta) {
      return;
    }

    let isActive = true;
    setLoading(true);
    setError("");
    opportunitiesApi
      .kanban({ search: deferredSearch, responsibleId: filters.responsibleId })
      .then((result) => {
        if (isActive) {
          setColumns(result);
        }
      })
      .catch((currentError) => {
        if (isActive) {
          setError(currentError.message);
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [meta, deferredSearch, filters.responsibleId]);

  if (loadingMeta) {
    return <LoaderPanel label="Armando pipeline kanban..." />;
  }

  if (!meta) {
    return (
      <ErrorState
        title="No pudimos preparar esta vista"
        message={metaError?.message ?? "No pudimos cargar los catalogos base."}
        onAction={reloadMeta}
      />
    );
  }

  if (loading) {
    return <LoaderPanel label="Armando pipeline kanban..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pipeline visual"
        title="Kanban comercial"
        description="Lee el flujo de negocio de un vistazo y abre cada oportunidad en contexto."
      />
      <Card className="grid gap-4 md:grid-cols-2">
        <FormField label="Buscar">
          <Input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Institucion o contacto" />
        </FormField>
        <FormField label="Responsable">
          <Select value={filters.responsibleId} onChange={(event) => setFilters((current) => ({ ...current, responsibleId: event.target.value }))}>
            <option value="">Todos</option>
            {meta.users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
        </FormField>
      </Card>
      <KanbanBoard columns={columns} onOpen={(opportunityId) => navigate(`/oportunidades/${opportunityId}`)} />
    </div>
  );
}
