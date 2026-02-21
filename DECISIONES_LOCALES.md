# 📋 Decisiones Locales del Proyecto — RelojTiktak

> Documento que registra todas las decisiones técnicas, de diseño y arquitectura tomadas en esta máquina para el proyecto **Control-Horario-** (aka RelojTiktak).

---

## 🧱 Stack Tecnológico

| Capa | Tecnología | Versión | Razón |
|------|-----------|---------|-------|
| Framework UI | React | 19.x | Versión más reciente con mejoras de rendimiento |
| Bundler | Vite | 7.x | HMR rápido y ESM nativo |
| Lenguaje | TypeScript | ~5.9 | Tipado estático para reducir errores |
| Estilos | TailwindCSS | 3.x | Utilidades CSS sin CSS custom excesivo |
| Enrutamiento | React Router DOM | 7.x | SPA con rutas protegidas |
| Backend/DB | Supabase | 2.x | BaaS con Auth + PostgreSQL + RLS integrado |
| Iconos | Lucide React | 0.563 | Librería consistente y ligera |
| Monitoreo | Sentry | 10.x | Captura errores solo en producción |
| Testing | Vitest + Testing Library | 4.x / 16.x | Integrado con Vite, sin Jest |

---

## ⚙️ Configuración Local del Entorno

### Variables de entorno activas (`.env.local`)
```
VITE_SUPABASE_URL=https://crzqjmnbtbpbcrmnkerz.supabase.co
VITE_SUPABASE_ANON_KEY=<clave anon JWT del proyecto>
```
- Se usa la clave `anon` (nunca `service_role`) para no exponer privilegios elevados en el frontend.
- `VITE_SENTRY_DSN` **no está configurado localmente**, por lo que Sentry está desactivado en dev.

### Alias de módulos (`vite.config.ts`)
```ts
"@" → "./src"
```
Se configuró el alias `@` para importaciones absolutas y evitar rutas relativas largas como `../../../`.

---

## 🏗️ Decisiones de Arquitectura

### 1. StrictMode desactivado intencionalmente
`StrictMode` de React está **comentado** en `main.tsx`. Decisión tomada porque StrictMode ejecuta efectos dos veces en desarrollo, lo que causaba **doble ejecución no deseada** en el hook `useSession` al iniciar/pausar sesiones.

```tsx
// main.tsx — StrictMode comentado a propósito
// createRoot(document.getElementById('root')!).render(
//   <StrictMode><App /></StrictMode>
// );
createRoot(document.getElementById('root')!).render(<App />);
```

### 2. Estructura de rutas con ProtectedRoute
Se definieron tres tipos de rutas en `App.tsx`:
- **Rutas públicas** (`/login`, `/register`): Redirigen a `/` si el usuario ya está autenticado.
- **Rutas protegidas** (dentro de `<ProtectedRoute>`): Solo accesibles con sesión activa.
- **Ruta comodín** (`*`): Redirige siempre a `/`.

```
/ → Dashboard (ruta principal)
/sessions → Sessions (historial + calendario)
/login, /register → Rutas públicas
/dashboard → Redirige a / (evita duplicados)
```

### 3. Calendario movido de Dashboard a Sessions
**Decisión**: El calendario fue originalmente prototipado como un modal en el Dashboard (`CalendarModal.tsx`). Se decidió **moverlo a la página /sessions** como vista integrada en página completa.

**Razones:**
- El Dashboard debe enfocarse únicamente en el control de la sesión activa.
- La vista de calendario tiene más espacio al no estar en un modal.
- Organización semántica: el historial pertenece a Sessions, no al Dashboard.
- `CalendarModal.tsx` quedó en el repositorio pero **no se usa** (creado durante la transición).

### 4. Carga de sesiones para el Calendario
Se decidió cargar las **100 sesiones más recientes completadas** para el calendario (en lugar de paginar por mes). Esto permite navegar meses hacia atrás sin peticiones adicionales y es viable dado el volumen esperado de datos por usuario.

### 5. Proveedor de contexto global: Toast + Auth
La app envuelve todo en dos providers en orden específico:
```tsx
<BrowserRouter>
  <ToastProvider>      ← Toast global (notificaciones)
    <AuthProvider>     ← Auth context (usuario, loading)
      <AppRoutes />
    </AuthProvider>
  </ToastProvider>
</BrowserRouter>
```

---

## 🗄️ Decisiones de Base de Datos (Supabase/PostgreSQL)

### Esquema de tablas
Se definieron **3 tablas** en `supabase/schema.sql`:

```
profiles (1) ──< (N) work_sessions (1) ──< (N) work_pauses
```

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Datos del usuario (sincronizado con auth.users) |
| `work_sessions` | Sesiones laborales con estado y duración |
| `work_pauses` | Pausas individuales por sesión |

### Decisiones clave de esquema

| Decisión | Detalle |
|---------|---------|
| UUIDs para IDs | Mejor que SERIAL para sistemas distribuidos y Supabase |
| `TIMESTAMPTZ` para fechas | Incluye zona horaria, evita errores en distintas regiones |
| `INTERVAL` para duraciones | Tipo nativo de PostgreSQL, más semántico que segundos enteros |
| `JSONB` para `device_info` | Permite almacenar datos variables del dispositivo sin columnas extra |
| `TEXT` + CHECK para status | Evita crear un tipo ENUM (más flexible para futuras migraciones) |
| `ON DELETE CASCADE` | Si se elimina un usuario o sesión, sus hijos se eliminan automáticamente |

### Triggers de lógica de negocio
Se decidió implementar reglas críticas **a nivel de base de datos** (no solo en el frontend):

1. **`check_single_active_session`**: Previene que un mismo usuario tenga más de una sesión activa o pausada simultáneamente.
2. **`check_max_session_duration`**: Rechaza sesiones mayores a **16 horas** (límite elegido por regulaciones laborales y prevención de sesiones olvidadas).
3. **`update_profiles_updated_at` / `update_work_sessions_updated_at`**: Actualiza `updated_at` automáticamente en cada UPDATE.

### Índices creados
```sql
CREATE INDEX idx_user_sessions ON work_sessions(user_id, created_at DESC);
CREATE INDEX idx_session_status ON work_sessions(user_id, status);
CREATE INDEX idx_session_pauses ON work_pauses(session_id);
```
Estos índices cubren los patrones de consulta más frecuentes: historial por usuario, filtro por estado y joins de pausas.

### Seguridad: Row Level Security (RLS)
**RLS está habilitado en todas las tablas.** Cada política filtra por `auth.uid()` para aislar completamente los datos entre usuarios. Las políticas de `work_pauses` usan `EXISTS` con join a `work_sessions` para verificar la propiedad a través de la tabla padre.

### Función `check_abandoned_sessions` con SECURITY DEFINER
Esta función RPC se ejecuta con privilegios elevados pero valida internamente con `WHERE user_id = auth.uid()`. Se identificó que le falta `SET search_path = public, pg_temp;` para mitigar ataques teóricos de function hijacking (pendiente de aplicar).

---

## 🎨 Decisiones de Diseño UI/UX

### Sistema de diseño: Glassmorphism + Lima
Se adoptó un sistema visual consistente con:
- **Fondo**: `#0A0A0A` (dark-bg) — casi negro
- **Tarjetas**: `#171717` (card-bg) — gris muy oscuro
- **Color de acento primario**: `#D9F99D` (primary-lime) — lima
- **Color de acento secundario**: `#BEF264` (secondary-lime)
- **Tipografía**: Inter (Google Fonts)
- **Utilidades CSS custom**: `.glass-panel`, `.glass-card` para efecto glassmorphism

### Iconografía
Se eligió **Lucide React** como librería única de íconos para mantener consistencia visual en toda la aplicación.

### Vista de Sesiones: toggle Lista / Calendario
La página `/sessions` ofrece dos vistas intercambiables:
- **Lista**: `HistoryList` clásico
- **Calendario**: Vista mensual con panel lateral de detalles

Los indicadores de días en el calendario usan colores semánticos:
- 🟢 Verde: 1 sesión
- 🟡 Amarillo: 2-3 sesiones
- 🟠 Naranja: 4+ sesiones

### Conteo de pausas en el historial
Se decidió mostrar el conteo de pausas **siempre** (incluyendo cero) con el ícono `Coffee`, tanto en `HistoryList` como en el panel de detalles del calendario. Esto brinda una vista completa y escaneable del historial de jornadas.

### Modal con prop `size`
El componente `Modal.tsx` tiene un prop `size` que acepta `'default'` (max-w-lg) y `'large'` (max-w-6xl), manteniendo retrocompatibilidad con todos los modales existentes al aceptar `'default'` como valor por defecto.

---

## 🔍 Monitoreo de Errores: Sentry

Se integró Sentry en `main.tsx` con la siguiente política:
- **Solo se inicializa en producción** (`import.meta.env.PROD === true`)
- **Solo si `VITE_SENTRY_DSN` está definido** en las variables de entorno
- Esto evita contaminación de reportes durante el desarrollo local

```ts
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, integrations: [] });
}
```

---

## 🚀 Despliegue

- **Plataforma**: Vercel (integración continua con la rama principal de GitHub)
- **`vercel.json`** configurado con rewrites para que React Router funcione correctamente en producción:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- **Variables de entorno en Vercel**: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` deben configurarse en el panel de Vercel antes de desplegar.

---

## ⚠️ Deuda Técnica y Pendientes Identificados

| # | Descripción | Prioridad |
|---|-------------|-----------|
| 1 | Agregar `updated_at` y trigger a tabla `work_pauses` | Media |
| 2 | Añadir `SET search_path` a la función `check_abandoned_sessions` | Media |
| 3 | Añadir constraints de orden temporal (`end_time > start_time`, `pause_end > pause_start`) | Media |
| 4 | Migrar del `schema.sql` monolítico a migraciones versionadas con Supabase CLI | Media |
| 5 | Añadir atributos ARIA en botones que solo tienen íconos (accesibilidad) | Alta |
| 6 | Mostrar indicadores de carga (spinner) en botones durante operaciones async | Alta |
| 7 | Mejorar contraste de textos `text-gray-400` a `text-gray-300` donde sea crítico | Media |
| 8 | Eliminar `CalendarModal.tsx` si ya no se va a utilizar | Baja |
| 9 | Evaluar si `total_duration` en `work_sessions` debe calcularse vía Generated Column | Baja |

---

## 📁 Archivos clave del proyecto

| Archivo | Rol |
|---------|-----|
| `src/main.tsx` | Punto de entrada; inicializa Sentry y monta la app |
| `src/App.tsx` | Define estructura de rutas y providers globales |
| `src/pages/Dashboard.tsx` | Dashboard principal con control de sesión activa |
| `src/pages/Sessions.tsx` | Historial con vistas Lista y Calendario |
| `src/components/calendar/Calendar.tsx` | Componente de vista mensual del calendario |
| `src/components/calendar/CalendarModal.tsx` | Versión modal del calendario (no usada actualmente) |
| `supabase/schema.sql` | Definición completa del esquema de la base de datos |
| `docs/db-standards.md` | Estándares de base de datos acordados para el proyecto |
| `docs/db-audit-report.md` | Auditoría del esquema realizada el 14/02/2026 |
| `.env.local` | Variables de entorno locales (no versionadas) |
| `vercel.json` | Configuración de rewrites para SPA en Vercel |
| `tailwind.config.js` | Paleta de colores y fuente Inter |
| `vite.config.ts` | Alias `@` para imports absolutos y plugin React |

---

*Última actualización: 20 de Febrero, 2026 — Máquina de desarrollo local (edward@linux)*
