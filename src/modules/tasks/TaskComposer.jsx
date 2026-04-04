import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { FormField } from "../../components/ui/FormField.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import {
  formatDateTime,
  formatPriority,
  formatSolutionType,
  formatTaskStatus
} from "../../lib/utils/formatters.js";

export function TaskComposer({
  form,
  onChange,
  onSubmit,
  tasks,
  onDelete,
  onStatusChange,
  users,
  catalogs,
  showContextSelectors = false,
  institutions = [],
  opportunities = []
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
      <Card className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Nuevo seguimiento</h2>
          <p className="text-sm text-subtle">Convierte el proximo paso en una accion concreta.</p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          {showContextSelectors ? (
            <>
              <FormField label="Institucion">
                <Select value={form.institutionId} onChange={(event) => onChange("institutionId", event.target.value)}>
                  <option value="">Selecciona una institucion</option>
                  {institutions.map((institution) => (
                    <option key={institution._id ?? institution.id} value={institution._id ?? institution.id}>
                      {institution.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Oportunidad asociada">
                <Select value={form.opportunityId} onChange={(event) => onChange("opportunityId", event.target.value)}>
                  <option value="">Sin oportunidad puntual</option>
                  {opportunities.map((opportunity) => (
                    <option key={opportunity._id} value={opportunity._id}>
                      {opportunity.institutionId?.name ?? "Institucion"} · {formatSolutionType(opportunity.solutionType)}
                    </option>
                  ))}
                </Select>
              </FormField>
            </>
          ) : null}
          <FormField label="Titulo">
            <Input value={form.title} onChange={(event) => onChange("title", event.target.value)} required />
          </FormField>
          <FormField label="Responsable">
            <Select value={form.responsibleId} onChange={(event) => onChange("responsibleId", event.target.value)} required>
              <option value="">Selecciona un responsable</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Prioridad">
              <Select value={form.priority} onChange={(event) => onChange("priority", event.target.value)}>
                {catalogs.priorityOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Estado">
              <Select value={form.status} onChange={(event) => onChange("status", event.target.value)}>
                {catalogs.taskStatuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
          <FormField label="Fecha limite">
            <Input type="datetime-local" value={form.dueAt} onChange={(event) => onChange("dueAt", event.target.value)} required />
          </FormField>
          <FormField label="Comentario">
            <Textarea value={form.comment} onChange={(event) => onChange("comment", event.target.value)} />
          </FormField>
          <Button type="submit" className="w-full">
            Guardar seguimiento
          </Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Seguimientos activos</h2>
          <p className="text-sm text-subtle">Prioriza lo urgente y evita que se enfrien oportunidades.</p>
        </div>
        <div className="space-y-3">
          {tasks.map((task) => (
            <article key={task._id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{task.title}</p>
                  <p className="mt-1 text-xs text-subtle">
                    {task.institutionId?.name ?? "Sin institucion"} · {task.responsibleId?.name ?? "Sin responsable"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-white/10 text-subtle ring-white/10">{formatTaskStatus(task.status)}</Badge>
                  <Badge className="bg-accent/10 text-accent ring-accent/20">{formatPriority(task.priority)}</Badge>
                </div>
              </div>
              <p className="mt-3 text-sm text-subtle">{task.comment || "Sin comentario."}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-subtle">Vence: {formatDateTime(task.dueAt)}</p>
                <div className="flex items-center gap-2">
                  {onStatusChange ? (
                    <Select
                      className="min-w-[150px] py-2 text-xs"
                      value={task.status}
                      onChange={(event) => onStatusChange(task, event.target.value)}
                    >
                      {catalogs.taskStatuses.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </Select>
                  ) : null}
                  <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(task._id)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
