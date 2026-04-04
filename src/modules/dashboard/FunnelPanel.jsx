import { Card } from "../../components/ui/Card.jsx";

export function FunnelPanel({ pipeline }) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Embudo por etapa</h2>
        <p className="text-sm text-subtle">Lectura inmediata del volumen y la distribucion del pipeline.</p>
      </div>
      <div className="space-y-3">
        {pipeline.map((step) => (
          <div key={step.value} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-copy">{step.label}</span>
              <span className="text-subtle">{step.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent2 transition-all duration-500"
                style={{ width: `${Math.min(100, step.count * 12)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
