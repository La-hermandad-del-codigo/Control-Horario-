import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSession } from './useSession';

// Mock Supabase with hoisting
const { mockSupabase } = vi.hoisted(() => {
    return {
        mockSupabase: {
            auth: {
                getUser: vi.fn(),
            },
            from: vi.fn(),
            rpc: vi.fn(),
        }
    };
});

vi.mock('../lib/supabase', () => ({
    supabase: mockSupabase,
}));

describe('useSession Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with no active session', async () => {
        // Mock getUser
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });

        // Mock query for active session -> return null
        const mockSelect = vi.fn().mockReturnThis();
        const mockEq = vi.fn().mockReturnThis();
        const mockIn = vi.fn().mockReturnThis();
        const mockOrder = vi.fn().mockReturnThis();
        const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

        mockSupabase.from.mockReturnValue({
            select: mockSelect,
            eq: mockEq,
            in: mockIn,
            order: mockOrder,
            maybeSingle: mockMaybeSingle,
        });

        // Mock RPC for abandoned check
        mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

        const { result } = renderHook(() => useSession());

        // Wait for loading to finish
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.activeSession).toBeNull();
        expect(result.current.isPaused).toBe(false);
    });
});
