import React from 'react';

interface TableProps {
    children: React.ReactNode;
    className?: string;
}

export const Table: React.FC<TableProps> & {
    Header: React.FC<{ children: React.ReactNode }>;
    Body: React.FC<{ children: React.ReactNode }>;
    Row: React.FC<{ children: React.ReactNode; className?: string }>;
    Head: React.FC<{ children: React.ReactNode; className?: string }>;
    Cell: React.FC<{ children: React.ReactNode; className?: string }>;
} = ({ children, className = '' }) => {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="min-w-full divide-y divide-gray-200">
                {children}
            </table>
        </div>
    );
};

Table.Header = ({ children }) => (
    <thead className="bg-gray-50">
        {children}
    </thead>
);

Table.Body = ({ children }) => (
    <tbody className="bg-white divide-y divide-gray-200">
        {children}
    </tbody>
);

Table.Row = ({ children, className = '' }) => (
    <tr className={`hover:bg-gray-50 transition-colors ${className}`}>
        {children}
    </tr>
);

Table.Head = ({ children, className = '' }) => (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
        {children}
    </th>
);

Table.Cell = ({ children, className = '' }) => (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
        {children}
    </td>
);
