// X: ícono de "cerrar" (cruz) de lucide-react.
import { X } from "lucide-react";

// useEffect: hook para ejecutar efectos secundarios (bloquear/desbloquear scroll del body).
import { useEffect } from "react";

/**
 * Props del componente Modal.
 * @property {boolean} isOpen - Indica si el modal está visible.
 * @property {() => void} onClose - Callback que se ejecuta al cerrar el modal.
 * @property {string} title - Título que se muestra en la cabecera del modal.
 * @property {React.ReactNode} children - Contenido principal del modal.
 */
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'default' | 'large';
}

/**
 * Componente de modal (diálogo) reutilizable.
 *
 * Características:
 * - **Overlay**: Fondo semitransparente oscuro con desenfoque (backdrop-blur).
 * - **Bloqueo de scroll**: Cuando el modal está abierto, se deshabilita el scroll del body
 *   para evitar que el usuario haga scroll en el fondo. Se restaura al cerrar o desmontar.
 * - **Cabecera**: Muestra el título y un botón de cierre (X).
 * - **Cuerpo scrolleable**: El contenido tiene overflow-y-auto con altura máxima del 90% del viewport.
 * - **Estilo glass-card**: Usa efecto glassmorphism consistente con el diseño de la app.
 *
 * @param {ModalProps} props - Props del componente.
 * @returns {JSX.Element | null} El modal renderizado, o null si no está abierto.
 */
export const Modal = ({ isOpen, onClose, title, children, size = 'default' }: ModalProps) => {
  // Efecto para controlar el scroll del body.
    // Cuando el modal se abre, bloquea el scroll. Cuando se cierra o el componente
    // se desmonta, restaura el scroll normal.
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        // Cleanup: asegura que el scroll se restaure si el componente se desmonta.
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Si el modal no está abierto, no renderiza nada.
    if (!isOpen) return null;

    const maxWidthClass = size === 'large' ? 'max-w-6xl' : 'max-w-lg';

    return (
        // Overlay: cubre toda la pantalla con fondo negro semitransparente y desenfoque.
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className={`glass-card w-full ${maxWidthClass} overflow-hidden flex flex-col max-h-[90vh]`}>
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                {/* Cuerpo del modal: contenido scrolleable */}
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};
