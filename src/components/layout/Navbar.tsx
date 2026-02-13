// useState: hook para manejar estado local (controla visibilidad del modal de logout).
import { useState } from 'react';

// LogOut: ícono de cerrar sesión. UserIcon: ícono de usuario (renombrado para evitar conflicto con el tipo User).
import { LogOut, User as UserIcon } from 'lucide-react';

// useAuth: hook personalizado que provee datos del usuario y función de cierre de sesión.
import { useAuth } from '../../hooks/useAuth';

// Link: componente para navegación sin recarga. useNavigate: hook para redirecciones programáticas.
import { Link, useNavigate } from 'react-router-dom';

// Modal: componente reutilizable de diálogo modal (ventana emergente).
import { Modal } from '../ui/Modal';

/**
 * Componente de barra de navegación principal.
 *
 * Funcionalidades:
 * - Muestra el logo y nombre de la aplicación "RelojTiktak" con enlace al inicio.
 * - Si el usuario está autenticado:
 *   - Muestra su email con un ícono de usuario (visible solo en pantallas medianas+).
 *   - Botón de cerrar sesión con confirmación mediante modal.
 * - Si NO está autenticado:
 *   - Links para "Iniciar Sesión" y "Registrarse".
 *
 * El componente usa el estilo `glass-panel` (efecto glassmorphism con backdrop blur)
 * y es sticky (se mantiene fijo al hacer scroll).
 */
export const Navbar = () => {
    // Obtiene los datos del usuario autenticado y la función para cerrar sesión.
    const { user, signOut } = useAuth();

    // Hook para redirigir al usuario a otra ruta tras cerrar sesión.
    const navigate = useNavigate();

    // Estado que controla la visibilidad del modal de confirmación de cierre de sesión.
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    /**
     * Maneja el cierre de sesión del usuario.
     * Ejecuta signOut() de Supabase y redirige a /login.
     * Si ocurre un error, lo registra en consola.
     */
    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <>
            {/* Barra de navegación con efecto glass, sticky y z-index alto */}
            <nav className="glass-panel sticky top-0 z-50 px-6 py-4 mb-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {/* Logo y nombre de la aplicación */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-lime flex items-center justify-center">
                            <span className="text-dark-bg font-bold text-xl">F</span>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">RelojTiktak</span>
                    </Link>

                    {/* Renderizado condicional según el estado de autenticación */}
                    {user ? (
                        // === Usuario autenticado ===
                        <div className="flex items-center gap-6">
                            {/* Info del usuario: visible solo en pantallas md y superiores */}
                            <div className="hidden md:flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-card-bg border border-white/10 flex items-center justify-center text-primary-lime">
                                    <UserIcon size={16} />
                                </div>
                                <span className="text-sm font-medium text-gray-300">
                                    {user.email}
                                </span>
                            </div>

                            {/* Botón de cerrar sesión: abre el modal de confirmación */}
                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title="Cerrar Sesión"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        // === Usuario NO autenticado ===
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                Iniciar Sesión
                            </Link>
                            <Link to="/register" className="bg-primary-lime hover:bg-secondary-lime text-dark-bg px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                                Registrarse
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Modal de confirmación de cierre de sesión */}
            <Modal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                title="¿Cerrar sesión?"
            >
                <p className="text-gray-300 mb-6">
                    ¿Estás seguro de que deseas salir de tu cuenta?
                </p>
                <div className="flex justify-end gap-3">
                    {/* Botón "Cancelar": cierra el modal sin hacer nada */}
                    <button
                        onClick={() => setShowLogoutConfirm(false)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
                    >
                        No, cancelar
                    </button>
                    {/* Botón "Sí, salir": ejecuta handleSignOut para cerrar la sesión */}
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                    >
                        Sí, salir
                    </button>
                </div>
            </Modal>
        </>
    );
};
