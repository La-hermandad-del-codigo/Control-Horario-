// Navigate: componente de react-router-dom que redirige al usuario a otra ruta de forma programática.
// Outlet: componente que renderiza las rutas hijas anidadas dentro de esta ruta protegida.
import { Navigate, Outlet } from 'react-router-dom';

// useAuth: hook personalizado que provee el estado de autenticación (usuario actual y estado de carga).
imprt { useAuth } from '../../hooks/useAuth';

// Loader2: ícono de carga (spinner) de la librería lucide-react.
import { Loader2 } from 'lucide-react';

/**
 * Componente de ruta protegida.
 *
 * Actúa como un "guardia" (guard) que envuelve las rutas que requieren autenticación.
 * Evalúa tres posibles estados:
 *
 * 1. **Cargando** (`loading === true`): Muestra un spinner mientras se verifica
 *    si el usuario está autenticado (por ejemplo, al refrescar la página).
 *
 * 2. **No autenticado** (`user === null/undefined`): Redirige automáticamente
 *    a la página de login (`/login`). Usa `replace` para que el usuario no pueda
 *    volver a la ruta protegida con el botón "atrás" del navegador.
 *
 * 3. **Autenticado** (`user` existe): Renderiza `<Outlet />`, que muestra
 *    el contenido de las rutas hijas definidas en el enrutador.
 */
export const ProtectedRoute = () => {
    // Extrae el usuario autenticado y el estado de carga del contexto de autenticación.
    const { user, loading } = useAuth();

    // Estado 1: Mientras se verifica la autenticación, muestra un spinner centrado en pantalla.
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-dark-bg text-primary-lime">
                <Loader2 className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    // Estado 2: Si no hay usuario autenticado, redirige a /login.
    // `replace` reemplaza la entrada actual en el historial de navegación.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Estado 3: Usuario autenticado → renderiza las rutas hijas protegidas.
    return <Outlet />;
};
