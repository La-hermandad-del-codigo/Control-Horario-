import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar fijo a la izquierda */}
            <Sidebar />

            {/* Contenedor principal que se desplaza a la derecha del sidebar */}
            <div className="flex-1 flex flex-col pl-64">
                {/* Header sticky */}
                <Header />

                {/* Contenido principal scrollable */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
