import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-dark-bg text-gray-100 font-sans selection:bg-primary-lime selection:text-dark-bg">
            <Navbar />
            <main className="max-w-7xl mx-auto px-6 pb-12">
                {children}
            </main>
        </div>
    );
};
