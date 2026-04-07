# Configuracion

## Variables requeridas

| Variable | Tipo | Uso |
| --- | --- | --- |
| `MONGODB_URI` | string | Conexion a MongoDB Atlas |
| `JWT_SECRET` | string | Firma de JWT para sesiones |
| `ADMIN_USER_1_NAME` | string | Seed del admin 1 |
| `ADMIN_USER_1_EMAIL` | string | Seed del admin 1 |
| `ADMIN_USER_1_PASSWORD` | string | Seed del admin 1 |
| `ADMIN_USER_2_NAME` | string | Seed del admin 2 |
| `ADMIN_USER_2_EMAIL` | string | Seed del admin 2 |
| `ADMIN_USER_2_PASSWORD` | string | Seed del admin 2 |

## Variables opcionales

| Variable | Tipo | Default | Uso |
| --- | --- | --- | --- |
| `NODE_ENV` | string | `development` | Modo de ejecucion |
| `PORT` | number | `3001` | Puerto local del backend |
| `APP_ORIGIN` | string | `http://localhost:5173` | Origen de la app para cookies y proxy |
| `ALLOWED_APP_ORIGINS` | string | - | Lista separada por comas con origins adicionales permitidos para requests mutables, util para dominios extra o previews custom |
| `JWT_EXPIRES_IN` | string | `7d` | Expiracion de sesion |
| `COOKIE_NAME` | string | `clienttrack_session` | Nombre de la cookie de sesion |
| `VERCEL_URL` | string | provista por Vercel | Hostname del deployment. La app la usa para aceptar el origin del deployment actual en preview y production |

## Flujo de arranque

1. Copiar `.env.example` a `.env`.
2. Configurar `MONGODB_URI` y `JWT_SECRET`.
3. Definir los dos usuarios administradores.
4. Ejecutar `npm install`.
5. Ejecutar `npm run dev`.

## Despliegue en Vercel

1. Crear un proyecto nuevo en Vercel apuntando a la raiz del repositorio.
2. Verificar que el proyecto use Node.js `22.x`.
3. Cargar estas variables de entorno en `Production`, `Preview` y `Development`:
   `MONGODB_URI`, `JWT_SECRET`, `APP_ORIGIN`, `ALLOWED_APP_ORIGINS`, `COOKIE_NAME`, `JWT_EXPIRES_IN`,
   `ADMIN_USER_1_NAME`, `ADMIN_USER_1_EMAIL`, `ADMIN_USER_1_PASSWORD`,
   `ADMIN_USER_2_NAME`, `ADMIN_USER_2_EMAIL`, `ADMIN_USER_2_PASSWORD`.
4. Definir `APP_ORIGIN` con la URL publica canonica del proyecto.
   Ejemplo: `https://clienttrack.tu-dominio.vercel.app`
5. Si manejas mas de un origin valido para requests mutables, definir `ALLOWED_APP_ORIGINS`.
   Ejemplo: `https://clienttrack.tu-dominio.vercel.app,https://preview-clienttrack.vercel.app`
6. Mantener el comando de build como `npm run build`.
7. Confirmar que la salida estatica sea `dist`.

## Notas de runtime en Vercel

- El frontend se publica como SPA de Vite desde `dist`.
- La API se resuelve por la funcion Node en `api/[...route].js`.
- Las rutas profundas del frontend se atienden con rewrites a `index.html`.
- Las rutas `/api/*` quedan reservadas para Express y no deben usarse en el router del cliente.
- `GET /api/health` valida liveness del proceso y `GET /api/ready` valida conectividad real con MongoDB.
- Para requests mutables, la API acepta `APP_ORIGIN`, los origins listados en `ALLOWED_APP_ORIGINS` y el deployment actual derivado de `VERCEL_URL`.

## Carga local de entorno

- En desarrollo local, el backend carga automaticamente el archivo `.env` desde la raiz del proyecto antes de validar la configuracion.
- Si una variable ya existe en el entorno del sistema o de Vercel, ese valor tiene prioridad sobre `.env`.

## Seguridad

- No expongas `MONGODB_URI` ni `JWT_SECRET` en frontend.
- En Vercel, define estas variables solo en Project Settings.
- Usa un `JWT_SECRET` aleatorio de al menos 32 caracteres.
- En `production`, la app rechaza placeholders obvios en secretos y credenciales para evitar despliegues incompletos.
- La aplicacion crea o sincroniza los dos admins desde variables de entorno al iniciar sesion.
- La autenticacion privada usa solo cookie JWT `httpOnly`; no hay soporte para bearer token ni login social.
