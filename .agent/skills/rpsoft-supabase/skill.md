---
description: Estándar técnico y buenas prácticas para el trabajo con Supabase en RPSoft
---

# Skill: Desarrollo y Mantenimiento en Supabase

## 🎯 Propósito

### Qué problema resuelve
Estandariza el desarrollo, mantenimiento y evolución de la infraestructura de base de datos en Supabase, evitando inconsistencias, problemas de seguridad y deuda técnica acumulada por falta de normas claras.

### Por qué existe
Para asegurar que todo el equipo de ingeniería siga los mismos patrones de diseño, nomenclatura y seguridad, facilitando la escalabilidad y el mantenimiento a largo plazo.

### Cuándo debe aplicarse
- Al crear nuevas tablas, funciones o políticas.
- Al modificar estructuras existentes.
- Durante revisiones de código (Code Reviews).
- En procesos de refactorización y optimización.

## 📐 Convenciones y estándares

### Naming Conventions
- **Tablas**: `snake_case`, plural (ej. `users`, `order_items`).
- **Columnas**: `snake_case` (ej. `created_at`, `user_id`).
- **Claves Foráneas**: `singular_table_name_id` (ej. `user_id` referencia a `users.id`).
- **Índices**: `idx_tablename_columnname`.
- **Funciones**: `verb_subject` (ej. `calculate_total`, `get_user_profile`).
- **Triggers**: `tr_tablename_action` (ej. `tr_users_update_timestamp`).

### Estructura Recomendada
- Utilizar esquemas para separar lógica si la aplicación crece (ej. `auth`, `public`, `app_private`).
- Mantener la lógica de negocio compleja fuera de la base de datos cuando sea posible, a menos que sea crucial para la integridad de datos o rendimiento masivo.

### Buenas Prácticas Obligatorias
- **Primary Keys**: Siempre usar `UUID` o `BIGINT` como claves primarias. Evitar claves compuestas complejas.
- **Timestamps**: Todas las tablas deben tener `created_at` y `updated_at` (gestionado por trigger o default).
- **Relaciones**: Definir explícitamente las FK constraints.

### Reglas de Arquitectura
- **RLS (Row Level Security)**: Habilitado por defecto en TODAS las tablas públicas.
- **Extensiones**: Solo activar extensiones aprobadas y necesarias.

## 🔐 Seguridad

### Riesgos Comunes
- Exposición accidental de datos sensibles por malas políticas RLS.
- Inyección SQL en funciones dinámicas (evitar `EXECUTE` con strings concatenados).

### Reglas Obligatorias
- **RLS**: Debe estar activo (`ALTER TABLE x ENABLE ROW LEVEL SECURITY`).
- **Anon Key**: Solo debe tener permisos de lectura estrictamente necesarios.
- **Service Role Key**: Uso exclusivo en backend seguro, nunca en cliente.

### Manejo de Permisos
- Crear roles específicos si la lógica de acceso es compleja.
- Usar funciones `auth.uid()` para filtrar datos por usuario.

## 🧱 Implementación Base

### Código Recomendado

```sql
-- Ejemplo de creación de tabla estándar
CREATE TABLE public.items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Política de lectura para dueños
CREATE POLICY "Users can view own items" ON public.items
    FOR SELECT USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER tr_items_update_timestamp
    BEFORE UPDATE ON public.items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 🔎 Auditoría y Mejora Continua

### Cómo analizar lo existente
- Revisar `pg_stat_statements` para queries lentas.
- Verificar tablas sin RLS:
  ```sql
  SELECT relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r' AND n.nspname = 'public' AND NOT c.relrowsecurity;
  ```

### Detectar Deuda Técnica
- Índices duplicados o no utilizados.
- Funciones obsoletas.
- Políticas RLS permisivas (`USING (true)`).

## 🔁 Flujo Seguro de Cambios

1. **Análisis**: Entender el impacto del cambio en datos existentes y aplicaciones conectadas.
2. **Verificación de Impacto**: Revisar dependencias (FKs, Triggers, RLS).
3. **Migración Reversible**: Los scripts de migración deben tener un script de rollback ("down").
4. **Testing en Staging**: Aplicar migración en un entorno réplica antes de producción.
5. **Monitoreo**: Vigilar logs de errores y rendimiento post-deploy.
6. **Deploy Final**: Ejecutar en producción en horario de bajo tráfico si implica bloqueos.

## 🛡 Reglas Críticas

- **No romper compatibilidad**: Evitar renombrar columnas usadas; preferir agregar nuevas y deprecar las viejas.
- **No afectar seguridad**: Nunca deshabilitar RLS temporalmente en producción.
- **Validación Manual**: Siempre revisar el plan de ejecución (`EXPLAIN ANALYZE`) de queries complejas nuevas.
