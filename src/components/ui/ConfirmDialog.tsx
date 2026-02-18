
import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'danger'
}) => {
    const confirmStyles = {
        danger: 'bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500 hover:text-white',
        warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50 hover:bg-yellow-500 hover:text-white',
        info: 'bg-blue-500/10 text-blue-500 border-blue-500/50 hover:bg-blue-500 hover:text-white',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-white/5">
                        <AlertTriangle className={type === 'danger' ? 'text-red-500' : 'text-yellow-500'} size={24} />
                    </div>
                    <div>
                        <p className="text-gray-300 leading-relaxed">{message}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-6 py-2 border rounded-lg font-medium transition-all ${confirmStyles[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
