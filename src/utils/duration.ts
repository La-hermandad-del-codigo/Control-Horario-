/**
 * Interfaz que representa una pausa de trabajo.
 *
 * @property {string} pause_start - Timestamp ISO del inicio de la pausa.
 * @property {string | null} pause_end - Timestamp ISO del fin de la pausa.
 *   Si es null, la pausa sigue abierta (activa).
 */
export interface Pausa {
    pause_start: string;
    pause_end: string | null;
}

/**
 * Calcula la duración neta de trabajo en milisegundos, descontando las pausas.
 *
 * Fórmula: duración_neta = (endTime - startTime) - suma_de_pausas
 *
 * Solo se restan las pausas que tienen tanto `pause_start` como `pause_end` definidos.
 * Las pausas abiertas (sin `pause_end`) se ignoran en este cálculo.
 *
 * @param {string} startTime - Timestamp ISO del inicio de la sesión.
 * @param {string} endTime - Timestamp ISO del fin de la sesión.
 * @param {Pausa[]} pauses - Array de pausas realizadas durante la sesión.
 * @returns {number} Duración neta en milisegundos. Retorna 0 si las fechas son inválidas.
 *
 * @example
 * // Sesión de 8 horas con 1 hora de pausa = 7 horas
 * calculateDuration('2023-01-01T09:00:00Z', '2023-01-01T17:00:00Z', [
 *   { pause_start: '2023-01-01T12:00:00Z', pause_end: '2023-01-01T13:00:00Z' }
 * ]); // → 25200000 (7 horas en ms)
 */
export function calculateDuration(startTime: string, endTime: string, pauses: Pausa[]): number {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    // Validación: si las fechas no son válidas, retorna 0.
    if (isNaN(start) || isNaN(end)) return 0;

    let totalPauseTime = 0;

    // Suma la duración de cada pausa completada (con inicio y fin definidos).
    pauses.forEach(pause => {
        if (pause.pause_start && pause.pause_end) {
            const pStart = new Date(pause.pause_start).getTime();
            const pEnd = new Date(pause.pause_end).getTime();

            // Solo suma si las fechas de la pausa son válidas.
            if (!isNaN(pStart) && !isNaN(pEnd)) {
                totalPauseTime += (pEnd - pStart);
            }
        }
    });

    // Retorna la duración neta (mínimo 0 para evitar valores negativos).
    return Math.max(0, (end - start) - totalPauseTime);
}

/**
 * Formatea una duración en milisegundos a formato legible "HH:MM:SS".
 *
 * @param {number} ms - Duración en milisegundos.
 * @returns {string} Duración formateada, ej: "02:30:15".
 *
 * @example
 * formatDuration(3661000); // → "01:01:01" (1 hora, 1 minuto, 1 segundo)
 * formatDuration(0);       // → "00:00:00"
 */
export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
