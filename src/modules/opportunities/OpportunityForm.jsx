import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { FormField } from "../../components/ui/FormField.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";

export function OpportunityForm({
  form,
  onChange,
  onSubmit,
  submitLabel,
  institutions,
  users,
  catalogs
}) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <Card className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <FormField label="Institucion">
            <Select value={form.institutionId} onChange={(event) => onChange("institutionId", event.target.value)} required>
              <option value="">Selecciona una institucion</option>
              {institutions.map((institution) => (
                <option key={institution._id ?? institution.id} value={institution._id ?? institution.id}>
                  {institution.name}
                </option>
              ))}
            </Select>
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
          <FormField label="Solucion ofrecida">
            <Select value={form.solutionType} onChange={(event) => onChange("solutionType", event.target.value)}>
              {catalogs.solutionTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Estado">
            <Select value={form.status} onChange={(event) => onChange("status", event.target.value)}>
              {catalogs.opportunityStates.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Nivel de interes">
            <Select value={form.interestLevel} onChange={(event) => onChange("interestLevel", event.target.value)}>
              {catalogs.interestLevels.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Prioridad">
            <Select value={form.priority} onChange={(event) => onChange("priority", event.target.value)}>
              {catalogs.priorityOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Presupuesto estimado">
            <Input type="number" min="0" value={form.estimatedBudget} onChange={(event) => onChange("estimatedBudget", event.target.value)} />
          </FormField>
          <FormField label="Fecha estimada de cierre">
            <Input type="date" value={form.estimatedCloseDate} onChange={(event) => onChange("estimatedCloseDate", event.target.value)} />
          </FormField>
          <FormField label="Probabilidad de cierre (%)">
            <Input type="number" min="0" max="100" value={form.winProbability} onChange={(event) => onChange("winProbability", event.target.value)} />
          </FormField>
        </div>
      </Card>

      <Card className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Necesidad detectada">
            <Textarea value={form.needSummary} onChange={(event) => onChange("needSummary", event.target.value)} />
          </FormField>
          <FormField label="Problema principal">
            <Textarea value={form.problemStatement} onChange={(event) => onChange("problemStatement", event.target.value)} />
          </FormField>
          <FormField label="Sistema actual">
            <Input value={form.currentSystem} onChange={(event) => onChange("currentSystem", event.target.value)} />
          </FormField>
          <FormField label="Objeciones">
            <Textarea value={form.objections} onChange={(event) => onChange("objections", event.target.value)} />
          </FormField>
        </div>
        <FormField label="Observaciones comerciales">
          <Textarea value={form.commercialNotes} onChange={(event) => onChange("commercialNotes", event.target.value)} />
        </FormField>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
