import { useAuthContext } from '../components/auth/AuthProvider';

/**
 * Hook personalizado de autenticación.
 * 
 * Re-exporta el contexto de autenticación para mantener la compatibilidad 
 * con los componentes existentes que importan `useAuth`.
 * 
 * @returns {Object} Contexto de autenticación (user, session, methods...)
 */
export function useAuth() {
    return useAuthContext();
}
