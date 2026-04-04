import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { FormField } from "../components/ui/FormField.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Button } from "../components/ui/Button.jsx";
import { LoaderPanel } from "../components/ui/LoaderPanel.jsx";
import { ErrorState } from "../components/ui/ErrorState.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { opportunitiesApi } from "../lib/api/opportunitiesApi.js";
import { useMetaOptions } from "../hooks/useMetaOptions.js";
import {
  formatInterest,
  formatOpportunityState,
  formatPriority,
  formatSolutionType
} from "../lib/utils/formatters.js";

export function OpportunitiesPage() {
  const { data: meta, loading: loadingMeta, error: metaError, reload: reloadMeta } = useMetaOptions();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    responsibleId: ""
  });
  const deferredSearch = useDeferredValue(filters.search);
  const { status, priority, responsibleId } = filters;
  const [items, setItems] = useState([]);
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
      .list({ status, priority, responsibleId, search: deferredSearch })
      .then((result) => {
        if (isActive) {
          setItems(result);
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
  }, [meta, status, priority, responsibleId, deferredSearch]);

  if (loadingMeta) {
    return <LoaderPanel label="Cargando oportunidades..." />;
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
    return <LoaderPanel label="Cargando oportunidades..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pipeline activo"
        title="Oportunidades"
        description="Supervisa cada caso consultivo con contexto comercial, prioridad y proxima accion."
        actions={
          <Button as={Link} to="/oportunidades/nueva">
            Nueva oportunidad
          </Button>
        }
      />

      <Card className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FormField label="Buscar">
          <Input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Institucion o contacto" />
        </FormField>
        <FormField label="Estado">
          <Select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            <option value="">Todos</option>
            {meta.catalogs.opportunityStates.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Prioridad">
          <Select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}>
            <option value="">Todas</option>
            {meta.catalogs.priorityOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
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

      {items.length === 0 ? (
        <EmptyState title="Sin oportunidades" description="Carga la primera oportunidad para empezar a mover el pipeline." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <Card key={item._id} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">{item.institutionId?.name}</p>
                  <p className="mt-1 text-sm text-subtle">{formatSolutionType(item.solutionType)}</p>
                </div>
                <Button as={Link} to={`/oportunidades/${item._id}`} variant="secondary" size="sm">
                  Abrir
                </Button>
              </div>
              <div className="grid gap-3 text-sm text-subtle md:grid-cols-2">
                <p>Estado: {formatOpportunityState(item.status)}</p>
                <p>Prioridad: {formatPriority(item.priority)}</p>
                <p>Interes: {formatInterest(item.interestLevel)}</p>
                <p>Responsable: {item.responsibleId?.name ?? "-"}</p>
                <p>Proxima accion: {item.nextActionSnapshot?.title || "-"}</p>
                <p>Probabilidad: {item.winProbability}%</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
