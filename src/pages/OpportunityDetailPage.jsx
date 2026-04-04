import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { LoaderPanel } from "../components/ui/LoaderPanel.jsx";
import { ErrorState } from "../components/ui/ErrorState.jsx";
import { CommunicationPanel } from "../modules/communications/CommunicationPanel.jsx";
import { InteractionsTimeline } from "../modules/opportunities/InteractionsTimeline.jsx";
import { TaskComposer } from "../modules/tasks/TaskComposer.jsx";
import { useMetaOptions } from "../hooks/useMetaOptions.js";
import { createInteractionForm, createTaskForm } from "../lib/utils/forms.js";
import { opportunitiesApi } from "../lib/api/opportunitiesApi.js";
import { interactionsApi } from "../lib/api/interactionsApi.js";
import { tasksApi } from "../lib/api/tasksApi.js";
import {
  formatCurrency,
  formatInterest,
  formatOpportunityState,
  formatPriority,
  formatSolutionType
} from "../lib/utils/formatters.js";

export function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: meta, loading: loadingMeta, error: metaError, reload: reloadMeta } = useMetaOptions();
  const [opportunity, setOpportunity] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [interactionForm, setInteractionForm] = useState(createInteractionForm());
  const [taskForm, setTaskForm] = useState(createTaskForm());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [preferredChannel, setPreferredChannel] = useState("email");

  const loadPage = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [opportunityData, interactionsData, tasksData] = await Promise.all([
        opportunitiesApi.getById(id),
        interactionsApi.list({ opportunityId: id }),
        tasksApi.list({ opportunityId: id })
      ]);

      setOpportunity(opportunityData);
      setInteractions(interactionsData);
      setTasks(tasksData);
      setInteractionForm(createInteractionForm({ opportunityId: id }));
      setTaskForm(
        createTaskForm({
          opportunityId: id,
          institutionId: opportunityData.institutionId?._id,
          responsibleId: opportunityData.responsibleId?._id ?? opportunityData.responsibleId
        })
      );
    } catch (currentError) {
      setError(currentError.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  async function handleDelete() {
    const confirmed = window.confirm("Esto eliminara la oportunidad y todas sus interacciones. Deseas continuar?");

    if (!confirmed) {
      return;
    }

    setActionError("");

    try {
      await opportunitiesApi.remove(id);
      navigate("/oportunidades");
    } catch (currentError) {
      setActionError(currentError.message);
    }
  }

  async function handleCreateInteraction(event) {
    event.preventDefault();
    setActionError("");

    try {
      await interactionsApi.create({
        ...interactionForm,
        opportunityId: id,
        nextActionDueAt: interactionForm.nextActionDueAt || null
      });
      await loadPage();
    } catch (currentError) {
      setActionError(currentError.message);
    }
  }

  async function handleDeleteInteraction(interactionId) {
    setActionError("");

    try {
      await interactionsApi.remove(interactionId);
      await loadPage();
    } catch (currentError) {
      setActionError(currentError.message);
    }
  }

  async function handleCreateTask(event) {
    event.preventDefault();
    setActionError("");

    try {
      await tasksApi.create({
        ...taskForm,
        opportunityId: id,
        institutionId: opportunity.institutionId?._id,
        dueAt: taskForm.dueAt || null
      });
      await loadPage();
    } catch (currentError) {
      setActionError(currentError.message);
    }
  }

  async function handleDeleteTask(taskId) {
    setActionError("");

    try {
      await tasksApi.remove(taskId);
      await loadPage();
    } catch (currentError) {
      setActionError(currentError.message);
    }
  }

  async function handleTaskStatusChange(task, status) {
    setActionError("");

    try {
      await tasksApi.update(task._id, {
        status,
        title: task.title,
        priority: task.priority,
        dueAt: task.dueAt,
        responsibleId: task.responsibleId?._id ?? task.responsibleId,
        institutionId: task.institutionId?._id ?? task.institutionId,
        opportunityId: task.opportunityId?._id ?? task.opportunityId,
        comment: task.comment
      });
      await loadPage();
    } catch (currentError) {
      setActionError(currentError.message);
    }
  }

  if (!loadingMeta && !meta) {
    return (
      <ErrorState
        title="No pudimos preparar esta vista"
        message={metaError?.message ?? "No pudimos cargar los catalogos base."}
        onAction={reloadMeta}
      />
    );
  }

  if (!loadingMeta && !loading && error) {
    return <ErrorState message={error} onAction={loadPage} />;
  }

  if (loadingMeta || loading || !opportunity) {
    return <LoaderPanel label="Cargando oportunidad..." />;
  }

  const communicationContacts = [
    {
      id: opportunity.institutionId?.primaryContact?._id ?? "primary-contact",
      ...opportunity.institutionId?.primaryContact
    },
    ...((opportunity.institutionId?.additionalContacts ?? []).map((contact) => ({
      id: contact._id,
      ...contact
    })) ?? [])
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Oportunidad comercial"
        title={`${opportunity.institutionId?.name} - ${formatSolutionType(opportunity.solutionType)}`}
        description="Centraliza estado, objeciones, historial y el siguiente paso para no perder contexto."
        actions={
          <>
            <Button as={Link} to={`/oportunidades/${id}/editar`} variant="secondary">
              Editar
            </Button>
            <Button variant="ghost" onClick={handleDelete}>
              Eliminar
            </Button>
          </>
        }
      />

      {actionError ? (
        <Card>
          <p className="text-sm text-danger">{actionError}</p>
        </Card>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Resumen comercial</h2>
          <dl className="grid gap-3 text-sm text-subtle md:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-subtle/80">Estado</dt>
              <dd className="mt-1">{formatOpportunityState(opportunity.status)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-subtle/80">Prioridad</dt>
              <dd className="mt-1">{formatPriority(opportunity.priority)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-subtle/80">Interes</dt>
              <dd className="mt-1">{formatInterest(opportunity.interestLevel)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-subtle/80">Presupuesto</dt>
              <dd className="mt-1">{formatCurrency(opportunity.estimatedBudget)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-subtle/80">Probabilidad</dt>
              <dd className="mt-1">{opportunity.winProbability}%</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.24em] text-subtle/80">Proxima accion</dt>
              <dd className="mt-1">{opportunity.nextActionSnapshot?.title || "-"}</dd>
            </div>
          </dl>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-subtle">
            <p className="font-medium text-white">Necesidad detectada</p>
            <p className="mt-2">{opportunity.needSummary || "Sin necesidad cargada."}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-subtle">
            <p className="font-medium text-white">Objeciones</p>
            <p className="mt-2">{opportunity.objections || "Sin objeciones registradas."}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-subtle">
            <p className="font-medium text-white">Contacto principal</p>
            <p className="mt-2 text-white">
              {opportunity.institutionId?.primaryContact?.firstName} {opportunity.institutionId?.primaryContact?.lastName}
            </p>
            <p className="mt-1">{opportunity.institutionId?.primaryContact?.role || "Sin cargo cargado"}</p>
            <p className="mt-3">{opportunity.institutionId?.primaryContact?.email || "Sin email"}</p>
            <p className="mt-1">{opportunity.institutionId?.primaryContact?.phone || "Sin telefono"}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={!opportunity.institutionId?.primaryContact?.email}
                onClick={() => {
                  setSelectedContactId(opportunity.institutionId?.primaryContact?._id ?? "primary-contact");
                  setPreferredChannel("email");
                }}
              >
                Email
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={!opportunity.institutionId?.primaryContact?.phone}
                onClick={() => {
                  setSelectedContactId(opportunity.institutionId?.primaryContact?._id ?? "primary-contact");
                  setPreferredChannel("whatsapp");
                }}
              >
                WhatsApp
              </Button>
            </div>
          </div>
        </Card>

        <TaskComposer
          form={taskForm}
          onChange={(field, value) => setTaskForm((current) => ({ ...current, [field]: value }))}
          onSubmit={handleCreateTask}
          tasks={tasks}
          onDelete={handleDeleteTask}
          onStatusChange={handleTaskStatusChange}
          users={meta.users}
          catalogs={meta.catalogs}
        />
      </section>

      <InteractionsTimeline
        interactions={interactions}
        form={interactionForm}
        onChange={(field, value) => setInteractionForm((current) => ({ ...current, [field]: value }))}
        onSubmit={handleCreateInteraction}
        onDelete={handleDeleteInteraction}
        interactionTypes={meta.catalogs.interactionTypes}
      />

      <CommunicationPanel
        institutionId={opportunity.institutionId?._id}
        opportunityId={opportunity._id}
        contacts={communicationContacts}
        selectedContactId={selectedContactId}
        preferredChannel={preferredChannel}
        onSelectedContactChange={setSelectedContactId}
        composerTitle="Comunicaciones de la oportunidad"
        composerDescription="Envios y aperturas vinculadas a este caso comercial."
      />
    </div>
  );
}

