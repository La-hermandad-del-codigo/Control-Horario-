
import { useEffect, useState } from 'react';
import { useHistory } from '../../hooks/useHistory';
import { Trash2, Edit2, Coffee } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Card } from '../ui/Card';
import { Table } from '../ui/Table';
import type { Database } from '../../types/database.types';

type WorkSession = Database['public']['Tables']['work_sessions']['Row'];

interface HistoryListProps {
    refreshTrigger?: number;
}

export const HistoryList = ({ refreshTrigger = 0 }: HistoryListProps) => {
    const { sessions, loading, loadSessions, deleteSession, updateSession } = useHistory();
    const [editingSession, setEditingSession] = useState<WorkSession | null>(null);
    const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

    const [editForm, setEditForm] = useState({
        start_time: '',
        end_time: '',
        notes: ''
    });

    useEffect(() => {
        void loadSessions(5);
    }, [loadSessions, refreshTrigger]);

    const handleDeleteClick = (id: string) => {
        setDeletingSessionId(id);
    };

    const confirmDelete = async () => {
        if (deletingSessionId) {
            await deleteSession(deletingSessionId);
            setDeletingSessionId(null);
        }
    };

    const openEdit = (session: WorkSession) => {
        setEditingSession(session);
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
        const toUTC = (localString: string) => new Date(localString).toISOString();

        await updateSession(editingSession.id, {
            start_time: toUTC(editForm.start_time),
            end_time: toUTC(editForm.end_time),
            notes: editForm.notes
        });
        setEditingSession(null);
    };

    if (loading) return <div className="text-center py-10 text-gray-500">Cargando historial...</div>;

    if (sessions.length === 0) {
        return (
            <Card className="text-center py-10 text-gray-500">
                No hay sesiones recientes.
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Historial Reciente</h2>
            <Card className="p-0 overflow-hidden">
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head>Fecha</Table.Head>
                            <Table.Head>Horario</Table.Head>
                            <Table.Head>Duración</Table.Head>
                            <Table.Head>Pausas</Table.Head>
                            <Table.Head>Notas</Table.Head>
                            <Table.Head className="text-right">Acciones</Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {sessions.map((session) => (
                            <Table.Row key={session.id}>
                                <Table.Cell>
                                    <span className="font-medium text-gray-900">
                                        {new Date(session.start_time).toLocaleDateString()}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <div className="text-gray-500">
                                        {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                        {session.end_time ? new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        {session.total_duration?.split('.')[0] || '...'}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="flex items-center gap-1 text-gray-500">
                                        <Coffee size={14} />
                                        {session.work_pauses?.[0]?.count || 0}
                                    </span>
                                </Table.Cell>
                                <Table.Cell>
                                    <span className="text-gray-500 italic truncate max-w-[150px] block">
                                        {session.notes || '-'}
                                    </span>
                                </Table.Cell>
                                <Table.Cell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openEdit(session)}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Editar"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(session.id)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
            </Card>

            <Modal
                isOpen={!!editingSession}
                onClose={() => setEditingSession(null)}
                title="Editar Sesión"
            >
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                        <input
                            type="datetime-local"
                            required
                            value={editForm.start_time}
                            onChange={e => setEditForm({ ...editForm, start_time: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                        <input
                            type="datetime-local"
                            required
                            value={editForm.end_time}
                            onChange={e => setEditForm({ ...editForm, end_time: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea
                            value={editForm.notes}
                            onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                            placeholder="Notas opcionales..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setEditingSession(null)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deletingSessionId}
                onClose={() => setDeletingSessionId(null)}
                onConfirm={confirmDelete}
                title="Eliminar sesión"
                message="¿Estás seguro de que deseas eliminar esta sesión? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="danger"
            />
        </div>
    );
};