import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSession } from '../hooks/useSession';
import { Play, Pause, Square, Clock, Coffee, ClipboardList } from 'lucide-react';
import { HistoryList } from '../components/history/HistoryList';
import { Modal } from '../components/ui/Modal';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        activeSession,
        elapsedTime,
        isPaused,
        loading,
        pauseCount,
        startSession,
        pauseSession,
        resumeSession,
        endSession
    } = useSession();

    const [isEndModalOpen, setIsEndModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleStart = async () => {
        try {
            await startSession();
        } catch (e) {
            alert(e);
        }
    };

    const handlePause = async () => {
        try {
            await pauseSession();
        } catch (e) {
            alert(e);
        }
    };

    const handleResume = async () => {
        try {
            await resumeSession();
        } catch (e) {
            alert(e);
        }
    };

    const handleEndClick = () => {
        setIsEndModalOpen(true);
    };

    const confirmEndSession = async () => {
        try {
            await endSession();
            setIsEndModalOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (e) {
            alert(e);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                        Hola, <span className="text-primary-lime">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
                    </h1>
                    <p className="text-gray-400">Panel de control de jornada laboral</p>
                </div>
                <div className="bg-card-bg/50 px-4 py-2 rounded-lg border border-white/5 flex items-center gap-2">
                    <Clock size={18} className="text-primary-lime" />
                    <span className="text-gray-300 font-mono">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </div>

            {/* Main Timer Card */}
            <div className={`glass-card p-8 md:p-12 transition-all duration-300 relative overflow-hidden ${activeSession ? 'border-primary-lime/20' : ''}`}>
                {/* Dynamic Background Effects */}
                {activeSession && !isPaused && (
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-lime/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                )}

                <div className="relative z-10 flex flex-col items-center justify-center text-center">

                    {/* Status Badge */}
                    <div className={`mb-8 px-4 py-1.5 rounded-full text-sm font-semibold border ${!activeSession
                        ? 'bg-gray-800/50 text-gray-400 border-gray-700'
                        : isPaused
                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            : 'bg-primary-lime/10 text-primary-lime border-primary-lime/20 animate-pulse'
                        }`}>
                        {!activeSession ? 'Sin sesión activa' : isPaused ? 'Sesión Pausada' : 'Sesión en curso'}
                    </div>

                    {/* Timer Display */}
                    <div className="font-mono text-7xl md:text-9xl font-bold tracking-tighter text-white mb-10 tabular-nums">
                        {elapsedTime}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-6">
                        {!activeSession ? (
                            <button
                                onClick={handleStart}
                                className="group relative flex items-center gap-3 px-8 py-4 bg-primary-lime hover:bg-secondary-lime text-dark-bg rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(217,249,157,0.3)] hover:shadow-[0_0_30px_rgba(217,249,157,0.5)]"
                            >
                                <Play size={24} fill="currentColor" />
                                Iniciar Jornada
                            </button>
                        ) : (
                            <>
                                {isPaused ? (
                                    <button
                                        onClick={handleResume}
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-primary-lime hover:bg-secondary-lime flex items-center justify-center text-dark-bg transition-all hover:scale-110 shadow-lg">
                                            <Play size={32} fill="currentColor" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Reanudar</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handlePause}
                                        disabled={isPaused || loading}
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-card-bg border border-white/10 hover:border-yellow-500/50 hover:bg-yellow-500/10 flex items-center justify-center text-white transition-all hover:scale-110">
                                            <Pause size={32} fill="currentColor" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Pausar</span>
                                    </button>
                                )}

                                <button
                                    onClick={handleEndClick}
                                    className="flex flex-col items-center gap-2 group ml-8"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-card-bg border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 flex items-center justify-center text-white transition-all hover:scale-110">
                                        <Square size={28} fill="currentColor" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Finalizar</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3">
                        <Clock size={24} />
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Horas Hoy</p>
                    <h3 className="text-2xl font-bold text-white">--:--</h3>
                </div>

                <div className="glass-card p-6 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-3">
                        <Coffee size={24} />
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Pausas Hoy</p>
                    <h3 className="text-2xl font-bold text-white">{pauseCount ?? '--'}</h3>
                </div>

                {/* Sesiones Card */}
                <button
                    onClick={() => navigate('/sessions')}
                    className="glass-card p-6 flex flex-col items-center justify-center hover:border-primary-lime/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
                >
                    <div className="w-12 h-12 rounded-full bg-primary-lime/10 flex items-center justify-center text-primary-lime mb-3 group-hover:bg-primary-lime/20 transition-colors">
                        <ClipboardList size={24} />
                    </div>
                    <p className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">Ver todas</p>
                    <h3 className="text-2xl font-bold text-white">Sesiones</h3>
                </button>
            </div>

            <div className="mt-12">
                <HistoryList refreshTrigger={refreshTrigger} />
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={isEndModalOpen}
                onClose={() => setIsEndModalOpen(false)}
                title="Finalizar Jornada"
            >
                <div className="space-y-6">
                    <p className="text-gray-300">
                        ¿Estás seguro de que deseas finalizar tu jornada laboral?
                        El tiempo total se registrará en tu historial.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsEndModalOpen(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmEndSession}
                            className="px-6 py-2 bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg font-medium transition-all"
                        >
                            Finalizar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
