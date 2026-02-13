// useState: estado local. useEffect: efectos secundarios.
// useCallback: memoriza funciones. useRef: referencia mutable que persiste entre renders.
import { useState, useEffect, useCallback, useRef } from 'react';

// supabase: instancia del cliente de Supabase.
import { supabase } from '../lib/supabase';

// Database: tipos generados de la base de datos.
import type { Database } from '../types/database.types';
import { formatTime } from '../utils/time';

/**
 * Tipo extendido de sesión de trabajo.
 * Incluye la relación con las pausas (work_pauses) completas, no solo el conteo.
 */
type WorkSession = Database['public']['Tables']['work_sessions']['Row'] & {
    work_pauses: Database['public']['Tables']['work_pauses']['Row'][];
};

/**
 * Hook principal para gestionar la sesión de trabajo activa del usuario.
 *
 * Este es el hook más complejo de la aplicación. Maneja todo el ciclo de vida
 * de una sesión de trabajo: iniciar, pausar, reanudar y finalizar.
 *
 * Funcionalidades:
 * - Carga la sesión activa/pausada al montar.
 * - Detecta sesiones abandonadas (abiertas por muchas horas sin actividad).
 * - Cronómetro en tiempo real que descuenta el tiempo de pausas.
 * - Cálculo preciso de tiempo neto de trabajo.
 *
 * @returns {Object} Objeto con:
 * - `activeSession` {WorkSession | null} - Sesión activa actual.
 * - `abandonedSession` {Object | null} - Sesión abandonada detectada, con id y timeMessage.
 * - `elapsedTime` {string} - Tiempo transcurrido formateado como "HH:MM:SS".
 * - `elapsedSeconds` {number} - Tiempo transcurrido en segundos (sin formatear).
 * - `pauseCount` {number} - Número de pausas en la sesión activa.
 * - `isPaused` {boolean} - Si la sesión está pausada actualmente.
 * - `loading` {boolean} - Si se está cargando o procesando una operación.
 * - `startSession` {Function} - Inicia una nueva sesión de trabajo.
 * - `pauseSession` {Function} - Pausa la sesión activa.
 * - `resumeSession` {Function} - Reanuda una sesión pausada.
 * - `endSession` {Function} - Finaliza la sesión y calcula la duración total.
 * - `recoverSession` {Function} - Recupera una sesión abandonada.
 * - `discardSession` {Function} - Descarta una sesión abandonada.
 */
export function useSession() {
    // Sesión de trabajo activa actual (null si no hay ninguna).
    const [activeSession, setActiveSession] = useState<WorkSession | null>(null);

    // Tiempo transcurrido en segundos (neto, sin contar pausas).
    const [elapsedTime, setElapsedTime] = useState(0);

    // Indica si la sesión actual está pausada.
    const [isPaused, setIsPaused] = useState(false);

    // Indica si se está cargando la sesión o procesando una operación.
    const [loading, setLoading] = useState(true);

    // Referencia al intervalo del timer. Se usa useRef para no perder la referencia
    // entre re-renders y poder limpiar el intervalo correctamente.
    const timerRef = useRef<number | null>(null);
    const hasInitialized = useRef(false);

    // Sesión abandonada detectada: contiene su id y un mensaje de tiempo legible.
    const [abandonedSession, setAbandonedSession] = useState<{ id: string; timeMessage: string } | null>(null);

    /**
     * Calcula el tiempo neto transcurrido de una sesión, descontando todas las pausas.
     *
     * Lógica:
     * 1. Calcula el tiempo total desde el inicio de la sesión hasta ahora.
     * 2. Resta el tiempo de todas las pausas completadas (con pause_end).
     * 3. Si hay una pausa abierta (sin pause_end), resta también el tiempo
     *    transcurrido desde que empezó esa pausa hasta ahora.
     * 4. Actualiza el estado `elapsedTime` con el resultado en segundos.
     *
     * @param {WorkSession} session - Sesión con sus pausas para calcular.
     */
    const calculateElapsedTime = useCallback((session: WorkSession) => {
        const start = new Date(session.start_time).getTime();
        const now = Date.now();

        let totalPauseMs = 0;          // Tiempo total pausado en milisegundos.
        let isCurrentlyPaused = false; // Si hay una pausa abierta ahora.
        let currentPauseStart = 0;     // Timestamp de inicio de la pausa actual.

        // Recorre todas las pausas de la sesión.
        session.work_pauses.forEach(pause => {
            if (pause.pause_end) {
                // Pausa completada: suma su duración al total.
                totalPauseMs += new Date(pause.pause_end).getTime() - new Date(pause.pause_start).getTime();
            } else {
                // Pausa abierta (sin fin): la sesión está actualmente pausada.
                isCurrentlyPaused = true;
                currentPauseStart = new Date(pause.pause_start).getTime();
            }
        });

        if (isCurrentlyPaused) {
            // Si hay una pausa abierta, suma el tiempo desde que empezó hasta ahora
            // para que el cronómetro no cuente el tiempo pausado.
            const currentPauseDuration = now - currentPauseStart;
            totalPauseMs += currentPauseDuration;
        }

        // Tiempo neto = (tiempo total) - (tiempo pausado). Mínimo 0 para evitar negativos.
        const netMs = (now - start) - totalPauseMs;
        setElapsedTime(Math.max(0, Math.floor(netMs / 1000)));
    }, []);

    /**
     * Carga la sesión activa o pausada del usuario desde la base de datos.
     *
     * Busca sesiones con estado 'active' o 'paused' del usuario actual.
     * Si encuentra una, calcula el tiempo transcurrido y establece el estado.
     * Si no encuentra ninguna, reinicia todos los estados.
     *
     * Usa `maybeSingle()` porque se espera 0 o 1 resultado (no debería haber
     * más de una sesión activa a la vez).
     */
    const loadActiveSession = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Consulta la sesión activa/pausada más reciente del usuario,
            // incluyendo todas sus pausas asociadas.
            const { data, error } = await supabase
                .from('work_sessions')
                .select('*, work_pauses(*)')
                .eq('user_id', user.id)
                .in('status', ['active', 'paused'])
                .order('created_at', { ascending: false })
                .maybeSingle();

            // PGRST116 = "No rows found" → no es un error real, simplemente no hay sesión.
            if (error && error.code !== 'PGRST116') {
                console.error('Error loading session:', error);
                return;
            }

            if (data) {
                // @ts-ignore - Inferencia de tipos con joins de Supabase.
                const sessionWithPauses = data as WorkSession;
                setActiveSession(sessionWithPauses);
                setIsPaused(data.status === 'paused');
                calculateElapsedTime(sessionWithPauses);
            } else {
                // No hay sesión activa: reinicia todos los estados.
                setActiveSession(null);
                setElapsedTime(0);
                setIsPaused(false);
            }
        } finally {
            setLoading(false);
        }
    }, [calculateElapsedTime]);

    /**
     * Verifica si hay sesiones "abandonadas" (abiertas por demasiado tiempo).
     *
     * Si encuentra una sesión abandonada, en lugar de usar `window.confirm`,
     * guarda el estado en `abandonedSession` para que la UI lo maneje.
     * El mensaje de tiempo se expresa en horas (si ≥ 1h) o en minutos.
     *
     * Después de detectar la sesión, espera la acción del usuario
     * a través de `recoverSession` o `discardSession`.
     */
    const checkAbandonedSessions = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('work_sessions')
            .select('id, start_time')
            .eq('user_id', user.id)
            .in('status', ['active', 'paused'])
            .order('created_at', { ascending: false })
            .maybeSingle();

        if (error) {
            console.error('Error checking sessions:', error);
            return;
        }

        if (data) {
            const msSinceStart = Date.now() - new Date(data.start_time).getTime();
            const hoursSinceStart = msSinceStart / (1000 * 3600);

            // Formatea el mensaje de tiempo: horas si ≥ 1h, minutos si no.
            let timeMessage: string;
            if (hoursSinceStart >= 1) {
                timeMessage = `${Math.floor(hoursSinceStart)} horas`;
            } else {
                const minutes = Math.floor(msSinceStart / (1000 * 60));
                timeMessage = `${minutes} minutos`;
            }

            // En lugar de window.confirm, expone el estado para que la UI decida.
            setAbandonedSession({
                id: data.id,
                timeMessage
            });
        } else {
            // Si no hay sesión abandonada, continúa con el flujo normal.
            await loadActiveSession();
        }
    }, [loadActiveSession]);

    /**
     * Recupera una sesión abandonada marcándola de nuevo como 'active'.
     * Luego recarga la sesión activa normalmente.
     */
    const recoverSession = async () => {
        if (!abandonedSession) return;

        await supabase
            .from('work_sessions')
            .update({ status: 'active' })
            .eq('id', abandonedSession.id);

        setAbandonedSession(null);
        await loadActiveSession();
    };

    /**
     * Descarta una sesión abandonada marcándola como 'abandoned'
     * con la hora actual como tiempo de fin.
     * Luego recarga la sesión activa normalmente.
     */
    const discardSession = async () => {
        if (!abandonedSession) return;

        await supabase
            .from('work_sessions')
            .update({
                status: 'abandoned',
                end_time: new Date().toISOString()
            })
            .eq('id', abandonedSession.id);

        setAbandonedSession(null);
        await loadActiveSession();
    };

    // Efecto de inicialización: al montar el componente,
    // primero verifica sesiones abandonadas y luego carga la sesión activa.
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        checkAbandonedSessions();

        return () => {
            hasInitialized.current = false;
        };
    }, [checkAbandonedSessions]);

    /**
     * Efecto del cronómetro.
     *
     * Si hay una sesión activa y NO está pausada, crea un intervalo que
     * recalcula el tiempo neto cada segundo usando `calculateElapsedTime`.
     * Si la sesión se pausa o se elimina, limpia el intervalo.
     * El cleanup del efecto también limpia el intervalo al desmontar.
     */
    useEffect(() => {
        if (!activeSession || isPaused) return;

        // Calcula el tiempo inicial al activar el efecto.
        calculateElapsedTime(activeSession);

        timerRef.current = window.setInterval(() => {
            calculateElapsedTime(activeSession);
        }, 1000);

        // Cleanup: limpia el intervalo al cambiar dependencias o desmontar.
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [activeSession, isPaused, calculateElapsedTime]);

    /**
     * Inicia una nueva sesión de trabajo.
     *
     * Crea un registro en `work_sessions` con:
     * - user_id del usuario actual.
     * - start_time con la hora actual.
     * - status 'active'.
     * - device_info con información del navegador/dispositivo.
     *
     * @throws {Error} Si ya hay una sesión activa o no hay usuario autenticado.
     */
    const startSession = async () => {
        if (activeSession) throw new Error("Ya hay una sesión activa");

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No authenticated user");

        const { data, error } = await supabase
            .from('work_sessions')
            .insert({
                user_id: user.id,
                start_time: new Date().toISOString(),
                status: 'active',
                device_info: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform
                }
            })
            .select('*, work_pauses(*)')
            .single();

        if (error) throw error;

        // @ts-ignore
        setActiveSession(data as WorkSession);
        setIsPaused(false);
        setElapsedTime(0);
    };

    /**
     * Pausa la sesión activa actual.
     *
     * Flujo:
     * 1. Crea un registro de pausa en `work_pauses` con `pause_start` = ahora.
     * 2. Actualiza el estado de la sesión a 'paused' en `work_sessions`.
     * 3. Recarga la sesión para sincronizar el estado.
     *
     * Si ocurre un error, hace rollback del estado de pausa en la UI.
     * Incluye guard clause para evitar pausas duplicadas o durante carga.
     */
    const pauseSession = async () => {
        // Verifica que la sesión esté activa, no pausada y no en carga.
        if (!activeSession) return;
        if (isPaused || loading) return;

        // Congela el tiempo calculado antes de pausar y detiene el cronómetro.
        calculateElapsedTime(activeSession);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Actualización optimista: marca como pausada inmediatamente en la UI.
        setIsPaused(true);
        setLoading(true);

        try {
            // 1. Crear registro de pausa en la base de datos.
            const { error: pauseError } = await supabase
                .from('work_pauses')
                .insert({
                    session_id: activeSession.id,
                    pause_start: new Date().toISOString(),
                });

            if (pauseError) throw pauseError;

            // 2. Actualizar estado de la sesión a 'paused'.
            const { error: sessionError } = await supabase
                .from('work_sessions')
                .update({ status: 'paused' })
                .eq('id', activeSession.id);

            if (sessionError) throw sessionError;

            // 3. Recargar la sesión para sincronizar con la base de datos.
            await loadActiveSession();
        } catch (error) {
            console.error(error);

            // Rollback: si falla la operación, deshace el estado optimista.
            setIsPaused(false);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Reanuda una sesión que está pausada.
     *
     * Flujo:
     * 1. Cierra la pausa activa: establece `pause_end` = ahora en la pausa abierta
     *    (la que tiene `pause_end` = null).
     * 2. Actualiza el estado de la sesión a 'active'.
     * 3. Recarga la sesión para sincronizar el estado y reanudar el cronómetro.
     *
     * Si ocurre un error, hace rollback del estado de pausa en la UI.
     */
    const resumeSession = async () => {
        if (!activeSession || !isPaused || loading) return;

        // Desbloqueo inmediato en UI (actualización optimista).
        setIsPaused(false);
        setLoading(true);

        try {
            // 1. Cerrar la pausa activa: busca la pausa sin pause_end y la cierra.
            const { error: updatePauseError } = await supabase
                .from('work_pauses')
                .update({ pause_end: new Date().toISOString() })
                .eq('session_id', activeSession.id)
                .is('pause_end', null);

            if (updatePauseError) throw updatePauseError;

            // 2. Actualizar estado de la sesión a 'active'.
            const { error: sessionError } = await supabase
                .from('work_sessions')
                .update({ status: 'active' })
                .eq('id', activeSession.id);

            if (sessionError) throw sessionError;

            // 3. Recargar la sesión para sincronizar con la base de datos.
            // El cronómetro se reanuda automáticamente por el efecto del timer.
            await loadActiveSession();
        } catch (error) {
            console.error(error);

            // Rollback: si falla, vuelve a marcar como pausada.
            setIsPaused(true);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Finaliza la sesión activa y calcula la duración total neta de trabajo.
     *
     * Flujo:
     * 1. Detiene el cronómetro inmediatamente.
     * 2. Obtiene todas las pausas de la sesión desde la base de datos.
     * 3. Calcula el tiempo total pausado (sumando cada pausa).
     *    Si una pausa no tiene fin, usa Date.now() como fin.
     * 4. Calcula el tiempo neto = (fin - inicio) - pausas totales.
     * 5. Actualiza la sesión con end_time, status='completed' y total_duration formateada.
     * 6. Reinicia todos los estados locales.
     *
     * @throws {Error} Si no hay sesión activa.
     */
    const endSession = async () => {
        if (!activeSession) throw new Error("No active session");

        // Detiene el cronómetro antes de calcular el tiempo final.
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Obtiene todas las pausas de la sesión para cálculo preciso.
        const { data: pauses } = await supabase
            .from('work_pauses')
            .select('pause_start, pause_end')
            .eq('session_id', activeSession.id);

        // Calcula el tiempo total de pausas en milisegundos.
        let totalPauseTimeMs = 0;
        if (pauses) {
            pauses.forEach(p => {
                // Si la pausa no tiene fin (abierta), usa la hora actual.
                const end = p.pause_end ? new Date(p.pause_end).getTime() : Date.now();
                const start = new Date(p.pause_start).getTime();
                totalPauseTimeMs += end - start;
            });
        }

        // Calcula la duración neta de trabajo.
        const start = new Date(activeSession.start_time).getTime();
        const end = Date.now();
        const netWorkSeconds = Math.max(0, Math.floor(((end - start) - totalPauseTimeMs) / 1000));
        const formattedDuration = formatTime(netWorkSeconds);

        // Actualiza la sesión en la base de datos marcándola como completada.
        const { error } = await supabase
            .from('work_sessions')
            .update({
                end_time: new Date().toISOString(),
                status: 'completed',
                total_duration: formattedDuration
            })
            .eq('id', activeSession.id);

        if (error) throw error;

        // Reinicia todos los estados locales.
        setActiveSession(null);
        setElapsedTime(0);
        setIsPaused(false);
    };

    return {
        activeSession,
        abandonedSession,
        elapsedSeconds: elapsedTime,        // Tiempo en segundos sin formatear.
        elapsedTime: formatTime(elapsedTime), // Tiempo ya formateado como "HH:MM:SS".
        pauseCount: activeSession?.work_pauses?.length ?? 0, // Número de pausas en la sesión.
        isPaused,
        loading,
        startSession,
        pauseSession,
        resumeSession,
        endSession,
        recoverSession,
        discardSession
    };
}