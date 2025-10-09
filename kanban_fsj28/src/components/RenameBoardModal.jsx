import React, { useState, useEffect } from 'react';

const RenameBoardModal = ({ board, onClose, onSave }) => {
    const [newName, setNewName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (board) {
            setNewName(board.name || '');
        }
    }, [board]);

    const handleSave = async () => {
        if (!newName.trim()) {
            alert('El nombre del tablero no puede estar vacío');
            return;
        }

        if (!board?.id) {
            alert('Error: No se puede identificar el tablero');
            return;
        }

        setIsSaving(true);
        try {
            await onSave(board.id, newName.trim());
            onClose();
        } catch (error) {
            console.error('Error al renombrar el tablero:', error);
            alert('Error al renombrar el tablero. Por favor, intenta nuevamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!board) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md dark:bg-slate-800">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            Renombrar Tablero
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            disabled={isSaving}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nuevo nombre del tablero
                        </label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                            placeholder="Ingresa el nuevo nombre"
                            autoFocus
                            disabled={isSaving}
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !newName.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Guardando...
                                </div>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </button>
                    </div>

                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                        <p>💡 <kbd>Enter</kbd> para guardar • <kbd>Esc</kbd> para cancelar</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RenameBoardModal;