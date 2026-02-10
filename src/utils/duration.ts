export interface Pausa {
    pause_start: string;
    pause_end: string | null;
}

export function calculateDuration(startTime: string, endTime: string, pauses: Pausa[]): number {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (isNaN(start) || isNaN(end)) return 0;

    let totalPauseTime = 0;

    pauses.forEach(pause => {
        if (pause.pause_start && pause.pause_end) {
            const pStart = new Date(pause.pause_start).getTime();
            const pEnd = new Date(pause.pause_end).getTime();

            if (!isNaN(pStart) && !isNaN(pEnd)) {
                totalPauseTime += (pEnd - pStart);
            }
        }
    });

    return Math.max(0, (end - start) - totalPauseTime);
}

export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
