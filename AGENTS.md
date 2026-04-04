# AGENTS

## Product Context

ClientTrack es un CRM privado para dos usuarios internos, centrado en seguimiento comercial, contexto de relacion e impulso de proximas acciones.

## Core Principles

- Priorizar claridad operacional sobre complejidad.
- Mantener la experiencia sobria, premium-tech y muy legible.
- Evitar sobreingenieria y dependencias innecesarias.
- Proteger datos comerciales y secretos por defecto.

## Stack Rules

- Frontend en React + Vite + React Router + Tailwind.
- Backend en Node + Express reutilizable en local y en Vercel.
- Persistencia en MongoDB Atlas con Mongoose.
- Auth solo por JWT en cookie `httpOnly`; no agregar login social ni registro publico.

## Data Model Rules

- `institutions` contiene un `primaryContact` embebido.
- `opportunities` permite multiples registros por institucion.
- `interactions` y `tasks` referencian oportunidad e institucion cuando aplica.
- El pipeline vive en catalogos de codigo, no en colecciones editables durante el MVP.

## UI Rules

- Tema oscuro por defecto.
- Tokens visuales en CSS variables y Tailwind.
- Componentes base reutilizables antes de crear variantes especificas.
- Mantener formularios y tablas simples, con jerarquia visual fuerte.

## API Rules

- Respuesta JSON uniforme.
- Validacion server-side en cada endpoint.
- No acceder a Mongo ni secretos desde `src/`.
- Reusar servicios de dominio desde handlers o rutas.

## Delivery Discipline

- Cambios agrupados por modulo.
- Validar build y pruebas antes de cerrar una iteracion.
- Documentar nuevas variables o decisiones en `CONFIG.md` y `README.md`.
