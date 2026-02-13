/**
 * Tipos generados de la base de datos de Supabase.
 *
 * Este archivo define la estructura completa de la base de datos utilizada
 * por la aplicación Control-Horario. Está tipado para que el cliente de
 * Supabase provea autocompletado y validación de tipos en tiempo de compilación.
 *
 * Tablas definidas:
 * - `profiles`: Perfiles de usuario (id, email, nombre, zona horaria).
 * - `work_sessions`: Sesiones de trabajo con estados (active, paused, completed, abandoned).
 * - `work_pauses`: Pausas dentro de una sesión de trabajo.
 *
 * Funciones RPC:
 * - `check_abandoned_sessions`: Detecta sesiones olvidadas abiertas por mucho tiempo.
 *
 * Cada tabla tiene 3 sub-tipos:
 * - `Row`: Tipo de lectura (todos los campos obligatorios).
 * - `Insert`: Tipo de inserción (campos con default son opcionales).
 * - `Update`: Tipo de actualización (todos los campos son opcionales).
 * - `Relationships`: Define las relaciones con claves foráneas.
 */

/**
 * Tipo base para valores JSON en la base de datos.
 * Puede ser string, number, boolean, null, objeto JSON o array JSON.
 */
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

/**
 * Tipo principal de la base de datos.
 * Define el esquema público ('public') con todas las tablas, vistas, funciones, etc.
 */
export type Database = {
    public: {
        Tables: {
            /**
             * Tabla `profiles`: Almacena los perfiles de los usuarios.
             *
             * Campos:
             * - `id` (string): UUID del usuario, referencia a auth.users.
             * - `email` (string): Correo electrónico del usuario.
             * - `full_name` (string | null): Nombre completo (opcional).
             * - `timezone` (string): Zona horaria del usuario (default del DB).
             * - `created_at` (string): Timestamp de creación.
             * - `updated_at` (string): Timestamp de última actualización.
             */
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    timezone: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    timezone?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    timezone?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            /**
             * Tabla `work_sessions`: Sesiones de trabajo de los usuarios.
             *
             * Campos:
             * - `id` (string): UUID único de la sesión.
             * - `user_id` (string): UUID del usuario propietario.
             * - `start_time` (string): Timestamp ISO de inicio.
             * - `end_time` (string | null): Timestamp ISO de fin (null si activa).
             * - `total_duration` (string | null): Duración neta formateada "HH:MM:SS".
             * - `status`: Estado de la sesión ('active' | 'paused' | 'completed' | 'abandoned').
             * - `notes` (string | null): Notas opcionales del usuario.
             * - `device_info` (Json | null): Info del dispositivo (userAgent, platform).
             * - `created_at` / `updated_at`: Timestamps automáticos.
             */
            work_sessions: {
                Row: {
                    id: string
                    user_id: string
                    start_time: string
                    end_time: string | null
                    total_duration: string | null
                    status: 'active' | 'paused' | 'completed' | 'abandoned'
                    notes: string | null
                    device_info: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    start_time: string
                    end_time?: string | null
                    total_duration?: string | null
                    status: 'active' | 'paused' | 'completed' | 'abandoned'
                    notes?: string | null
                    device_info?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    start_time?: string
                    end_time?: string | null
                    total_duration?: string | null
                    status?: 'active' | 'paused' | 'completed' | 'abandoned'
                    notes?: string | null
                    device_info?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "work_sessions_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            /**
             * Tabla `work_pauses`: Pausas dentro de una sesión de trabajo.
             *
             * Campos:
             * - `id` (string): UUID único de la pausa.
             * - `session_id` (string): UUID de la sesión a la que pertenece.
             * - `pause_start` (string): Timestamp ISO de inicio de la pausa.
             * - `pause_end` (string | null): Timestamp ISO de fin (null = pausa abierta).
             * - `created_at` (string): Timestamp de creación.
             */
            work_pauses: {
                Row: {
                    id: string
                    session_id: string
                    pause_start: string
                    pause_end: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    session_id: string
                    pause_start: string
                    pause_end?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    session_id?: string
                    pause_start?: string
                    pause_end?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "work_pauses_session_id_fkey"
                        columns: ["session_id"]
                        referencedRelation: "work_sessions"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        /**
         * Funciones RPC (Remote Procedure Calls) de la base de datos.
         *
         * `check_abandoned_sessions`: Función SQL que detecta sesiones de trabajo
         * que llevan demasiado tiempo abiertas sin actividad.
         * - Args: no recibe parámetros.
         * - Returns: array de { session_id, hours_since_start }.
         */
        Functions: {
            check_abandoned_sessions: {
                Args: Record<string, never>
                Returns: {
                    session_id: string
                    hours_since_start: number
                }[]
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
