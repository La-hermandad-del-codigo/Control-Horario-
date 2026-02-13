// createClient: función de Supabase para crear una instancia del cliente.
import { createClient } from '@supabase/supabase-js';

// Database: tipos generados de la base de datos para proveer tipado seguro
// en las consultas (autocompletado de tablas, columnas, etc.).
import type { Database } from '../types/database.types';

/**
 * Variables de entorno necesarias para conectar con Supabase.
 * Estas se definen en el archivo `.env.local` del proyecto con el prefijo VITE_
 * para que Vite las exponga al código del cliente.
 */

// URL del proyecto de Supabase (ej: "https://xxxx.supabase.co").
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Clave pública (anon key) del proyecto de Supabase.
// Esta clave es segura para el cliente ya que solo permite acceso según las
// políticas RLS (Row Level Security) configuradas en la base de datos.
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación: si faltan las variables de entorno, lanza un error inmediato
// para evitar errores crípticos más adelante.
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check .env.local');
}

/**
 * Instancia del cliente de Supabase.
 *
 * Se crea con el tipo genérico `Database` para habilitar el autocompletado
 * y tipado seguro en todas las consultas a la base de datos.
 *
 * Configuración de autenticación:
 * - `persistSession: true` → Persiste la sesión en localStorage para mantener
 *   al usuario logueado entre recargas de página.
 * - `autoRefreshToken: true` → Renueva automáticamente el token JWT cuando
 *   está próximo a expirar.
 * - `detectSessionInUrl: true` → Detecta tokens de sesión en la URL
 *   (útil para flujos OAuth y magic links).
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});
