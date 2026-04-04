import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { LoaderPanel } from "../components/ui/LoaderPanel.jsx";
import { Card } from "../components/ui/Card.jsx";
import { ErrorState } from "../components/ui/ErrorState.jsx";
import { FormField } from "../components/ui/FormField.jsx";
import { Select } from "../components/ui/Select.jsx";
import { TaskComposer } from "../modules/tasks/TaskComposer.jsx";
import { useMetaOptions } from "../hooks/useMetaOptions.js";
import { createTaskForm } from "../lib/utils/forms.js";
import { tasksApi } from "../lib/api/tasksApi.js";
import { institutionsApi } from "../lib/api/institutionsApi.js";
import { opportunitiesApi } from "../lib/api/opportunitiesApi.js";

export function TasksPage() {
  const { data: meta, loading: loadingMeta, error: metaError, reload: reloadMeta } = useMetaOptions();
  const [tasks, setTasks] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [form, setForm] = useState(createTaskForm());
  const [filters, setFilters] = useState({ status: "", overdue: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const loadPage = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [taskItems, institutionItems, opportunityItems] = await Promise.all([
        tasksApi.list(filters),
        institutionsApi.list({}),
        opportunitiesApi.list({})
      ]);

      setTasks(taskItems);
      setInstitutions(institutionItems);
      setOpportunities(opportunityItems);
    } catch (currentError) {
      setError(currentError.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (!meta) {
      return;
    }

    loadPage()
      .then(() => {
        setForm((current) => ({
          ...current,
          responsibleId: current.responsibleId || meta.users[0]?.id || ""
        }));
      });
  }, [meta, loadPage]);

  const opportunityOptions = opportunities.filter(
    (item) => !form.institutionId || item.institutionId?._id === form.institutionId
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setActionError("");

    try {
      await tasksApi.create({
        ...form,
        dueAt: form.dueAt || null,
        institutionId: form.institutionId || undefined,
        opportunityId: form.opportunityId || undefined
      });
      setForm(
        createTaskForm({
          responsibleId: meta.users[0]?.id || ""
        })
      );
      await loadPage();
    } catch (currentError) {
      setActionError(currentError.message);
    }
  }

  async function handleDelete(taskId) {
    setActionError("");

    try {
      await tasksApi.remove(taskId);
      await loadPage();
    } catch (currentError) {
      setActionError(currentError.message);
    }
  }

  async function handleStatusChange(task, status) {
    setActionError("");

    try {
      await tasksApi.update(task._id, {
        title: task.title,
        priority: task.priority,
        dueAt: task.dueAt,
        responsibleId: task.responsibleId?._id ?? task.responsibleId,
        institutionId: task.institutionId?._id ?? task.institutionId,
        opportunityId: task.opportunityId?._id ?? task.opportunityId,
        comment: task.comment,
        status
      });
      await loadPage();
    } catch (currentError) {
      setActionError(currentError.message);
    }
  }

  if (loadingMeta) {
    return <LoaderPanel label="Preparando seguimientos..." />;
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
    return <LoaderPanel label="Preparando seguimientos..." />;
  }

  if (error) {
    return <ErrorState message={error} onAction={loadPage} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Proxima accion"
        title="Seguimientos"
        description="Convierte promesas comerciales en tareas visibles, ordenadas y con responsable."
      />

      {actionError ? (
        <Card>
          <p className="text-sm text-danger">{actionError}</p>
        </Card>
      ) : null}

      <Card className="grid gap-4 md:grid-cols-2">
        <FormField label="Estado">
          <Select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            <option value="">Todos</option>
            {meta.catalogs.taskStatuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Vista">
          <Select value={filters.overdue} onChange={(event) => setFilters((current) => ({ ...current, overdue: event.target.value }))}>
            <option value="">Todo</option>
            <option value="true">Solo vencidos</option>
          </Select>
        </FormField>
      </Card>

      <TaskComposer
        form={form}
        onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
        onSubmit={handleSubmit}
        tasks={tasks}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        users={meta.users}
        catalogs={meta.catalogs}
        showContextSelectors
        institutions={institutions}
        opportunities={opportunityOptions}
      />
    </div>
  );
}
