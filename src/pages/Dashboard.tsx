// useState: maneja estados locales del dashboard (modal de confirmación, trigger de refresco).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// useAuth: hook de autenticación para obtener datos del usuario.
import { useAuth } from '../hooks/useAuth';

// useSession: hook principal que gestiona el ciclo de vida de la sesión de trabajo.
import { useSession } from '../hooks/useSession';

// Íconos de lucide-react:
// Play: iniciar/reanudar. Pause: pausar. Square: detener/finalizar.
// Clock: reloj. Coffee: café/pausas. ClipboardList: sesiones. AlertTriangle: advertencia.
import { Play, Pause, Square, Clock, Coffee, ClipboardList, AlertTriangle } from 'lucide-react';

// HistoryList: componente que muestra el historial de sesiones completadas.
import { HistoryList } from '../components/history/HistoryList';

// Modal: componente reutilizable de diálogo.
import { Modal } from '../components/ui/Modal';
import { formatTime } from '../utils/time';
import { useWeeklyStats } from '../hooks/useWeeklyStats';

/**
 * Página principal del Dashboard (panel de control).
 *
 * Es la vista principal de la aplicación para usuarios autenticados.
 * Contiene:
 *
 * 1. **Encabezado**: Saludo personalizado con nombre del usuario y fecha actual.
 *
 * 2. **Tarjeta del cronómetro**: Componente central con:
 *    - Badge de estado (sin sesión / en curso / pausada) con animaciones.
 *    - Display del cronómetro en formato grande HH:MM:SS.
 *    - Botones de control (Iniciar / Pausar-Reanudar / Finalizar).
 *    - Efecto visual de fondo animado cuando la sesión está activa.
 *
 * 3. **Estadísticas rápidas**: Tarjetas con horas semanales, conteo de pausas
 *    y acceso directo a todas las sesiones.
 *
 * 4. **Historial**: Lista de las últimas sesiones completadas (componente HistoryList).
 *
 * 5. **Modal de confirmación**: Diálogo para confirmar la finalización de la jornada.
 *
 * 6. **Modal de sesión abandonada**: Diálogo para recuperar o descartar
 *    una sesión que quedó abierta en una visita anterior.
 */
export default function Dashboard() {
    const navigate = useNavigate();

    // Datos del usuario autenticado.
    const { user } = useAuth();

    // Desestructura todas las propiedades del hook de sesión.
    const {
        activeSession,    // Sesión activa actual (o null).
        abandonedSession, // Sesión abandonada detectada (con id y timeMessage), o null.
        elapsedTime,      // Tiempo transcurrido formateado "HH:MM:SS".
        elapsedSeconds,   // Tiempo transcurrido en segundos (sin formatear).
        isPaused,         // Si la sesión está pausada.
        loading,          // Si se está procesando una operación.
        pauseCount,       // Número de pausas en la sesión actual.
        startSession,     // Función para iniciar sesión de trabajo.
        pauseSession,     // Función para pausar la sesión.
        resumeSession,    // Función para reanudar la sesión.
        endSession,       // Función para finalizar la sesión.
        recoverSession,   // Función para recuperar una sesión abandonada.
        discardSession    // Función para descartar una sesión abandonada.
    } = useSession();

    const { totalWeeklySeconds } = useWeeklyStats({
        elapsedSeconds,
        hasActiveSession: !!activeSession
    });

    // Controla la visibilidad del modal de confirmación de fin de jornada.
    const [isEndModalOpen, setIsEndModalOpen] = useState(false);

    // Trigger para refrescar el historial después de finalizar una sesión.
    // Se incrementa cada vez que se completa una sesión para que HistoryList recargue.
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    /**
     * Inicia una nueva sesión de trabajo.
     * Muestra una alerta si ocurre un error (ej: ya hay sesión activa).
     */
    const handleStart = async () => {
        try {
            await startSession();
        } catch (e) {
            alert(e);
        }
    };

    /**
     * Pausa la sesión activa.
     * Muestra una alerta si ocurre un error.
     */
    const handlePause = async () => {
        try {
            await pauseSession();
        } catch (e) {
            alert(e);
        }
    };

    /**
     * Reanuda la sesión pausada.
     * Muestra una alerta si ocurre un error.
     */
    const handleResume = async () => {
        try {
            await resumeSession();
        } catch (e) {
            alert(e);
        }
    };

    /**
     * Abre el modal de confirmación antes de finalizar la jornada.
     * No finaliza directamente; espera confirmación del usuario.
     */
    const handleEndClick = () => {
        setIsEndModalOpen(true);
    };

    /**
     * Confirma la finalización de la sesión de trabajo.
     * Cierra el modal e incrementa el refreshTrigger para que
     * el componente HistoryList recargue las sesiones actualizadas.
     */
    const confirmEndSession = async () => {
        try {
            await endSession();
            setIsEndModalOpen(false);
            // Incrementa el trigger para refrescar el historial.
            setRefreshTrigger(prev => prev + 1);
        } catch (e) {
            alert(e);
        }
    };

    return (
        <div className="space-y-8">
            {/* === Encabezado === */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {/* Saludo con nombre del usuario (prioriza full_name, luego parte del email) */}
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        Hola, <span className="text-green-700 dark:text-primary-lime">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Panel de control de jornada laboral</p>
                </div>
                {/* Fecha actual formateada */}
                <div className="bg-white/50 dark:bg-card-bg/50 px-4 py-2 rounded-lg border border-gray-200 dark:border-white/5 flex items-center gap-2">
                    <Clock size={18} className="text-primary-lime" />
                    <span className="text-gray-700 dark:text-gray-300 font-mono">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </div>

            {/* === Tarjeta principal del cronómetro === */}
            <div className={`glass-card p-8 md:p-12 transition-all duration-300 relative ${activeSession ? 'border-primary-lime/20' : ''}`}>
                {/* Efecto de fondo dinámico: orbe pulsante solo cuando la sesión está activa */}
                {activeSession && !isPaused && (
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-lime/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                )}

                <div className="relative z-10 flex flex-col items-center justify-center text-center">

                    {/* Badge de estado: cambia color y texto según el estado de la sesión */}
                    <div className={`mb-8 px-4 py-1.5 rounded-full text-sm font-semibold border ${!activeSession
                        ? 'bg-gray-800/50 text-gray-400 border-gray-700'           // Sin sesión
                        : isPaused
                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'  // Pausada
                            : 'bg-primary-lime/10 text-primary-lime border-primary-lime/20 animate-pulse' // Activa
                        }`}>
                        {!activeSession ? 'Sin sesión activa' : isPaused ? 'Sesión Pausada' : 'Sesión en curso'}
                    </div>

                    {/* Display del cronómetro: muestra el tiempo en formato grande */}
                    <div className="font-mono text-7xl md:text-9xl font-bold tracking-tighter text-gray-900 dark:text-white mb-10 tabular-nums">
                        {elapsedTime}
                    </div>

                    {/* === Controles del cronómetro === */}
                    <div className="flex items-center gap-6">
                        {!activeSession ? (
                            // Botón "Iniciar Jornada": solo visible cuando no hay sesión activa.
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
                                    // Botón "Reanudar": visible cuando la sesión está pausada.
                                    <button
                                        onClick={handleResume}
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-primary-lime hover:bg-secondary-lime flex items-center justify-center text-dark-bg transition-all hover:scale-110 shadow-lg">
                                            <Play size={32} fill="currentColor" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Reanudar</span>
                                    </button>
                                ) : (
                                    // Botón "Pausar": visible cuando la sesión está activa (corriendo).
                                    <button
                                        onClick={handlePause}
                                        disabled={isPaused || loading}
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-card-bg border border-gray-200 dark:border-white/10 hover:border-yellow-500/50 hover:bg-yellow-500/10 flex items-center justify-center text-gray-900 dark:text-white transition-all hover:scale-110">
                                            <Pause size={32} fill="currentColor" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Pausar</span>
                                    </button>
                                )}

                                {/* Botón "Finalizar": siempre visible cuando hay sesión activa */}
                                <button
                                    onClick={handleEndClick}
                                    className="flex flex-col items-center gap-2 group ml-8"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-card-bg border border-gray-200 dark:border-white/10 hover:border-red-500/50 hover:bg-red-500/10 flex items-center justify-center text-gray-900 dark:text-white transition-all hover:scale-110">
                                        <Square size={28} fill="currentColor" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Finalizar</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* === Tarjetas de estadísticas rápidas === */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tarjeta: Horas semanales acumuladas */}
                <div className="glass-card p-6 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-3">
                        <Clock size={24} />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Horas Semanales</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(totalWeeklySeconds)}</h3>
                </div>

                {/* Tarjeta: Número de pausas de la sesión activa */}
                <div className="glass-card p-6 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
                        <Coffee size={24} />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Pausas Hoy</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{pauseCount ?? '--'}</h3>
                </div>

                {/* Tarjeta: Acceso directo a todas las sesiones */}
                <button
                    onClick={() => navigate('/sessions')}
                    className="glass-card p-6 flex flex-col items-center justify-center hover:border-primary-lime/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
                >
                    <div className="w-12 h-12 rounded-full bg-primary-lime/10 flex items-center justify-center text-primary-lime mb-3 group-hover:bg-primary-lime/20 transition-colors">
                        <ClipboardList size={24} />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">Ver todas</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Sesiones</h3>
                </button>
            </div>

            {/* === Historial de sesiones completadas === */}
            <div className="mt-12">
                {/* refreshTrigger se incrementa al completar una sesión para forzar recarga */}
                <HistoryList refreshTrigger={refreshTrigger} />
            </div>

            {/* === Modal de confirmación para finalizar jornada === */}
            <Modal
                isOpen={isEndModalOpen}
                onClose={() => setIsEndModalOpen(false)}
                title="Finalizar Jornada"
            >
                <div className="space-y-6">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-normal break-words">
                        ¿Estás seguro de que deseas finalizar tu jornada laboral?
                        El tiempo total se registrará en tu historial.
                    </p>
                    <div className="flex justify-end gap-3">
                        {/* Botón cancelar: cierra el modal */}
                        <button
                            onClick={() => setIsEndModalOpen(false)}
                            className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        {/* Botón confirmar: finaliza la sesión definitivamente */}
                        <button
                            onClick={confirmEndSession}
                            className="px-6 py-2 bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg font-medium transition-all"
                        >
                            Finalizar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* === Modal de sesión abandonada: recuperar o descartar === */}
            <Modal
                isOpen={!!abandonedSession}
                onClose={() => { }} // Se bloquea el cierre por clic externo hasta que el usuario decida.
                title="Sesión Abierta Detectada"
            >
                <div className="flex flex-col items-center text-center space-y-6 py-4">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-2">
                        <AlertTriangle size={32} className="text-yellow-500" />
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">¿Deseas recuperar tu sesión anterior?</h4>
                        <p className="text-gray-700 dark:text-gray-400 max-w-sm mx-auto">
                            Tienes una sesión que quedó abierta hace{' '}
                            <span className="text-primary-lime font-mono font-bold">{abandonedSession?.timeMessage}</span>.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4">
                        {/* Botón descartar: ignora la sesión y permite iniciar una nueva */}
                        <button
                            onClick={discardSession}
                            className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                        >
                            Ignorar y comenzar nueva
                        </button>
                        {/* Botón recuperar: reanuda la sesión abandonada */}
                        <button
                            onClick={recoverSession}
                            className="px-6 py-3 bg-primary-lime hover:bg-secondary-lime text-dark-bg rounded-xl font-bold transition-all shadow-lg shadow-primary-lime/20 flex items-center justify-center gap-2"
                        >
                            <Play size={18} fill="currentColor" />
                            Recuperar Sesión
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}