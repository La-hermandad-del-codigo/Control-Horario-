// Funciones de Vitest para definir suites de test, casos individuales y aserciones.
import { describe, it, expect } from 'vitest';

// Función a testear: calcula la duración neta de trabajo descontando pausas.
import { calculateDuration } from './duration';

/**
 * Suite de tests para la función `calculateDuration`.
 *
 * Verifica que el cálculo de duración neta sea correcto en tres escenarios:
 * 1. Sin pausas → la duración es igual al tiempo total.
 * 2. Una pausa → se resta correctamente del tiempo total.
 * 3. Múltiples pausas → se restan todas correctamente.
 */
describe('calculateDuration', () => {
    /**
     * Test: Calcula duración correctamente sin pausas.
     * Sesión de 9:00 a 17:00 = 8 horas exactas.
     */
    it('should calculate duration correctly without pauses', () => {
        const start = '2023-01-01T09:00:00Z';
        const end = '2023-01-01T17:00:00Z';
        const duration = calculateDuration(start, end, []);

        // 8 horas en milisegundos = 8 * 60 * 60 * 1000 = 28,800,000 ms
        expect(duration).toBe(8 * 60 * 60 * 1000);
    });

    /**
     * Test: Resta una pausa de 1 hora correctamente.
     * Sesión de 8 horas - 1 hora de pausa = 7 horas netas.
     */
    it('should subtract one pause correctly', () => {
        const start = '2023-01-01T09:00:00Z';
        const end = '2023-01-01T17:00:00Z';
        const pauses = [{
            pause_start: '2023-01-01T12:00:00Z',
            pause_end: '2023-01-01T13:00:00Z'
        }];

        const duration = calculateDuration(start, end, pauses);

        // 7 horas en milisegundos
        expect(duration).toBe(7 * 60 * 60 * 1000);
    });

    /**
     * Test: Resta múltiples pausas correctamente.
     * Sesión de 8 horas - 30 min - 15 min = 7 horas y 15 minutos netos.
     * 7h 15m = 435 minutos = 26,100 segundos = 26,100,000 ms
     */
    it('should subtract multiple pauses correctly', () => {
        const start = '2023-01-01T09:00:00Z';
        const end = '2023-01-01T17:00:00Z';
        const pauses = [
            {
                pause_start: '2023-01-01T12:00:00Z',
                pause_end: '2023-01-01T12:30:00Z' // 30 minutos
            },
            {
                pause_start: '2023-01-01T15:00:00Z',
                pause_end: '2023-01-01T15:15:00Z' // 15 minutos
            }
        ];

        const duration = calculateDuration(start, end, pauses);

        // 8h - 45m = 7h 15m = 435 minutos en milisegundos
        const expected = 435 * 60 * 1000;

        expect(duration).toBe(expected);
    });
});
