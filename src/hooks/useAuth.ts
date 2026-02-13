// useEffect: ejecuta efectos secundarios al montar el componente.
// useState: maneja el estado local del hook.
import { useEffect, useState } from 'react';

// User: tipo de Supabase que representa al usuario autenticado.
// Session: tipo de Supabase que representa la sesión de autenticación activa.
import type { User, Session } from '@supabase/supabase-js';

// supabase: instancia del cliente de Supabase configurada para este proyecto.
import { supabase } from '../lib/supabase';

/**
 * Hook personalizado de autenticación.
 *
 * Provee el estado de autenticación y las funciones para iniciar sesión,
 * registrarse y cerrar sesión. Utiliza Supabase Auth como backend.
 *
 * @returns {Object} Objeto con:
 * - `user` {User | null} - Usuario autenticado actual, o null si no hay sesión.
 * - `session` {Session | null} - Sesión activa de Supabase.
 * - `loading` {boolean} - true mientras se verifica el estado de autenticación.
 * - `signIn` {Function} - Función para iniciar sesión con email y contraseña.
 * - `signUp` {Function} - Función para registrar un nuevo usuario.
 * - `signOut` {Function} - Función para cerrar la sesión actual.
 */
export function useAuth() {
    // Estado del usuario autenticado (null = no autenticado).
    const [user, setUser] = useState<User | null>(null);

    // Estado de la sesión de Supabase (contiene tokens, expiración, etc.).
    const [session, setSession] = useState<Session | null>(null);

    // Indica si se está verificando el estado de autenticación inicial.
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Al montar: obtiene la sesión actual almacenada (localStorage/cookies).
        // Esto verifica si el usuario ya estaba logueado previamente.
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 2. Suscripción a cambios de estado de autenticación en tiempo real.
        // Se dispara cuando el usuario inicia sesión, cierra sesión, refresca tokens, etc.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // 3. Cleanup: desuscribe el listener al desmontar para evitar memory leaks.
        return () => subscription.unsubscribe();
    }, []);

    /**
     * Inicia sesión con email y contraseña.
     * @param {string} email - Email del usuario.
     * @param {string} password - Contraseña del usuario.
     * @throws {Error} Si las credenciales son inválidas o hay un error de red.
     */
    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    /**
     * Registra un nuevo usuario y crea su perfil en la tabla `profiles`.
     *
     * Flujo:
     * 1. Crea el usuario en Supabase Auth con email, contraseña y nombre completo.
     * 2. Si el registro es exitoso, inserta un registro en la tabla `profiles`
     *    con el id del usuario, email y nombre completo.
     *
     * @param {string} email - Email del nuevo usuario.
     * @param {string} password - Contraseña del nuevo usuario.
     * @param {string} fullName - Nombre completo del usuario.
     * @returns {Object} Datos del usuario registrado.
     * @throws {Error} Si el email ya está registrado o hay un error de validación.
     */
    const signUp = async (email: string, password: string, fullName: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) throw error;

        // Crear entrada en la tabla de perfiles asociada al usuario recién creado.
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    email: email,
                    full_name: fullName,
                });

            if (profileError) {
                // Si falla la creación del perfil, el usuario auth ya existe.
                // Se registra el error pero no se lanza excepción para no bloquear el registro.
                console.error("Error creating profile:", profileError);
            }
        }

        return data;
    };

    /**
     * Cierra la sesión del usuario actual.
     * Elimina tokens almacenados y notifica a los listeners de cambio de estado.
     * @throws {Error} Si hay un error al cerrar la sesión.
     */
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return {
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
    };
}
