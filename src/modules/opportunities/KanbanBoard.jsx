import { Card } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { formatDate, formatOpportunityState, formatPriority, formatSolutionType } from "../../lib/utils/formatters.js";

export function KanbanBoard({ columns, onOpen }) {
  if (!columns?.length) {
    return <EmptyState title="Sin pipeline" description="Aun no hay oportunidades para visualizar." />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-5">
      {columns.map((column) => (
        <Card key={column.value} className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">{column.label}</h3>
              <p className="text-xs text-subtle">{column.items.length} oportunidades</p>
            </div>
            <Badge className={column.color}>{column.items.length}</Badge>
          </div>

          {column.items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-subtle">
              Sin movimientos en esta etapa.
            </p>
          ) : (
            <div className="space-y-3">
              {column.items.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => onOpen(item._id)}
                  className="w-full rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.institutionId?.name}</p>
                      <p className="mt-1 text-xs text-subtle">{formatSolutionType(item.solutionType)}</p>
                    </div>
                    <Badge className="bg-white/10 text-subtle ring-white/10">
                      {formatPriority(item.priority)}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-subtle">
                    <p>Contacto: {item.institutionId?.primaryContact?.firstName ?? "-"}</p>
                    <p>Estado: {formatOpportunityState(item.status)}</p>
                    <p>Ultimo contacto: {formatDate(item.lastInteractionAt)}</p>
                    <p>Proxima accion: {item.nextActionSnapshot?.title || "Sin definir"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
