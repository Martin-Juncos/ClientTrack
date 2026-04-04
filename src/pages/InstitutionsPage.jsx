import { useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaPhone, FaUserGroup } from "react-icons/fa6";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { FormField } from "../components/ui/FormField.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Select } from "../components/ui/Select.jsx";
import { Button } from "../components/ui/Button.jsx";
import { LoaderPanel } from "../components/ui/LoaderPanel.jsx";
import { ErrorState } from "../components/ui/ErrorState.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { institutionsApi } from "../lib/api/institutionsApi.js";
import { useMetaOptions } from "../hooks/useMetaOptions.js";
import { formatInstitutionType } from "../lib/utils/formatters.js";

export function InstitutionsPage() {
  const { data: meta, loading: loadingMeta, error: metaError, reload: reloadMeta } = useMetaOptions();
  const [filters, setFilters] = useState({ search: "", type: "", responsibleId: "" });
  const deferredSearch = useDeferredValue(filters.search);
  const { type, responsibleId } = filters;
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
    institutionsApi
      .list({ type, responsibleId, search: deferredSearch })
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
  }, [meta, type, responsibleId, deferredSearch]);

  if (loadingMeta) {
    return <LoaderPanel label="Cargando instituciones..." />;
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
    return <LoaderPanel label="Cargando instituciones..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Base comercial"
        title="Instituciones"
        description="Administra el origen del pipeline, el responsable y el contexto del contacto principal."
        actions={
          <Button as={Link} to="/instituciones/nueva">
            Nueva institucion
          </Button>
        }
      />

      <Card className="grid gap-4 md:grid-cols-3">
        <FormField label="Buscar">
          <Input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Institucion, contacto o email" />
        </FormField>
        <FormField label="Tipo">
          <Select value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}>
            <option value="">Todos</option>
            {meta.catalogs.institutionTypes.map((item) => (
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
        <EmptyState title="Sin instituciones" description="Empieza cargando la primera oportunidad de relacion comercial." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <Card key={item._id} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">{item.name}</p>
                  <p className="mt-1 text-sm text-subtle">{formatInstitutionType(item.type)}</p>
                </div>
                <Button as={Link} to={`/instituciones/${item._id}`} variant="secondary" size="sm">
                  Ver detalle
                </Button>
              </div>
              <div className="grid gap-3 text-sm text-subtle md:grid-cols-2">
                <p>Contacto: {item.primaryContact.firstName} {item.primaryContact.lastName}</p>
                <p className="flex items-center gap-2"><FaEnvelope className="h-3.5 w-3.5" />{item.primaryContact.email || "-"}</p>
                <p className="flex items-center gap-2"><FaPhone className="h-3.5 w-3.5" />{item.primaryContact.phone || "-"}</p>
                <p>Responsable: {item.responsibleId?.name ?? "-"}</p>
                <p>Ciudad: {item.city || "-"}</p>
                <p>Fuente: {item.leadSource || "-"}</p>
                <p className="flex items-center gap-2"><FaUserGroup className="h-3.5 w-3.5" />{item.additionalContacts?.length ?? 0} contactos extra</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
