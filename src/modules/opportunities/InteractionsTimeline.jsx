import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { FormField } from "../../components/ui/FormField.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { formatDateTime } from "../../lib/utils/formatters.js";

export function InteractionsTimeline({
  interactions,
  form,
  onChange,
  onSubmit,
  onDelete,
  interactionTypes
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
      <Card className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Historial de interacciones</h2>
          <p className="text-sm text-subtle">Toda la cronologia comercial asociada a esta oportunidad.</p>
        </div>

        {interactions.length === 0 ? (
          <EmptyState title="Sin interacciones" description="Carga la primera novedad para empezar a construir contexto." />
        ) : (
          <div className="space-y-4">
            {interactions.map((interaction) => (
              <article key={interaction._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{interaction.summary}</p>
                    <p className="mt-1 text-xs text-subtle">
                      {formatDateTime(interaction.occurredAt)} · {interaction.createdBy?.name ?? "Sin usuario"}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(interaction._id)}>
                    Eliminar
                  </Button>
                </div>
                <dl className="mt-4 grid gap-3 text-sm text-subtle md:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.22em] text-subtle/80">Respuesta</dt>
                    <dd className="mt-1">{interaction.clientResponse || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.22em] text-subtle/80">Resultado</dt>
                    <dd className="mt-1">{interaction.result || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.22em] text-subtle/80">Proximo paso</dt>
                    <dd className="mt-1">{interaction.nextActionTitle || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.22em] text-subtle/80">Fecha sugerida</dt>
                    <dd className="mt-1">{formatDateTime(interaction.nextActionDueAt)}</dd>
                  </div>
                </dl>
                {interaction.internalNotes ? (
                  <p className="mt-4 rounded-2xl bg-black/20 px-3 py-3 text-sm text-subtle">{interaction.internalNotes}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Registrar interaccion</h2>
          <p className="text-sm text-subtle">Resume lo ocurrido y define el proximo movimiento.</p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FormField label="Tipo">
            <Select value={form.type} onChange={(event) => onChange("type", event.target.value)}>
              {interactionTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Fecha y hora">
            <Input type="datetime-local" value={form.occurredAt} onChange={(event) => onChange("occurredAt", event.target.value)} />
          </FormField>
          <FormField label="Resumen">
            <Textarea value={form.summary} onChange={(event) => onChange("summary", event.target.value)} required />
          </FormField>
          <FormField label="Respuesta del cliente">
            <Textarea value={form.clientResponse} onChange={(event) => onChange("clientResponse", event.target.value)} />
          </FormField>
          <FormField label="Resultado">
            <Input value={form.result} onChange={(event) => onChange("result", event.target.value)} />
          </FormField>
          <FormField label="Proximo paso">
            <Input value={form.nextActionTitle} onChange={(event) => onChange("nextActionTitle", event.target.value)} />
          </FormField>
          <FormField label="Fecha proxima accion">
            <Input type="datetime-local" value={form.nextActionDueAt} onChange={(event) => onChange("nextActionDueAt", event.target.value)} />
          </FormField>
          <FormField label="Notas internas">
            <Textarea value={form.internalNotes} onChange={(event) => onChange("internalNotes", event.target.value)} />
          </FormField>
          <Button type="submit" className="w-full">
            Guardar interaccion
          </Button>
        </form>
      </Card>
    </div>
  );
}
