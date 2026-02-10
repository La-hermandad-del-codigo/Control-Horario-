import { useEffect, useState } from 'react';
import { useHistory } from '../../hooks/useHistory';
import { Calendar, Trash2, Edit2, Filter, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import type { Database } from '../../types/database.types';

type WorkSession = Database['public']['Tables']['work_sessions']['Row'];

export const HistoryList = () => {
    const { sessions, loading, loadSessions, deleteSession, updateSession } = useHistory();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [editingSession, setEditingSession] = useState<WorkSession | null>(null);
    const [editForm, setEditForm] = useState({
        start_time: '',
        end_time: '',
        notes: ''
    });

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    const handleFilter = () => {
        loadSessions(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        loadSessions();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar esta sesión?')) {
            await deleteSession(id);
        }
    };

    const openEdit = (session: any) => {
        setEditingSession(session);
        // Convert to datetime-local format (YYYY-MM-DDThh:mm)
        const toLocalISO = (isoString: string) => {
            const date = new Date(isoString);
            return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        };

        setEditForm({
            start_time: toLocalISO(session.start_time),
            end_time: session.end_time ? toLocalISO(session.end_time) : '',
            notes: session.notes || ''
        });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSession) return;

        // Convert back to UTC ISO
        const toUTC = (localString: string) => new Date(localString).toISOString();

        await updateSession(editingSession.id, {
            start_time: toUTC(editForm.start_time),
            end_time: toUTC(editForm.end_time),
            notes: editForm.notes
        });
        setEditingSession(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Historial</h2>

                <div className="flex flex-wrap gap-2 items-center bg-card-bg/30 p-2 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="bg-transparent text-sm text-white focus:outline-none border-b border-gray-600 focus:border-primary-lime w-32"
                        />
                    </div>
                    <span className="text-gray-500">-</span>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="bg-transparent text-sm text-white focus:outline-none border-b border-gray-600 focus:border-primary-lime w-32"
                        />
                    </div>
                    <button
                        onClick={handleFilter}
                        className="p-2 bg-primary-lime/20 text-primary-lime rounded-lg hover:bg-primary-lime/30 transition-colors"
                        title="Filtrar"
                    >
                        <Filter size={16} />
                    </button>
                    {(startDate || endDate) && (
                        <button
                            onClick={clearFilters}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="Limpiar filtros"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-400">Cargando historial...</div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-10 text-gray-500 glass-card">
                    No hay sesiones registradas en este período.
                </div>
            ) : (
                <div className="grid gap-4">
                    {sessions.map(session => (
                        <div key={session.id} className="glass-card p-5 flex flex-col sm:flex-row justify-between gap-4 group hover:border-white/10 transition-all">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="text-lg font-bold text-white">
                                        {new Date(session.start_time).toLocaleDateString()}
                                    </div>
                                    <div className="px-2 py-0.5 rounded text-xs font-mono bg-gray-800 text-gray-400 border border-gray-700">
                                        {session.total_duration?.split('.')[0] || 'Unknown'}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-400 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <span>
                                        {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                        {session.end_time ? new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                                    </span>
                                    {session.work_pauses && session.work_pauses[0]?.count > 0 && (
                                        <span className="text-yellow-500/80">
                                            {session.work_pauses[0].count} pausa(s)
                                        </span>
                                    )}
                                </div>
                                {session.notes && (
                                    <div className="text-sm text-gray-500 italic mt-1">"{session.notes}"</div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEdit(session)}
                                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(session.id)}
                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingSession}
                onClose={() => setEditingSession(null)}
                title="Editar Sesión"
            >
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Inicio</label>
                        <input
                            type="datetime-local"
                            required
                            value={editForm.start_time}
                            onChange={e => setEditForm({ ...editForm, start_time: e.target.value })}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg p-3 text-white focus:border-primary-lime outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Fin</label>
                        <input
                            type="datetime-local"
                            required
                            value={editForm.end_time}
                            onChange={e => setEditForm({ ...editForm, end_time: e.target.value })}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg p-3 text-white focus:border-primary-lime outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Notas</label>
                        <textarea
                            value={editForm.notes}
                            onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg p-3 text-white focus:border-primary-lime outline-none min-h-[100px]"
                            placeholder="Notas opcionales..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setEditingSession(null)}
                            className="px-4 py-2 text-gray-300 hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary-lime text-dark-bg font-bold rounded-lg hover:bg-secondary-lime"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
