import { useState } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
// We might need a Modal for logout confirmation, reusing existing one or creating a new simple one?
// For now, I'll re-implement a simple confirmation within the flow or use window.confirm strictly if I can't import the existing Modal easily without checking props.
// Actually, I saw Modal.tsx in the list, I will try to use it if I know the interface.
// Previously viewed Navbar.tsx used specific Modal props: isOpen, onClose, title, children.
import { Modal } from '../ui/Modal';

export const Header = () => {
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
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                    {/* Spacer or Search Bar could go here */}
                    <div className="flex items-center flex-1">
                        {/* Placeholder for future breadcrumbs or title */}
                    </div>

                    <div className="flex items-center gap-x-4 lg:gap-x-6">
                        {/* Separator */}
                        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

                        {/* User Profile */}
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">
                                    {user?.email}
                                </span>
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                    <UserIcon size={18} />
                                </div>
                            </div>

                            <button
                                onClick={() => setShowLogoutConfirm(true)}
                                className="rounded-full p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                <span className="sr-only">Cerrar Sesión</span>
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <Modal
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                title="¿Cerrar sesión?"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        ¿Estás seguro de que deseas salir de tu cuenta?
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setShowLogoutConfirm(false)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                            Salir
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};
