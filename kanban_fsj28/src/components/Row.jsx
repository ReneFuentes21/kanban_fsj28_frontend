import React from 'react';
import TaskCard from './TaskCard';
import { EmptyStateIcon, PlusIcon } from '../constants';

const Row = ({ column, onAddTask, onDeleteTask, onEditTask, onSaveTask }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100">{column.title}</h3>
                <span className="text-sm font-semibold text-gray-500 bg-gray-200 rounded-full px-2 py-0.5 dark:bg-slate-700 dark:text-gray-300">
                    {column.tasks.length}
                </span>
            </div>

            <div className="space-y-2">
                {column.tasks.length > 0 ? (
                    column.tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={() => onEditTask(task)}
                            onDelete={() => onDeleteTask(task)}
                            onSave={onSaveTask}
                            horizontal={true}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-24 text-center">
                        <EmptyStateIcon />
                        <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">No hay tareas</p>
                    </div>
                )}
            </div>

            <button
                onClick={onAddTask}
                className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-200/50 rounded-lg hover:bg-gray-300/60 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 transition-colors dark:bg-slate-700/50 dark:text-gray-300 dark:hover:bg-slate-700"
            >
                <PlusIcon />
                <span>Agregar Tarea</span>
            </button>
        </div>
    );
};

export default Row;