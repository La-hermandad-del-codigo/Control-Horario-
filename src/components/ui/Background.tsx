import React from 'react';

export const Background: React.FC = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Mesh Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='0.5'/%3E%3C/g%3E%3C/svg%3E")` }}
            />

            {/* Primary Decorative Orb */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-lime/10 dark:bg-primary-lime/5 blur-[100px] animate-pulse" />

            {/* Secondary Decorative Orb */}
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-lime/5 dark:bg-primary-lime/[0.03] blur-[120px]" />

            {/* Subtle accent orbs */}
            <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-secondary-lime/5 dark:bg-secondary-lime/[0.02] blur-[80px]" />
            <div className="absolute bottom-[30%] left-[5%] w-[15%] h-[15%] rounded-full bg-primary-lime/5 dark:bg-primary-lime/[0.02] blur-[60px]" />
        </div>
    );
};
