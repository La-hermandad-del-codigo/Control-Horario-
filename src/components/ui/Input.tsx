import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    name,
    error,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || name;

    return (
        <div className="w-full">
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                id={inputId}
                name={name}
                className={`
          block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 sm:text-sm
          ${error
                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
                    }
          ${className}
        `}
                aria-invalid={!!error}
                aria-describedby={error ? `${inputId}-error` : undefined}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600" id={`${inputId}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
};
