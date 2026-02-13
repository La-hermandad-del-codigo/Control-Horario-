// renderHook: utilidad de testing-library para testear hooks de React de forma aislada.
// waitFor: utilidad que espera hasta que una condición se cumpla (útil para operaciones asíncronas).
import { renderHook, waitFor } from '@testing-library/react';

// describe, it, expect: funciones de Vitest para definir suites, tests y aserciones.
// vi: módulo de Vitest para crear mocks (funciones simuladas).
// beforeEach: función que se ejecuta antes de cada test para preparar el entorno.
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hook a testear.
import { useSession } from './useSession';

/**
 * Mock del cliente de Supabase.
 *
 * Se usa `vi.hoisted()` para que el mock se defina ANTES de que los módulos
 * se importen, es decir, se "eleva" (hoist) al inicio del archivo.
 * Esto es necesario porque `vi.mock()` también se eleva, y necesita
 * acceder a `mockSupabase` en su factory function.
 *
 * El mock simula las funciones de Supabase que usa `useSession`:
 * - `auth.getUser()`: Obtiene el usuario autenticado.
 * - `from()`: Accede a una tabla de la base de datos.
 * - `rpc()`: Llama a funciones remotas (como check_abandoned_sessions).
 */
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

// Reemplaza el módulo real de Supabase con el mock.
// Cualquier import de '../lib/supabase' retornará { supabase: mockSupabase }.
vi.mock('../lib/supabase', () => ({
    supabase: mockSupabase,
}));

/**
 * Suite de tests para el hook `useSession`.
 *
 * Verifica el comportamiento del hook que gestiona la sesión de trabajo activa,
 * incluyendo la inicialización, el manejo de estados y la interacción con Supabase.
 */
describe('useSession Hook', () => {
    // Limpia todos los mocks antes de cada test para evitar contaminación entre tests.
    beforeEach(() => {
        vi.clearAllMocks();
    });

    /**
     * Test: Verifica que al iniciar sin sesión activa, el hook retorne
     * valores por defecto (activeSession = null, isPaused = false).
     *
     * Setup:
     * 1. Mock de getUser → retorna un usuario simulado con id 'user-123'.
     * 2. Mock de from('work_sessions') → encadena select/eq/in/order/maybeSingle → retorna null.
     * 3. Mock de rpc('check_abandoned_sessions') → retorna array vacío (sin sesiones abandonadas).
     */
    it('should initialize with no active session', async () => {
        // Mock: usuario autenticado.
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });

        // Mock: consulta a work_sessions retorna null (sin sesión activa).
        // Cada método encadenado retorna `this` para permitir la cadena de llamadas.
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

        // Mock: no hay sesiones abandonadas.
        mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

        // Renderiza el hook de forma aislada (sin componente visual).
        const { result } = renderHook(() => useSession());

        // Espera a que termine la carga asíncrona.
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Verifica que no hay sesión activa y que no está pausado.
        expect(result.current.activeSession).toBeNull();
        expect(result.current.isPaused).toBe(false);
    });
});
