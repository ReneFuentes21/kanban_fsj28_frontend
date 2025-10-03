import React from 'react';
import { Status, PencilIcon, PlusIcon, TrashIcon } from '../constants';

const BoardActions = ({ board, onRenameBoard, onAddTask, onDeleteBoard }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 dark:bg-slate-800 dark:border-slate-700">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{board.name}</h2>
                <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Arrastra las tareas entre columnas</p>
            </div>
            <div className="flex items-stretch sm:items-center gap-2 w-full sm:w-auto flex-col sm:flex-row">
                <button
                    onClick={onRenameBoard}
                    className="flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-yellow-400 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-colors"
                >
                    <PencilIcon />
                    <span>Renombrar</span>
                </button>
                <button
                    onClick={() => onAddTask(Status.PENDIENTE)}
                    className="flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                    <PlusIcon />
                    <span>Agregar tarea</span>
                </button>
                <button
                    onClick={onDeleteBoard}
                    className="flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                    <TrashIcon />
                    <span>Eliminar</span>
                </button>
            </div>
        </div>
    );
};

export default BoardActions;