import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, List, Coffee } from 'lucide-react';
import { HistoryList } from '../components/history/HistoryList';
import { Calendar } from '../components/calendar/Calendar';
import { useHistory } from '../hooks/useHistory';
import type { Database } from '../types/database.types';

type WorkSession = Database['public']['Tables']['work_sessions']['Row'];

export default function Sessions() {
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedDaySessions, setSelectedDaySessions] = useState<WorkSession[]>([]);
    const { sessions, loadSessions } = useHistory();

    useEffect(() => {
        loadSessions(100); // Load more sessions for calendar view
    }, [loadSessions]);

    const handleDayClick = (date: Date, daySessions: WorkSession[]) => {
        setSelectedDate(date);
        setSelectedDaySessions(daySessions);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Historial de <span className="text-primary-lime">Sesiones</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Todas tus sesiones de trabajo registradas</p>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-card-bg/50 p-1 rounded-lg border border-gray-200 dark:border-white/5">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'list'
                            ? 'bg-primary-lime text-dark-bg font-medium'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                            }`}
                    >
                        <List size={18} />
                        <span>Lista</span>
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'calendar'
                            ? 'bg-primary-lime text-dark-bg font-medium'
                            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                            }`}
                    >
                        <CalendarIcon size={18} />
                        <span>Calendario</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'list' ? (
                <div className="glass-card p-6">
                    <HistoryList refreshTrigger={0} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-2 glass-card p-6">
                        <Calendar sessions={sessions} onDayClick={handleDayClick} />
                    </div>

                    {/* Day Details Panel */}
                    <div className="glass-card p-6 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {selectedDate ? (
                            <>
                                <div className="border-b border-gray-200 dark:border-white/10 pb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                                        {formatDate(selectedDate)}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {selectedDaySessions.length} sesión{selectedDaySessions.length !== 1 ? 'es' : ''}
                                    </p>
                                </div>

                                {selectedDaySessions.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedDaySessions.map(session => (
                                            <div
                                                key={session.id}
                                                className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-gray-900 dark:text-white font-medium">
                                                        {new Date(session.start_time).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                        {' - '}
                                                        {session.end_time
                                                            ? new Date(session.end_time).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })
                                                            : 'Activa'}
                                                    </span>
                                                    <div className="px-2 py-1 rounded text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                                        {session.total_duration?.split('.')[0] || '--:--:--'}
                                                    </div>
                                                </div>

                                                {session.notes && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-2">
                                                        "{session.notes}"
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-4 mt-3 text-xs">
                                                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500/80">
                                                        <Coffee size={14} />
                                                        {/* @ts-ignore - Supabase type join inference */}
                                                        {session.work_pauses?.[0]?.count || 0} pausa(s)
                                                    </span>
                                                    <div className={`px-2 py-1 rounded ${session.status === 'completed'
                                                        ? 'bg-green-500/10 text-green-600 dark:text-green-500'
                                                        : session.status === 'active'
                                                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-500'
                                                            : 'bg-gray-500/10 text-gray-500'
                                                        }`}>
                                                        {session.status === 'completed' ? 'Completada' :
                                                            session.status === 'active' ? 'Activa' :
                                                                session.status === 'paused' ? 'Pausada' : 'Abandonada'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-400 dark:text-gray-500">
                                        No hay sesiones en esta fecha
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 text-gray-400 dark:text-gray-500">
                                <CalendarIcon size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Selecciona un día para ver las sesiones</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

