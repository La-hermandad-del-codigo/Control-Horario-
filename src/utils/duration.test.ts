import { describe, it, expect } from 'vitest';
import { calculateDuration } from './duration';

describe('calculateDuration', () => {
    it('should calculate duration correctly without pauses', () => {
        const start = '2023-01-01T09:00:00Z';
        const end = '2023-01-01T17:00:00Z';
        const duration = calculateDuration(start, end, []);

        // 8 hours in ms
        expect(duration).toBe(8 * 60 * 60 * 1000);
    });

    it('should subtract one pause correctly', () => {
        const start = '2023-01-01T09:00:00Z';
        const end = '2023-01-01T17:00:00Z';
        const pauses = [{
            pause_start: '2023-01-01T12:00:00Z',
            pause_end: '2023-01-01T13:00:00Z'
        }];

        const duration = calculateDuration(start, end, pauses);

        // 7 hours in ms
        expect(duration).toBe(7 * 60 * 60 * 1000);
    });

    it('should subtract multiple pauses correctly', () => {
        const start = '2023-01-01T09:00:00Z';
        const end = '2023-01-01T17:00:00Z';
        const pauses = [
            {
                pause_start: '2023-01-01T12:00:00Z',
                pause_end: '2023-01-01T12:30:00Z' // 30 min
            },
            {
                pause_start: '2023-01-01T15:00:00Z',
                pause_end: '2023-01-01T15:15:00Z' // 15 min
            }
        ];

        const duration = calculateDuration(start, end, pauses);

        // 8h - 45m = 7h 15m
        // 7 * 60 + 15 = 435 min
        const expected = 435 * 60 * 1000;

        expect(duration).toBe(expected);
    });
});
