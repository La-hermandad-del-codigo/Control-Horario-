import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { getStartOfWeek } from '../utils/date';

type Props = {
    elapsedSeconds: number; // número real
    hasActiveSession: boolean;
};

export function useWeeklyStats({ elapsedSeconds, hasActiveSession }: Props) {
    const [weeklyBaseSeconds, setWeeklyBaseSeconds] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeeklySessions = async () => {
            try {
                setLoading(true);

                const startOfWeek = getStartOfWeek();

                const { data, error } = await supabase
                    .from('work_sessions')
                    .select('total_duration')
                    .eq('status', 'completed')
                    .gte('start_time', startOfWeek);

                if (error) {
                    console.error('Error fetching weekly sessions:', error);
                    return;
                }

                const intervalToSeconds = (interval: string) => {
                    const parts = interval.split(':').map(Number);
                    const [h = 0, m = 0, s = 0] = parts;
                    return h * 3600 + m * 60 + s;
                };

                const total = data?.reduce((acc, session) => {
                    if (!session.total_duration) return acc;
                    return acc + intervalToSeconds(session.total_duration);
                }, 0) ?? 0;

                setWeeklyBaseSeconds(total);

            } finally {
                setLoading(false);
            }
        };

        fetchWeeklySessions();
    }, []);

    // 🔥 Se recalcula automáticamente cuando cambia elapsedSeconds
    const totalWeeklySeconds = useMemo(() => {
        return weeklyBaseSeconds + (hasActiveSession ? elapsedSeconds : 0);
    }, [weeklyBaseSeconds, elapsedSeconds, hasActiveSession]);

    return {
        totalWeeklySeconds,
        loading
    };
}
