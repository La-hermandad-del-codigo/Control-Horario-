import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, List, Coffee } from 'lucide-react';
import { HistoryList } from '../components/history/HistoryList';
import { Calendar } from '../components/calendar/Calendar';
import { useHistory } from '../hooks/useHistory';
import { Card } from '../components/ui/Card';
import type { Database } from '../types/database.types';

type WorkSession = Database['public']['Tables']['work_sessions']['Row'];

export default function Sessions() {
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedDaySessions, setSelectedDaySessions] = useState<WorkSession[]>([]);
    const { sessions, loadSessions } = useHistory();

    useEffect(() => {
        loadSessions(100);
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
                    <h1 className="text-3xl font-bold text-gray-900">
                        Historial de <span className="text-blue-600">Sesiones</span>
                    </h1>
                    <p className="text-gray-500">Todas tus sesiones de trabajo registradas</p>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'list'
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        <List size={18} />
                        <span>Lista</span>
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'calendar'
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        <CalendarIcon size={18} />
                        <span>Calendario</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'list' ? (
                <HistoryList refreshTrigger={0} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-2">
                        <Card className="p-6">
                            <Calendar sessions={sessions} onDayClick={handleDayClick} />
                        </Card>
                    </div>

                    {/* Day Details Panel */}
                    <Card className="p-6 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {selectedDate ? (
                            <>
                                <div className="border-b border-gray-100 pb-4">
                                    <h3 className="text-lg font-bold text-gray-900 capitalize">
                                        {formatDate(selectedDate)}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedDaySessions.length} sesión{selectedDaySessions.length !== 1 ? 'es' : ''}
                                    </p>
                                </div>

                                {selectedDaySessions.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedDaySessions.map(session => (
                                            <div
                                                key={session.id}
                                                className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-gray-900 font-medium">
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
                                                    <div className="px-2 py-1 rounded text-xs font-mono bg-white text-gray-600 border border-gray-200">
                                                        {session.total_duration?.split('.')[0] || '--:--:--'}
                                                    </div>
                                                </div>

                                                {session.notes && (
                                                    <p className="text-sm text-gray-500 italic mt-2">
                                                        "{session.notes}"
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-4 mt-3 text-xs">
                                                    <span className="flex items-center gap-1 text-yellow-600">
                                                        <Coffee size={14} />
                                                        {/* @ts-expect-error - Supabase type join inference */}
                                                        {session.work_pauses?.[0]?.count || 0} pausa(s)
                                                    </span>
                                                    <div className={`px-2 py-1 rounded ${session.status === 'completed'
                                                        ? 'bg-green-50 text-green-600'
                                                        : session.status === 'active'
                                                            ? 'bg-blue-50 text-blue-600'
                                                            : 'bg-gray-100 text-gray-600'
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
                                    <div className="text-center py-10 text-gray-400">
                                        No hay sesiones en esta fecha
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                <CalendarIcon size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Selecciona un día para ver las sesiones</p>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
