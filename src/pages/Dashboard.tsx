import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSession } from '../hooks/useSession';
import { Play, Pause, Square, Clock, Coffee, ClipboardList, AlertTriangle } from 'lucide-react';
import { HistoryList } from '../components/history/HistoryList';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { TimerDisplay } from '../components/dashboard/TimerDisplay';
import { useToast } from '../context/ToastContext';
import { formatTime } from '../utils/time';
import { useWeeklyStats } from '../hooks/useWeeklyStats';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        activeSession,
        abandonedSession,
        elapsedTime,
        elapsedSeconds,
        isPaused,
        loading,
        pauseCount,
        startSession,
        pauseSession,
        resumeSession,
        endSession,
        recoverSession,
        discardSession
    } = useSession();

    const { showToast } = useToast();
    const { totalWeeklySeconds } = useWeeklyStats({
        elapsedSeconds,
        hasActiveSession: !!activeSession
    });

    const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleStart = async () => {
        try {
            await startSession();
            showToast('Jornada iniciada con éxito', 'success');
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Error desconocido';
            showToast(message || 'Error al iniciar sesión', 'error');
        }
    };

    const handlePause = async () => {
        try {
            await pauseSession();
            showToast('Sesión pausada', 'info');
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Error desconocido';
            showToast(message || 'Error al pausar sesión', 'error');
        }
    };

    const handleResume = async () => {
        try {
            await resumeSession();
            showToast('Sesión reanudada', 'success');
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Error desconocido';
            showToast(message || 'Error al reanudar sesión', 'error');
        }
    };

    const handleEndClick = () => {
        setIsEndConfirmOpen(true);
    };

    const confirmEndSession = async () => {
        try {
            await endSession();
            setIsEndConfirmOpen(false);
            setRefreshTrigger(prev => prev + 1);
            showToast('Jornada finalizada correctamente', 'success');
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Error desconocido';
            showToast(message || 'Error al finalizar sesión', 'error');
        }
    };

    return (
        <div className="space-y-8">
            {/* === Encabezado === */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                        Hola, <span className="text-blue-600">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
                    </h1>
                    <p className="text-gray-500">Panel de control de jornada laboral</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2 text-gray-500">
                    <Clock size={16} className="text-blue-600" />
                    <span className="font-medium">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </div>

            {/* === Tarjeta principal del cronómetro === */}
            <Card className="p-12 relative overflow-hidden border-t-4 border-t-blue-600">
                <TimerDisplay
                    elapsedTime={elapsedTime}
                    activeSession={!!activeSession}
                    isPaused={isPaused}
                />

                <div className="flex justify-center items-center gap-6 mt-8">
                    {!activeSession ? (
                        <Button
                            onClick={handleStart}
                            className="px-8 py-4 text-lg rounded-xl shadow-lg shadow-blue-600/20"
                        >
                            <Play size={24} className="mr-2" />
                            Iniciar Jornada
                        </Button>
                    ) : (
                        <>
                            {isPaused ? (
                                <button
                                    onClick={handleResume}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-all hover:scale-105 shadow-lg">
                                        <Play size={32} fill="currentColor" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">Reanudar</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handlePause}
                                    disabled={isPaused || loading}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 flex items-center justify-center text-gray-700 hover:text-yellow-600 transition-all hover:scale-105 shadow-sm">
                                        <Pause size={32} fill="currentColor" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-500 group-hover:text-yellow-600 transition-colors">Pausar</span>
                                </button>
                            )}

                            <button
                                onClick={handleEndClick}
                                className="flex flex-col items-center gap-2 group ml-8"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 hover:border-red-500 hover:bg-red-50 flex items-center justify-center text-gray-700 hover:text-red-600 transition-all hover:scale-105 shadow-sm">
                                    <Square size={28} fill="currentColor" />
                                </div>
                                <span className="text-sm font-medium text-gray-500 group-hover:text-red-600 transition-colors">Finalizar</span>
                            </button>
                        </>
                    )}
                </div>
            </Card>

            {/* === Tarjetas de estadísticas === */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex flex-col items-center justify-center p-6 text-center group hover:border-blue-200 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3 group-hover:bg-blue-100 transition-colors">
                        <Clock size={24} />
                    </div>
                    <p className="text-gray-500 text-sm mb-1">Horas Semanales</p>
                    <h3 className="text-2xl font-bold text-gray-900">{formatTime(totalWeeklySeconds)}</h3>
                </Card>

                <Card className="flex flex-col items-center justify-center p-6 text-center group hover:border-purple-200 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-3 group-hover:bg-purple-100 transition-colors">
                        <Coffee size={24} />
                    </div>
                    <p className="text-gray-500 text-sm mb-1">Pausas Hoy</p>
                    <h3 className="text-2xl font-bold text-gray-900">{pauseCount ?? '--'}</h3>
                </Card>

                <button
                    onClick={() => navigate('/sessions')}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
                >
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-3 group-hover:bg-green-100 transition-colors">
                        <ClipboardList size={24} />
                    </div>
                    <p className="text-gray-500 text-sm mb-1">Ver historial completo</p>
                    <h3 className="text-2xl font-bold text-gray-900">Sesiones</h3>
                </button>
            </div>

            {/* === Historial === */}
            <HistoryList refreshTrigger={refreshTrigger} />

            <ConfirmDialog
                isOpen={isEndConfirmOpen}
                onClose={() => setIsEndConfirmOpen(false)}
                onConfirm={confirmEndSession}
                title="Finalizar Jornada"
                message="¿Estás seguro de que deseas finalizar tu jornada laboral? El tiempo total se registrará en tu historial."
                confirmText="Finalizar"
                cancelText="Cancelar"
                type="danger"
            />

            <Modal
                isOpen={!!abandonedSession}
                onClose={() => { }}
                title="Sesión Abierta Detectada"
            >
                <div className="flex flex-col items-center text-center space-y-6 py-4">
                    <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mb-2">
                        <AlertTriangle size={32} className="text-yellow-500" />
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-900">¿Deseas recuperar tu sesión anterior?</h4>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Tienes una sesión que quedó abierta hace{' '}
                            <span className="text-gray-900 font-mono font-bold">{abandonedSession?.timeMessage}</span>.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4">
                        <Button
                            variant="secondary"
                            onClick={discardSession}
                        >
                            Ignorar y comenzar nueva
                        </Button>
                        <Button
                            onClick={recoverSession}
                            className="gap-2"
                        >
                            <Play size={18} fill="currentColor" />
                            Recuperar Sesión
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}