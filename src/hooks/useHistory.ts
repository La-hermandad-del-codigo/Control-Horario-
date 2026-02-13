// useState: maneja el estado local (sesiones, loading, error).
// useCallback: memoriza funciones para evitar re-renders innecesarios.
import { useState, useCallback } from 'react';

// supabase: instancia del cliente de Supabase.
import { supabase } from '../lib/supabase';

// Database: tipos generados de la base de datos para tipado seguro.
import type { Database } from '../types/database.types';

/**
 * Tipo extendido de sesión de trabajo.
 * Extiende el tipo base de `work_sessions` con la relación de pausas,
 * incluyendo el conteo de pausas (count) para mostrar en la UI.
 */
type WorkSession = Database['public']['Tables']['work_sessions']['Row'] & {
    work_pauses: { count: number }[];
};

/**
 * Hook personalizado para gestionar el historial de sesiones de trabajo completadas.
 *
 * Provee funciones para:
 * - Cargar las sesiones completadas del usuario.
 * - Actualizar una sesión existente (editar inicio, fin, notas).
 * - Eliminar una sesión del historial.
 *
 * @returns {Object} Objeto con:
 * - `sessions` {WorkSession[]} - Lista de sesiones completadas.
 * - `loading` {boolean} - Indica si se están cargando las sesiones.
 * - `error` {string | null} - Mensaje de error, si hay alguno.
 * - `loadSessions` {Function} - Carga las sesiones (con límite opcional).
 * - `updateSession` {Function} - Actualiza campos de una sesión.
 * - `deleteSession` {Function} - Elimina una sesión por ID.
 */
export function useHistory() {
    // Lista de sesiones de trabajo completadas.
    const [sessions, setSessions] = useState<WorkSession[]>([]);

    // Indica si se están cargando las sesiones desde la base de datos.
    const [loading, setLoading] = useState(false);

    // Mensaje de error en caso de fallo en alguna operación.
    const [error, setError] = useState<string | null>(null);

    /**
     * Carga las sesiones de trabajo completadas del usuario actual.
     *
     * Consulta a Supabase las sesiones con estado 'completed', ordenadas
     * por fecha de inicio descendente (más recientes primero).
     * Incluye el conteo de pausas (work_pauses(count)) de cada sesión.
     *
     * @param {number} limit - Número máximo de sesiones a cargar (por defecto 50).
     */
    const loadSessions = useCallback(async (limit: number = 50) => {
        try {
            setLoading(true);
            setError(null);

            // Obtiene el usuario autenticado actual.
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Construye la consulta a la tabla work_sessions.
            // - Selecciona todos los campos + conteo de pausas asociadas.
            // - Filtra por user_id del usuario actual y estado 'completed'.
            // - Ordena por start_time descendente (más recientes primero).
            // - Limita la cantidad de resultados.
            let query = supabase
                .from('work_sessions')
                .select('*, work_pauses(count)')
                .eq('user_id', user.id)
                .eq('status', 'completed')
                .order('start_time', { ascending: false })
                .limit(limit);

            const { data, error } = await query;

            if (error) throw error;

            // @ts-ignore - La inferencia de tipos de Supabase con joins puede ser imprecisa.
            setSessions(data as any);

        } catch (err: any) {
            console.error('Error loading history:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Actualiza los campos de una sesión de trabajo existente.
     *
     * Tras actualizar en la base de datos, recarga todas las sesiones
     * para reflejar los cambios en la UI.
     *
     * @param {string} sessionId - ID de la sesión a actualizar.
     * @param {Partial<WorkSession>} updates - Campos a actualizar (start_time, end_time, notes, etc.).
     * @returns {boolean} true si la actualización fue exitosa, false en caso de error.
     */
    const updateSession = async (sessionId: string, updates: Partial<WorkSession>) => {
        try {
            const { error } = await supabase
                .from('work_sessions')
                .update(updates)
                .eq('id', sessionId);

            if (error) throw error;

            // Recarga las sesiones para actualizar la UI con los cambios.
            await loadSessions();
            return true;
        } catch (err: any) {
            console.error('Error updating session:', err);
            setError(err.message);
            return false;
        }
    };

    /**
     * Elimina una sesión de trabajo de la base de datos.
     *
     * Tras eliminar, actualiza el estado local filtrando la sesión eliminada
     * sin necesidad de recargar desde la base de datos.
     *
     * @param {string} sessionId - ID de la sesión a eliminar.
     * @returns {boolean} true si la eliminación fue exitosa, false en caso de error.
     */
    const deleteSession = async (sessionId: string) => {
        try {
            const { error } = await supabase
                .from('work_sessions')
                .delete()
                .eq('id', sessionId);

            if (error) throw error;

            // Actualiza el estado local removiendo la sesión eliminada (optimistic update).
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            return true;
        } catch (err: any) {
            console.error('Error deleting session:', err);
            setError(err.message);
            return false;
        }
    };

    return {
        sessions,
        loading,
        error,
        loadSessions,
        updateSession,
        deleteSession
    };
}
