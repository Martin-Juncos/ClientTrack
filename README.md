# ClientTrack

CRM liviano para seguimiento comercial de instituciones y oportunidades de venta consultiva.

## Stack

- React + Vite + React Router
- Tailwind CSS
- Node + Express
- MongoDB Atlas + Mongoose
- JWT en cookie `httpOnly`
- Preparado para Vercel

## Scripts

- `npm run dev`: frontend Vite + backend Express local
- `npm run build`: build del frontend
- `npm run lint`: lint del proyecto
- `npm run test`: pruebas con Vitest

CI recomendado:
- `npm ci`
- `npm run lint`
- `npm run test`
- `npm run build`

En local, la API carga `.env` automaticamente desde la raiz del proyecto al iniciar.

## MVP incluido

- Login privado para 2 administradores
- Dashboard accionable
- CRUD de instituciones
- CRUD de oportunidades
- Historial de interacciones
- Seguimientos / tareas
- Pipeline Kanban
- Busqueda y filtros

## Arquitectura

- `src/`: frontend
- `server/`: dominio, auth, modelos y servicios
- `api/[...route].js`: entrada serverless para Vercel
- `shared/`: catalogos y constantes compartidas
- `public/branding/logo.gif`: asset fuente del logo para favicon e iconos multiplataforma

## Branding

- Los iconos de navegador, Apple touch icon, Android y Windows se generan desde `public/branding/logo.gif`.
- Para regenerarlos si cambia el logo: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\generate-brand-icons.ps1`

## Despliegue

- Frontend estatico en Vercel
- Backend por funciones Node usando `api/[...route].js`
- MongoDB Atlas con conexion segura por variables de entorno
- `vercel.json` fija `framework: vite`, `outputDirectory: dist` y el rewrite SPA/API necesario

## Checklist de deploy en Vercel

1. Importar el repositorio en Vercel.
2. Configurar Node.js `22.x`.
3. Cargar las variables de `CONFIG.md` en `Production`, `Preview` y `Development`.
4. Usar la URL canonica del proyecto como valor de `APP_ORIGIN`.
5. Si usas dominios adicionales o previews custom, completar `ALLOWED_APP_ORIGINS` con una lista separada por comas.
6. Desplegar y validar `GET /api/health` y `GET /api/ready`.

Consulta [CONFIG.md](./CONFIG.md) para variables y setup.

## Endpoints operativos

- `GET /api/health`: liveness del proceso.
- `GET /api/ready`: readiness real contra MongoDB.

## Notas de seguridad

- La API acepta sesion solo por cookie `httpOnly`; no usa bearer tokens para acceso autenticado.
- En `production`, la app rechaza placeholders obvios en secretos y credenciales para evitar despliegues incompletos.
