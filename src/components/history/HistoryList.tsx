// useEffect: ejecuta efectos al montar y cuando cambian las dependencias.
// useState: maneja estado local del formulario de edición y sesión en edición.
import { useEffect, useState } from 'react';

// useHistory: hook personalizado para gestionar el historial de sesiones.
import { useHistory } from '../../hooks/useHistory';
import { Trash2, Edit2, Coffee } from 'lucide-react';
import { Modal } from '../ui/Modal';

// Database: tipos generados de la base de datos para tipado seguro.
import type { Database } from '../../types/database.types';

/**
 * Tipo de sesión de trabajo extraído de los tipos de la base de datos.
 * Representa una fila de la tabla `work_sessions`.
 */
type WorkSession = Database['public']['Tables']['work_sessions']['Row'];

/**
 * Props del componente HistoryList.
 * @property {number} refreshTrigger - Valor numérico que, al cambiar, fuerza la recarga
 *   de las sesiones. Se incrementa desde el Dashboard al completar una sesión.
 */
interface HistoryListProps {
  refreshTrigger?: number;
}

/**
 * Componente que muestra el historial de sesiones de trabajo completadas.
 *
 * Funcionalidades:
 * - Carga las últimas 5 sesiones completadas al montar y cuando cambia `refreshTrigger`.
 * - Muestra cada sesión con: fecha, duración total, horario (inicio - fin), pausas y notas.
 * - Botones de editar y eliminar por sesión (visibles al hacer hover en pantallas md+).
 * - Modal de edición para modificar inicio, fin y notas de una sesión.
 * - Confirmación con `window.confirm` antes de eliminar una sesión.
 *
 * Estados visuales:
 * - Loading: mensaje "Cargando historial...".
 * - Sin sesiones: mensaje "No hay sesiones recientes" en tarjeta glass.
 * - Con sesiones: grid de tarjetas con información de cada sesión.
 */
export const HistoryList = ({ refreshTrigger = 0 }: HistoryListProps) => {
// Desestructura las funciones y estado del hook de historial.
const { sessions, loading, loadSessions, deleteSession, updateSession } = useHistory();
// Sesión que se está editando actualmente (null = no hay edición activa).
const [editingSession, setEditingSession] = useState<WorkSession | null>(null);
// Estado del formulario de edición con los campos editables.
const [editForm, setEditForm] = useState({
    start_time: '',
    end_time: '',
    notes: ''
});
// Carga las sesiones al montar y cada vez que cambia refreshTrigger.
// Carga las últimas 5 sesiones completadas.
useEffect(() => {
    void loadSessions(5);
}, [loadSessions, refreshTrigger]);
/**
 * Elimina una sesión después de confirmación del usuario.
 * Usa `window.confirm` como diálogo de confirmación simple.
 * @param {string} id - ID de la sesión a eliminar.
 */
const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta sesión?')) {
        await deleteSession(id);
    }
};
/**
     * Guarda los cambios de edición de una sesión.
     *
     * Convierte las fechas del formulario (hora local) de vuelta a ISO UTC
     * antes de enviarlas a la base de datos.
     *
     * @param {React.FormEvent} e - Evento del formulario.
     */
    const openEdit = (session: any) => {
        setEditingSession(session);
        // Función auxiliar para convertir ISO UTC a formato datetime-local (YYYY-MM-DDThh:mm).
        // Resta el offset de zona horaria para mostrar la hora local correcta.
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

        // Convierte fecha local a ISO UTC para almacenar en la base de datos.
        const toUTC = (localString: string) => new Date(localString).toISOString();

        await updateSession(editingSession.id, {
            start_time: toUTC(editForm.start_time),
            end_time: toUTC(editForm.end_time),
            notes: editForm.notes
        });

        // Cierra el modal de edición.
        setEditingSession(null);
    };

    return (
        <div className="space-y-6">
            {/* Título de la sección */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Historial de Sesiones</h2>
            </div>

            {/* Renderizado condicional según el estado */}
            {loading ? (
                // Estado: cargando.
                <div className="text-center py-10 text-gray-400">Cargando historial...</div>
            ) : sessions.length === 0 ? (
                // Estado: sin sesiones.
                <div className="text-center py-10 text-gray-500 glass-card">
                    No hay sesiones recientes.
                </div>
            ) : (
                // Estado: con sesiones.
                <div className="grid gap-4">
                    {sessions.map(session => (
                        <div key={session.id} className="glass-card p-5 flex flex-col sm:flex-row justify-between gap-4 group hover:border-white/10 transition-all">
                            {/* Información de la sesión */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    {/* Fecha de la sesión */}
                                    <div className="text-lg font-bold text-white">
                                        {new Date(session.start_time).toLocaleDateString()}
                                    </div>
                                    {/* Duración total formateada */}
                                    <div className="px-2 py-0.5 rounded text-xs font-mono bg-gray-800 text-gray-400 border border-gray-700">
                                        {session.total_duration?.split('.')[0] || 'Unknown'}
                                    </div>
                                </div>
                                {/* Horario de inicio y fin + conteo de pausas */}
                                <div className="text-sm text-gray-400 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <span>
                                        {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                        {session.end_time ? new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                                    </span>
                                    {/* Muestra conteo de pausas con ícono Coffee, siempre visible */}
                                    <span className="flex items-center gap-1 text-yellow-500/80">
                                        <Coffee size={14} />
                                        {session.work_pauses?.[0]?.count || 0} pausa(s)
                                    </span>
                                </div>
                                {/* Notas de la sesión (si existen) */}
                                {session.notes && (
                                    <div className="text-sm text-gray-500 italic mt-1">"{session.notes}"</div>
                                )}
                            </div>

                            {/* Botones de acción: editar y eliminar */}
                            {/* En pantallas sm+: ocultos por defecto, visibles al hover del grupo */}
                            <div className="flex items-center gap-2 self-end sm:self-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* Botón editar */}
                                <button
                                    onClick={() => openEdit(session)}
                                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                                {/* Botón eliminar */}
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

            {/* === Modal de edición de sesión === */}
            <Modal
                isOpen={!!editingSession}
                onClose={() => setEditingSession(null)}
                title="Editar Sesión"
            >
                <form onSubmit={handleUpdate} className="space-y-4">
                    {/* Campo: Hora de inicio */}
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
                    {/* Campo: Hora de fin */}
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
                    {/* Campo: Notas */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Notas</label>
                        <textarea
                            value={editForm.notes}
                            onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg p-3 text-white focus:border-primary-lime outline-none min-h-[100px]"
                            placeholder="Notas opcionales..."
                        />
                    </div>
                    {/* Botones del formulario */}
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
    );}