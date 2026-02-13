import { useState } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';

export const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
            <nav className="glass-panel sticky top-0 z-50 px-6 py-4 mb-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-lime flex items-center justify-center">
                            <span className="text-dark-bg font-bold text-xl">F</span>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">RelojTiktak</span>
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-6">
                            <div className="hidden md:flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-card-bg border border-white/10 flex items-center justify-center text-primary-lime">
                                    <UserIcon size={16} />
                                </div>
                                <span className="text-sm font-medium text-gray-300">
                                    {user.email}
                                </span>
                            </div>

                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                title="Cerrar Sesión"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
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

            <Modal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                title="¿Cerrar sesión?"
            >
                <p className="text-gray-300 mb-6">
                    ¿Estás seguro de que deseas salir de tu cuenta?
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setShowLogoutConfirm(false)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
                    >
                        No, cancelar
                    </button>
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
