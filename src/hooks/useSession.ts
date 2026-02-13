import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import { formatTime } from '../utils/time';

type WorkSession = Database['public']['Tables']['work_sessions']['Row'] & {
    work_pauses: Database['public']['Tables']['work_pauses']['Row'][];
};

export function useSession() {
    const [activeSession, setActiveSession] = useState<WorkSession | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [loading, setLoading] = useState(true);
    const timerRef = useRef<number | null>(null);
    const hasInitialized = useRef(false);

    const [abandonedSession, setAbandonedSession] = useState<{ id: string; timeMessage: string } | null>(null);

    // Helper to format time HH:MM:SS

    const calculateElapsedTime = useCallback((session: WorkSession) => {
        const start = new Date(session.start_time).getTime();
        const now = Date.now();

        let totalPauseMs = 0;
        let isCurrentlyPaused = false;
        let currentPauseStart = 0;

        session.work_pauses.forEach(pause => {
            if (pause.pause_end) {
                totalPauseMs += new Date(pause.pause_end).getTime() - new Date(pause.pause_start).getTime();
            } else {
                // Open pause
                isCurrentlyPaused = true;
                currentPauseStart = new Date(pause.pause_start).getTime();
            }
        });

        if (isCurrentlyPaused) {
            // If paused, elapsed time is fixed to (pauseStart - start - prevPauses)
            // Or simply: duration doesn't count the current open pause.
            // But wait, if we do (now - start), that includes the open pause time.
            // So we subtract (now - currentPauseStart) as well.
            const currentPauseDuration = now - currentPauseStart;
            totalPauseMs += currentPauseDuration;
        }

        const netMs = (now - start) - totalPauseMs;
        setElapsedTime(Math.max(0, Math.floor(netMs / 1000)));
    }, []);

    const loadActiveSession = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch session AND its pauses
            const { data, error } = await supabase
                .from('work_sessions')
                .select('*, work_pauses(*)')
                .eq('user_id', user.id)
                .in('status', ['active', 'paused'])
                .order('created_at', { ascending: false })
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
                console.error('Error loading session:', error);
                return;
            }

            if (data) {
                // @ts-ignore - Supabase type join inference
                const sessionWithPauses = data as WorkSession;
                setActiveSession(sessionWithPauses);
                setIsPaused(data.status === 'paused');
                calculateElapsedTime(sessionWithPauses);
            } else {
                setActiveSession(null);
                setElapsedTime(0);
                setIsPaused(false);
            }
        } finally {
            setLoading(false);
        }
    }, [calculateElapsedTime]);

    const checkAbandonedSessions = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return;
        }

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

            let timeMessage: string;
            if (hoursSinceStart >= 1) {
                timeMessage = `${Math.floor(hoursSinceStart)} horas`;
            } else {
                const minutes = Math.floor(msSinceStart / (1000 * 60));
                timeMessage = `${minutes} minutos`;
            }

            // Instead of confirm, set state for UI
            setAbandonedSession({
                id: data.id,
                timeMessage
            });
        } else {
            // If no abandoned session found, load normal session flow
            await loadActiveSession();
        }
    }, [loadActiveSession]);

    const recoverSession = async () => {
        if (!abandonedSession) return;

        // Simple recovery: just set status to active
        await supabase
            .from('work_sessions')
            .update({ status: 'active' })
            .eq('id', abandonedSession.id);

        setAbandonedSession(null);
        await loadActiveSession();
    };

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

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        checkAbandonedSessions();

        return () => {
            hasInitialized.current = false;
        };
    }, [checkAbandonedSessions]);

    useEffect(() => {
        if (!activeSession || isPaused) return;

        calculateElapsedTime(activeSession);

        timerRef.current = window.setInterval(() => {
            if (!activeSession || isPaused) return;
            calculateElapsedTime(activeSession);
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [activeSession, isPaused, calculateElapsedTime]);



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

    const pauseSession = async () => {
        //verifica que la sesion este activa
        if (!activeSession) return;
        if (isPaused || loading) return;

        calculateElapsedTime(activeSession);

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setIsPaused(true);
        setLoading(true);

        try {
            // 1. Crear pausa
            const { error: pauseError } = await supabase
                .from('work_pauses')
                .insert({
                    session_id: activeSession.id,
                    pause_start: new Date().toISOString(),
                });

            if (pauseError) throw pauseError;

            // 2. Actualizar estado de sesión
            const { error: sessionError } = await supabase
                .from('work_sessions')
                .update({ status: 'paused' })
                .eq('id', activeSession.id);

            if (sessionError) throw sessionError;

            await loadActiveSession();
        } catch (error) {
            console.error(error);

            // rollback si falla
            setIsPaused(false);
        } finally {
            setLoading(false);
        }
    };


    const resumeSession = async () => {
        if (!activeSession || !isPaused || loading) return;

        setIsPaused(false);
        setLoading(true);

        try {
            const { error: updatePauseError } = await supabase
                .from('work_pauses')
                .update({ pause_end: new Date().toISOString() })
                .eq('session_id', activeSession.id)
                .is('pause_end', null);

            if (updatePauseError) throw updatePauseError;

            const { error: sessionError } = await supabase
                .from('work_sessions')
                .update({ status: 'active' })
                .eq('id', activeSession.id);

            if (sessionError) throw sessionError;

            // 🔥 ESTA LÍNEA FALTABA
            await loadActiveSession();

        } catch (error) {
            console.error(error);
            setIsPaused(true);
        } finally {
            setLoading(false);
        }
    };



    const endSession = async () => {
        if (!activeSession) throw new Error("No active session");

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setIsPaused(true);
        // Calculate final net time
        // Since loadActiveSession fetches pauses, activeSession should have them.
        // But to be super safe and ensuring we have latest, we can re-calculate or just trust formatTime(elapsedTime) if logic is sound.
        // Better: rely on the elapsedTime state which tracks net seconds (mostly).
        // Actually best: re-calculate from DB or current state to be precise.

        // We can reuse the logic we already have in calculating elapsed time, but we need final precise values.

        const { data: pauses } = await supabase
            .from('work_pauses')
            .select('pause_start, pause_end')
            .eq('session_id', activeSession.id);

        let totalPauseTimeMs = 0;
        if (pauses) {
            pauses.forEach(p => {
                const end = p.pause_end ? new Date(p.pause_end).getTime() : Date.now();
                const start = new Date(p.pause_start).getTime();
                totalPauseTimeMs += end - start;
            });
        }

        const start = new Date(activeSession.start_time).getTime();
        const end = Date.now();
        const netWorkSeconds = Math.max(0, Math.floor(((end - start) - totalPauseTimeMs) / 1000));
        const formattedDuration = formatTime(netWorkSeconds);

        const { error } = await supabase
            .from('work_sessions')
            .update({
                end_time: new Date().toISOString(),
                status: 'completed',
                total_duration: formattedDuration
            })
            .eq('id', activeSession.id);

        if (error) throw error;

        setActiveSession(null);
        setElapsedTime(0);
        setIsPaused(false);
    };

    return {
        activeSession,
        abandonedSession,
        elapsedSeconds: elapsedTime,
        elapsedTime: formatTime(elapsedTime),
        pauseCount: activeSession?.work_pauses?.length ?? 0,
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
