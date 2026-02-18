
import { memo } from 'react';

interface TimerDisplayProps {
    elapsedTime: string;
    activeSession: boolean;
    isPaused: boolean;
}

export const TimerDisplay = memo(({ elapsedTime, activeSession, isPaused }: TimerDisplayProps) => {
    return (
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
            {/* Badge de estado */}
            <div className={`mb-8 px-4 py-1.5 rounded-full text-sm font-semibold border ${!activeSession
                ? 'bg-gray-100 text-gray-500 border-gray-200'           // Sin sesión
                : isPaused
                    ? 'bg-yellow-50 text-yellow-600 border-yellow-200'  // Pausada
                    : 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse' // Activa
                }`}>
                {!activeSession ? 'Sin sesión activa' : isPaused ? 'Sesión Pausada' : 'Sesión en curso'}
            </div>

            {/* Display del cronómetro */}
            <div className="font-mono text-7xl md:text-9xl font-bold tracking-tighter text-gray-900 mb-10 tabular-nums">
                {elapsedTime}
            </div>
        </div>
    );
});

TimerDisplay.displayName = 'TimerDisplay';
