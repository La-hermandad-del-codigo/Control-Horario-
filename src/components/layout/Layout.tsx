// ReactNode: tipo de TypeScript que representa cualquier contenido renderizable por React
// (elementos, strings, números, fragmentos, arrays, null, etc.).
import type { ReactNode } from 'react';

// Navbar: barra de navegación superior de la aplicación.
import { Navbar } from './Navbar';

/**
 * Props del componente Layout.
 * @property {ReactNode} children - Contenido hijo que se renderizará dentro del layout.
 */
interface LayoutProps {
    children: ReactNode;
}

/**
 * Componente de layout (estructura) principal de la aplicación.
 *
 * Proporciona la estructura visual consistente para todas las páginas protegidas:
 * - Fondo oscuro (`bg-dark-bg`) con texto claro.
 * - Barra de navegación (`Navbar`) fija en la parte superior.
 * - Área de contenido principal (`<main>`) centrada con ancho máximo de 7xl (80rem)
 *   y padding horizontal/inferior.
 * - Selección de texto personalizada con colores de la marca (lime sobre fondo oscuro).
 *
 * @param {LayoutProps} props - Props del componente.
 * @returns {JSX.Element} Estructura de layout con navbar y contenido.
 */
export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-dark-bg text-gray-100 font-sans selection:bg-primary-lime selection:text-dark-bg">
            {/* Barra de navegación superior */}
            <Navbar />
            {/* Contenedor principal del contenido de la página */}
            <main className="max-w-7xl mx-auto px-6 pb-12">
                {children}
            </main>
        </div>
    );
};
