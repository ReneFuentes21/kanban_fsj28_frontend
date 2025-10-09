import React, { useState } from 'react';
import { Status, Priority, PRIORITY_COLORS, CalendarIcon, PencilIcon, TrashIcon, ListIcon } from '../constants';

const ListView = ({ board, onEditTask, onDeleteTask, onSaveTask }) => {
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editedTask, setEditedTask] = useState(null);

    const allTasks = board.columns.flatMap(column => 
        column.tasks.map(task => ({
            ...task,
            columnName: column.title,
            columnId: column.id
        }))
    );

    const getDaysRemaining = (deadline) => {
        if (!deadline) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return '1 día';
        if (diffDays > 1) return `${diffDays} días`;
        if (diffDays === -1) return '1 día de retraso';
        return `${Math.abs(diffDays)} días de retraso`;
    };

    const handleEditClick = (task) => {
        setEditingTaskId(task.id);
        setEditedTask({ ...task });
    };

    const handleSaveClick = async (taskId) => {
        try {
            await onSaveTask(editedTask);
            setEditingTaskId(null);
            setEditedTask(null);
        } catch (err) {
            console.error('Error saving task:', err);
        }
    };

    const handleCancelClick = () => {
        setEditingTaskId(null);
        setEditedTask(null);
    };

    const handleFieldChange = (field, value) => {
        setEditedTask(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUserFieldChange = (field, value) => {
        setEditedTask(prev => ({
            ...prev,
            user: {
                ...prev.user,
                [field]: value
            }
        }));
    };

    const formatDateForInput = (date) => {
        if (!date) return '';
        try {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (e) {
            return '';
        }
    };

    const getDeadlineColor = (deadline) => {
        if (!deadline) return 'text-gray-500 dark:text-gray-400';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'text-red-600 font-semibold dark:text-red-400';
        if (diffDays <= 3) return 'text-orange-500 font-semibold dark:text-orange-400';
        return 'text-gray-500 dark:text-gray-400';
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {board.name} - Vista de Lista
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {allTasks.length} tareas en total
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-slate-800 dark:border-slate-700 overflow-hidden">
                <div className="hidden lg:block">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Tarea</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Estado</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Prioridad</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Asignado a</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Asignado por</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Fecha Límite</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                            {allTasks.map((task) => (
                                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                                    <td className="px-4 py-4">
                                        {editingTaskId === task.id ? (
                                            <div className="space-y-2 min-w-[200px]">
                                                <input
                                                    type="text"
                                                    value={editedTask.title}
                                                    onChange={(e) => handleFieldChange('title', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                                    placeholder="Título"
                                                />
                                                <textarea
                                                    value={editedTask.description}
                                                    onChange={(e) => handleFieldChange('description', e.target.value)}
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                                    placeholder="Descripción"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {task.title || 'Sin título'}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {task.description || 'Sin descripción'}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {editingTaskId === task.id ? (
                                            <select
                                                value={editedTask.status}
                                                onChange={(e) => handleFieldChange('status', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                            >
                                                {Object.values(Status).map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="inline-flex text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                                {task.columnName}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {editingTaskId === task.id ? (
                                            <select
                                                value={editedTask.priority}
                                                onChange={(e) => handleFieldChange('priority', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                            >
                                                {Object.values(Priority).map(priority => (
                                                    <option key={priority} value={priority}>{priority}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className={`inline-flex text-xs font-semibold px-3 py-1 rounded-md ${PRIORITY_COLORS[task.priority]}`}>
                                                {task.priority}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {editingTaskId === task.id ? (
                                            <input
                                                type="text"
                                                value={editedTask.user.name}
                                                onChange={(e) => handleUserFieldChange('name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                                placeholder="Nombre"
                                            />
                                        ) : (
                                            <div className="flex items-center">
                                                <img 
                                                    className="h-8 w-8 rounded-full mr-3" 
                                                    src={task.user.avatarUrl} 
                                                    alt={task.user.name}
                                                />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {task.user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {task.user.role}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {editingTaskId === task.id ? (
                                            <input
                                                type="text"
                                                value={editedTask.allocator || ''}
                                                onChange={(e) => handleFieldChange('allocator', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                                placeholder="Quién asignó"
                                            />
                                        ) : (
                                            <div className="text-sm">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {task.allocator || 'No especificado'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Asignó la tarea
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {editingTaskId === task.id ? (
                                            <input
                                                type="date"
                                                value={formatDateForInput(editedTask.deadline)}
                                                onChange={(e) => handleFieldChange('deadline', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100 dark:[color-scheme:dark]"
                                            />
                                        ) : (
                                            task.deadline ? (
                                                <div className={`flex flex-col space-y-1 ${getDeadlineColor(task.deadline)}`}>
                                                    <div className="flex items-center space-x-2">
                                                        <CalendarIcon />
                                                        <span className="text-sm">{new Date(task.deadline).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="text-xs opacity-75 pl-5">
                                                        ({getDaysRemaining(task.deadline)})
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400 dark:text-gray-500">Sin fecha</span>
                                            )
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {editingTaskId === task.id ? (
                                            <div className="flex flex-col space-y-2 min-w-[120px]">
                                                <button
                                                    onClick={() => handleSaveClick(task.id)}
                                                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    onClick={handleCancelClick}
                                                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(task)}
                                                    className="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                                                    title="Editar"
                                                >
                                                    <PencilIcon />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteTask(task)}
                                                    className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="lg:hidden">
                    <div className="divide-y divide-gray-200 dark:divide-slate-700">
                        {allTasks.map((task) => (
                            <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700">
                                {editingTaskId === task.id ? (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={editedTask.title}
                                            onChange={(e) => handleFieldChange('title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                            placeholder="Título"
                                        />
                                        <textarea
                                            value={editedTask.description}
                                            onChange={(e) => handleFieldChange('description', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                            placeholder="Descripción"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Estado</label>
                                                <select
                                                    value={editedTask.status}
                                                    onChange={(e) => handleFieldChange('status', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                                >
                                                    {Object.values(Status).map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Prioridad</label>
                                                <select
                                                    value={editedTask.priority}
                                                    onChange={(e) => handleFieldChange('priority', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                                >
                                                    {Object.values(Priority).map(priority => (
                                                        <option key={priority} value={priority}>{priority}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Asignado a</label>
                                                <input
                                                    type="text"
                                                    value={editedTask.user.name}
                                                    onChange={(e) => handleUserFieldChange('name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                                    placeholder="Nombre"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Asignado por</label>
                                                <input
                                                    type="text"
                                                    value={editedTask.allocator || ''}
                                                    onChange={(e) => handleFieldChange('allocator', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                                    placeholder="Quién asignó"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha Límite</label>
                                                <input
                                                    type="date"
                                                    value={formatDateForInput(editedTask.deadline)}
                                                    onChange={(e) => handleFieldChange('deadline', e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100 dark:[color-scheme:dark]"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex space-x-2 pt-2">
                                            <button
                                                onClick={() => handleSaveClick(task.id)}
                                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={handleCancelClick}
                                                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                                                    {task.title || 'Sin título'}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {task.description || 'Sin descripción'}
                                                </p>
                                            </div>
                                            <div className="flex space-x-1 ml-2">
                                                <button
                                                    onClick={() => handleEditClick(task)}
                                                    className="p-1 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    title="Editar"
                                                >
                                                    <PencilIcon />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteTask(task)}
                                                    className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    title="Eliminar"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-500 dark:text-gray-400">Estado:</span>
                                                <span className="inline-flex text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                                    {task.columnName}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-500 dark:text-gray-400">Prioridad:</span>
                                                <span className={`inline-flex text-xs font-semibold px-2 py-1 rounded-md ${PRIORITY_COLORS[task.priority]}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2 col-span-2">
                                                <span className="font-medium text-gray-500 dark:text-gray-400">Asignado:</span>
                                                <div className="flex items-center">
                                                    <img 
                                                        className="h-6 w-6 rounded-full mr-2" 
                                                        src={task.user.avatarUrl} 
                                                        alt={task.user.name}
                                                    />
                                                    <span className="text-gray-900 dark:text-gray-100">{task.user.name}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 col-span-2">
                                                <span className="font-medium text-gray-500 dark:text-gray-400">Asignado por:</span>
                                                <span className="text-gray-900 dark:text-gray-100">
                                                    {task.allocator || 'No especificado'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2 col-span-2">
                                                <span className="font-medium text-gray-500 dark:text-gray-400">Fecha Límite:</span>
                                                {task.deadline ? (
                                                    <div className={`flex flex-col space-y-1 ${getDeadlineColor(task.deadline)}`}>
                                                        <div className="flex items-center space-x-1">
                                                            <CalendarIcon />
                                                            <span>{new Date(task.deadline).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="text-xs opacity-75 pl-5">
                                                            ({getDaysRemaining(task.deadline)})
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500">Sin fecha</span>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {allTasks.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 dark:text-gray-500">
                            <ListIcon className="mx-auto h-12 w-12" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No hay tareas</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Comienza agregando algunas tareas a tu tablero.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListView;