import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type WorkSession = Database['public']['Tables']['work_sessions']['Row'] & {
    work_pauses: { count: number }[];
};

export function useHistory() {
    const [sessions, setSessions] = useState<WorkSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSessions = useCallback(async (startDate?: Date, endDate?: Date) => {
        try {
            setLoading(true);
            setError(null);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let query = supabase
                .from('work_sessions')
                .select('*, work_pauses(count)')
                .eq('user_id', user.id)
                .eq('status', 'completed')
                .order('start_time', { ascending: false });

            if (startDate) {
                query = query.gte('start_time', startDate.toISOString());
            }

            if (endDate) {
                // End of day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query = query.lte('start_time', end.toISOString());
            }

            const { data, error } = await query;

            if (error) throw error;

            // @ts-ignore - Supabase types join inference can be tricky, casting data
            setSessions(data as any);

        } catch (err: any) {
            console.error('Error loading history:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateSession = async (sessionId: string, updates: Partial<WorkSession>) => {
        try {
            const { error } = await supabase
                .from('work_sessions')
                .update(updates)
                .eq('id', sessionId);

            if (error) throw error;

            // Reload to update UI
            await loadSessions();
            return true;
        } catch (err: any) {
            console.error('Error updating session:', err);
            setError(err.message);
            return false;
        }
    };

    const deleteSession = async (sessionId: string) => {
        try {
            const { error } = await supabase
                .from('work_sessions')
                .delete()
                .eq('id', sessionId);

            if (error) throw error;

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
