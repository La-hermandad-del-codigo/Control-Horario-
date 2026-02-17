# Estándares de Base de Datos y Supabase

Este documento guía a los desarrolladores en la creación, mantenimiento y evolución de nuestra base de datos en Supabase. Sigue estos lineamientos para asegurar calidad, rendimiento y seguridad.

## 🚀 Checklist para Nuevos Desarrollos

Antes de solicitar un Pull Request o aplicar cambios, verifica:

- [ ] **Nombres**: ¿Tablas en plural/snake_case? ¿Columnas claras?
- [ ] **Tipos de Datos**: ¿Usas UUID para IDs? ¿Tipos adecuados para el contenido (TEXT, TIMESTAMPTZ)?
- [ ] **Integridad**: ¿Foreign Keys definidas? ¿Constraints NOT NULL donde aplica?
- [ ] **Auditoría**: ¿Columnas `created_at` y `updated_at` presentes?
- [ ] **Seguridad**: **RLS HABILITADO** y políticas definidas?
- [ ] **Performance**: ¿Índices creados para columnas de filtro frecuente?

## 📝 Guía Rápida de Implementación

### 1. Definición de Tablas
Usamos SQL estándar. Evita usar la UI de Supabase para cambios estructurales permanentes; prefiere migraciones o scripts versionados.

```sql
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  status text default 'active' check (status in ('active', 'archived')),
  owner_id uuid references auth.users(id) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
```

### 2. Seguridad (RLS)
La seguridad no es opcional.

```sql
alter table public.projects enable row level security;

-- Política: Solo el dueño ve sus proyectos
create policy "Individuals can view their own projects"
on public.projects for select
using ( auth.uid() = owner_id );
```

### 3. Funciones y Triggers
Usa funciones para lógica repetitiva o triggers de auditoría automática.

```sql
-- Función estándar para actualizar timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger tr_projects_updated_at
before update on public.projects
for each row execute function update_updated_at_column();
```

## 🚫 Qué NO hacer

- ❌ **No uses `public` para todo**: Si algo es interno del sistema, considera otro esquema o tablas privadas.
- ❌ **No ignores los errores de RLS**: Si una query no devuelve datos, revisa las políticas antes de culpar al código.
- ❌ **No borres columnas en producción**: A menos que estés 100% seguro de que nadie las usa. Marca como deprecated primero.

## 💡 Mejores Prácticas

- **Comentarios**: Comenta tablas y columnas si su propósito no es obvio.
  `comment on table public.projects is 'Proyectos creados por usuarios';`
- **Migraciones**: Todo cambio de esquema debe ser reproducible. Guarda tus SQLs en el repositorio.
- **Backups**: Aunque Supabase gestiona backups, ten cuidado con operaciones masivas (`DELETE`, `UPDATE`) sin `WHERE`.

## 🛠 Recursos y Comandos Útiles

- Documentación oficial: [Supabase Database](https://supabase.com/docs/guides/database)
- Guía de PostgreSQL: [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

---
