import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Calendar } from './Calendar';
import { Clock, Coffee } from 'lucide-react';
import type { Database } from '../../types/database.types';

type WorkSession = Database['public']['Tables']['work_sessions']['Row'];

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessions: WorkSession[];
}

export const CalendarModal = ({ isOpen, onClose, sessions }: CalendarModalProps) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedDaySessions, setSelectedDaySessions] = useState<WorkSession[]>([]);

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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Calendario de Sesiones"
            size="large"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2">
                    <Calendar sessions={sessions} onDayClick={handleDayClick} />
                </div>

                {/* Day Details Panel */}
                <div className="glass-card p-6 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {selectedDate ? (
                        <>
                            <div className="border-b border-gray-100 dark:border-white/10 pb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                                    {formatDate(selectedDate)}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {selectedDaySessions.length} sesión{selectedDaySessions.length !== 1 ? 'es' : ''}
                                </p>
                            </div>

                            {selectedDaySessions.length > 0 ? (
                                <div className="space-y-3">
                                    {selectedDaySessions.map(session => (
                                        <div
                                            key={session.id}
                                            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-primary-lime" />
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
                                                </div>
                                                <div className="px-2 py-1 rounded text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                                    {session.total_duration?.split('.')[0] || '--:--:--'}
                                                </div>
                                            </div>

                                            {session.notes && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-2">
                                                    "{session.notes}"
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Coffee size={14} />
                                                    <span>Pausas: --</span>
                                                </div>
                                                <div className={`px-2 py-0.5 rounded ${session.status === 'completed'
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : session.status === 'active'
                                                        ? 'bg-blue-500/10 text-blue-500'
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
                                <div className="text-center py-10 text-gray-500">
                                    No hay sesiones en esta fecha
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            <Clock size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Selecciona un día para ver las sesiones</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};
