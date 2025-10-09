import React, { useState } from 'react';

const NewBoardModal = ({ onClose, onCreate }) => {
    const [boardName, setBoardName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!boardName.trim()) return;
        
        setLoading(true);
        setError('');
        
        try {
            await onCreate(boardName.trim());
        } catch (err) {
            console.error('Error creating board:', err);
            setError(err.message || 'Error al crear el tablero');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md dark:bg-slate-800">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Crear Nuevo Tablero</h3>
                    </div>
                    <div className="p-6">
                        <label htmlFor="boardName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nombre del Tablero
                        </label>
                        <input
                            type="text"
                            id="boardName"
                            value={boardName}
                            onChange={(e) => setBoardName(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600"
                            placeholder="Ej: Lanzamiento Producto"
                            autoFocus
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                        )}
                    </div>
                    <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 dark:bg-slate-900/50 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-600 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!boardName.trim() || loading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creando...' : 'Crear Tablero'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewBoardModal;