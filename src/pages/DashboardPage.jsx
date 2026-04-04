import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardApi } from "../lib/api/dashboardApi.js";
import { LoaderPanel } from "../components/ui/LoaderPanel.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { Card } from "../components/ui/Card.jsx";
import { ErrorState } from "../components/ui/ErrorState.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { FunnelPanel } from "../modules/dashboard/FunnelPanel.jsx";
import { formatDateTime, formatPriority, formatSolutionType } from "../lib/utils/formatters.js";

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");
      const response = await dashboardApi.getSummary();
      setData(response);
    } catch (currentError) {
      setError(currentError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <LoaderPanel label="Cargando tablero comercial..." />;
  }

  if (error) {
    return <ErrorState message={error} onAction={loadDashboard} />;
  }

  const metrics = data.metrics;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Centro de control"
        title="Dashboard comercial"
        description="Detecta oportunidades activas, seguimientos vencidos y conversaciones recientes desde una sola vista."
        actions={
          <>
            <Button as={Link} to="/instituciones/nueva">
              Nueva institucion
            </Button>
            <Button as={Link} to="/oportunidades/nueva" variant="secondary">
              Nueva oportunidad
            </Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Instituciones" value={metrics.institutionsTotal} hint="Base activa" to="/instituciones" />
        <StatCard label="Oportunidades activas" value={metrics.activeOpportunities} hint="Pipeline vivo" to="/pipeline" />
        <StatCard label="Propuestas enviadas" value={metrics.proposalsSent} hint="En decision" to="/oportunidades" />
        <StatCard label="Entrevistas agendadas" value={metrics.scheduledInterviews} hint="Proximo contacto" to="/seguimientos" />
        <StatCard label="Seguimientos vencidos" value={metrics.overdueTasks} hint="Accion urgente" to="/seguimientos" />
        <StatCard label="Ganadas del mes" value={metrics.wonThisMonth} hint="Cierres recientes" to="/oportunidades" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <FunnelPanel pipeline={data.pipeline} />
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Proximos seguimientos</h2>
            <p className="text-sm text-subtle">Lo mas urgente para mantener el pipeline avanzando.</p>
          </div>
          <div className="space-y-3">
            {data.upcomingTasks.map((task) => (
              <article key={task._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{task.title}</p>
                    <p className="mt-1 text-xs text-subtle">{task.institutionId?.name ?? "Sin institucion"}</p>
                  </div>
                  <Badge className="bg-accent/10 text-accent ring-accent/20">
                    {formatPriority(task.priority)}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-subtle">Vence: {formatDateTime(task.dueAt)}</p>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Oportunidades calientes</h2>
            <p className="text-sm text-subtle">Casos con mayor potencial o urgencia comercial.</p>
          </div>
          <div className="space-y-3">
            {data.hotOpportunities.map((item) => (
              <article key={item._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">{item.institutionId?.name}</p>
                <p className="mt-1 text-xs text-subtle">{formatSolutionType(item.solutionType)}</p>
                <p className="mt-3 text-xs text-subtle">Probabilidad: {item.winProbability}%</p>
              </article>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Ultimas interacciones</h2>
            <p className="text-sm text-subtle">Contexto fresco para retomar conversaciones sin perder hilo.</p>
          </div>
          <div className="space-y-3">
            {data.recentInteractions.map((interaction) => (
              <article key={interaction._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">{interaction.summary}</p>
                <p className="mt-1 text-xs text-subtle">
                  {interaction.createdBy?.name ?? "Sin usuario"} - {formatDateTime(interaction.occurredAt)}
                </p>
              </article>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

