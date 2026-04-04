import { Card } from "../../components/ui/Card.jsx";
import { formatDateTime } from "../../lib/utils/formatters.js";

export function ActivityFeed({ items }) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Actividad reciente</h2>
        <p className="text-sm text-subtle">Los ultimos movimientos registrados en el CRM.</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <article key={`${item.type}-${item.id}`} className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-accent/80">{item.type}</p>
              </div>
              <span className="text-xs text-subtle">{formatDateTime(item.timestamp)}</span>
            </div>
            <p className="mt-3 text-sm text-subtle">{item.detail || "Sin detalle adicional."}</p>
            <p className="mt-2 text-xs text-subtle">Responsable: {item.createdBy}</p>
          </article>
        ))}
      </div>
    </Card>
  );
}
