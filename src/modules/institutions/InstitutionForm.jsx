import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaPhone,
  FaPlus,
  FaTiktok,
  FaTrashCan,
  FaUserGroup,
  FaUserTie,
  FaXTwitter
} from "react-icons/fa6";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { FormField } from "../../components/ui/FormField.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Select } from "../../components/ui/Select.jsx";
import { Textarea } from "../../components/ui/Textarea.jsx";

const socialFields = [
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedinIn, placeholder: "https://linkedin.com/company/..." },
  { key: "instagram", label: "Instagram", icon: FaInstagram, placeholder: "https://instagram.com/..." },
  { key: "facebook", label: "Facebook", icon: FaFacebookF, placeholder: "https://facebook.com/..." },
  { key: "x", label: "X", icon: FaXTwitter, placeholder: "https://x.com/..." },
  { key: "tiktok", label: "TikTok", icon: FaTiktok, placeholder: "https://tiktok.com/@..." }
];

function ContactFields({
  contact,
  onChange,
  title,
  description,
  removable = false,
  onRemove,
  getFieldError,
  pathPrefix
}) {
  const errorFor = (field) => getFieldError?.(`${pathPrefix}.${field}`) ?? "";

  return (
    <div className="space-y-5 rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-subtle">{description}</p>
        </div>
        {removable ? (
          <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={onRemove}>
            <FaTrashCan className="h-3.5 w-3.5" />
            Quitar
          </Button>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Nombre" error={errorFor("firstName")}>
          <Input invalid={Boolean(errorFor("firstName"))} value={contact.firstName} onChange={(event) => onChange("firstName", event.target.value)} required />
        </FormField>
        <FormField label="Apellido" error={errorFor("lastName")}>
          <Input invalid={Boolean(errorFor("lastName"))} value={contact.lastName} onChange={(event) => onChange("lastName", event.target.value)} />
        </FormField>
        <FormField label="Cargo" error={errorFor("role")}>
          <Input invalid={Boolean(errorFor("role"))} value={contact.role} onChange={(event) => onChange("role", event.target.value)} />
        </FormField>
        <FormField label="Telefono" error={errorFor("phone")}>
          <div className="relative">
            <FaPhone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <Input
              invalid={Boolean(errorFor("phone"))}
              className="pl-11"
              value={contact.phone}
              onChange={(event) => onChange("phone", event.target.value)}
            />
          </div>
        </FormField>
        <FormField label="Email" error={errorFor("email")}>
          <div className="relative">
            <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <Input
              type="email"
              invalid={Boolean(errorFor("email"))}
              className="pl-11"
              value={contact.email}
              onChange={(event) => onChange("email", event.target.value)}
            />
          </div>
        </FormField>
      </div>
    </div>
  );
}

export function InstitutionForm({
  form,
  error,
  fieldErrors,
  onChange,
  onAdditionalContactChange,
  onAddContact,
  onRemoveContact,
  onSubmit,
  submitLabel,
  institutionTypes,
  users
}) {
  const contact = form.primaryContact;
  const socials = form.socials;

  function getFieldError(path) {
    return fieldErrors?.[path] ?? "";
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {error ? (
        <Card>
          <p className="text-sm text-danger">{error}</p>
        </Card>
      ) : null}

      <Card className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Institucion" error={getFieldError("name")}>
            <Input invalid={Boolean(getFieldError("name"))} value={form.name} onChange={(event) => onChange("name", event.target.value)} required />
          </FormField>
          <FormField label="Tipo de institucion" error={getFieldError("type")}>
            <Select invalid={Boolean(getFieldError("type"))} value={form.type} onChange={(event) => onChange("type", event.target.value)}>
              {institutionTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Ciudad" error={getFieldError("city")}>
            <Input invalid={Boolean(getFieldError("city"))} value={form.city} onChange={(event) => onChange("city", event.target.value)} />
          </FormField>
          <FormField label="Provincia / ubicacion" error={getFieldError("province")}>
            <Input invalid={Boolean(getFieldError("province"))} value={form.province} onChange={(event) => onChange("province", event.target.value)} />
          </FormField>
          <FormField label="Telefono institucional" error={getFieldError("phone")}>
            <div className="relative">
              <FaPhone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              <Input
                invalid={Boolean(getFieldError("phone"))}
                className="pl-11"
                value={form.phone}
                onChange={(event) => onChange("phone", event.target.value)}
                placeholder="Telefono general de la institucion"
              />
            </div>
          </FormField>
          <FormField label="Direccion institucional" error={getFieldError("address")}>
            <Input
              invalid={Boolean(getFieldError("address"))}
              value={form.address}
              onChange={(event) => onChange("address", event.target.value)}
              placeholder="Calle, numero, piso o referencia"
            />
          </FormField>
          <FormField label="Fuente del lead" error={getFieldError("leadSource")}>
            <Input invalid={Boolean(getFieldError("leadSource"))} value={form.leadSource} onChange={(event) => onChange("leadSource", event.target.value)} />
          </FormField>
          <FormField label="Responsable" error={getFieldError("responsibleId")}>
            <Select invalid={Boolean(getFieldError("responsibleId"))} value={form.responsibleId} onChange={(event) => onChange("responsibleId", event.target.value)} required>
              <option value="">Selecciona un responsable</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
        <FormField label="Observaciones generales" error={getFieldError("notes")}>
          <Textarea invalid={Boolean(getFieldError("notes"))} value={form.notes} onChange={(event) => onChange("notes", event.target.value)} />
        </FormField>
      </Card>

      <Card className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Presencia institucional</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Redes y canales de la institucion</h2>
          <p className="mt-2 text-sm text-subtle">
            Usa este bloque para guardar los perfiles publicos o canales propios de la institucion.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {socialFields.map(({ key, label, icon: Icon, placeholder }) => (
            <FormField key={key} label={label} error={getFieldError(`socials.${key}`)}>
              <div className="relative">
                <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                <Input
                  invalid={Boolean(getFieldError(`socials.${key}`))}
                  className="pl-11"
                  value={socials[key]}
                  placeholder={placeholder}
                  onChange={(event) => onChange(`socials.${key}`, event.target.value)}
                />
              </div>
            </FormField>
          ))}
        </div>
      </Card>

      <Card className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <FaUserTie className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Contacto principal</h2>
            <p className="mt-1 text-sm text-subtle">
              La persona de referencia para retomar la conversacion comercial con contexto.
            </p>
          </div>
        </div>

        <ContactFields
          contact={contact}
          title="Responsable de relacion principal"
          description="Debe incluir al menos telefono o email para no perder el hilo comercial."
          pathPrefix="primaryContact"
          getFieldError={getFieldError}
          onChange={(field, value) => onChange(`primaryContact.${field}`, value)}
        />
      </Card>

      <Card className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-copy">
              <FaUserGroup className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Contactos adicionales</h2>
              <p className="mt-1 text-sm text-subtle">
                Agrega otros interlocutores de la misma institucion cuando el proceso involucra mas de una persona.
              </p>
            </div>
          </div>
          <Button type="button" variant="secondary" className="gap-2" onClick={onAddContact}>
            <FaPlus className="h-3.5 w-3.5" />
            Cargar contacto
          </Button>
        </div>

        {form.additionalContacts.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center">
            <p className="text-sm font-medium text-white">Todavia no hay contactos secundarios.</p>
            <p className="mt-2 text-sm text-subtle">
              Puedes sumar decision makers, asistentes o referentes tecnicos sin tocar el contacto principal.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {form.additionalContacts.map((additionalContact, index) => (
              <ContactFields
                key={additionalContact.localId}
                contact={additionalContact}
                title={`Contacto adicional ${index + 1}`}
                description="Ideal para registrar decisores, asistentes o referentes operativos."
                pathPrefix={`additionalContacts.${index}`}
                getFieldError={getFieldError}
                removable
                onChange={(field, value) =>
                  onAdditionalContactChange(additionalContact.localId, field, value)
                }
                onRemove={() => onRemoveContact(additionalContact.localId)}
              />
            ))}
          </div>
        )}
      </Card>

      <div className="flex justify-between gap-4">
        <Button type="button" variant="secondary" className="gap-2" onClick={onAddContact}>
          <FaPlus className="h-3.5 w-3.5" />
          Agregar otro contacto
        </Button>
        <Button type="submit" size="lg">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
