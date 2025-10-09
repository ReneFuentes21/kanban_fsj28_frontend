import React, { useState, useEffect } from 'react';
import { Priority, CalendarIcon } from '../constants';

const formatDateForInput = (date) => {
    if (!date) return '';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Error al formatear la fecha:", e);
        return '';
    }
};

const EditTaskModal = ({ task, onClose, onSave }) => {
    const [editedTask, setEditedTask] = useState({
        title: '',
        description: '',
        priority: Priority.MEDIA,
        progress: 0,
        user: { name: '', role: '' },
        allocator: '',
        deadline: null,
        ...task
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditedTask({
            title: task.title || '',
            description: task.description || '',
            priority: task.priority || Priority.MEDIA,
            progress: task.progress || 0,
            user: {
                name: task.user?.name || '',
                role: task.user?.role || ''
            },
            allocator: task.allocator || '',
            deadline: task.deadline || null,
            status: task.status,
            id: task.id
        });
    }, [task]);

    const handleSave = async () => {
        if (!editedTask.title.trim()) {
            alert('El título es requerido');
            return;
        }

        if (!editedTask.allocator.trim()) {
            alert('El campo "Asignado por" es requerido');
            return;
        }

        setIsSaving(true);
        try {
            let finalDeadline = null;
            if (editedTask.deadline) {
                if (typeof editedTask.deadline === 'string') {
                    finalDeadline = new Date(editedTask.deadline + 'T00:00:00');
                } else if (editedTask.deadline instanceof Date) {
                    finalDeadline = editedTask.deadline;
                }
                if (finalDeadline && isNaN(finalDeadline.getTime())) {
                    console.warn('Fecha inválida, usando null');
                    finalDeadline = null;
                }
            }

            const taskToSave = {
                ...task,
                title: editedTask.title.trim(),
                description: editedTask.description.trim(),
                priority: editedTask.priority,
                progress: parseInt(editedTask.progress) || 0,
                user: {
                    name: editedTask.user.name.trim() || 'Usuario',
                    role: editedTask.user.role.trim(),
                    avatarUrl: task.user?.avatarUrl || 'https://i.pravatar.cc/40'
                },
                allocator: editedTask.allocator.trim(),
                deadline: finalDeadline,
                status: editedTask.status
            };

            await onSave(taskToSave);
        } catch (error) {
            console.error('Error al guardar:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('user.')) {
            const userField = name.split('.')[1];
            setEditedTask(prev => ({
                ...prev,
                user: {
                    ...prev.user,
                    [userField]: value
                }
            }));
        } else {
            setEditedTask(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSave();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-800"
                onKeyDown={handleKeyDown}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {task.id ? 'Editar Tarea' : 'Nueva Tarea'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Título *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={editedTask.title}
                                onChange={handleFieldChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                placeholder="Ingresa el título de la tarea"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Descripción
                            </label>
                            <textarea
                                name="description"
                                value={editedTask.description}
                                onChange={handleFieldChange}
                                rows={3}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                placeholder="Describe la tarea..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Asignado a *
                                </label>
                                <input
                                    type="text"
                                    name="user.name"
                                    value={editedTask.user.name}
                                    onChange={handleFieldChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                    placeholder="Nombre del responsable"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Asignado por *
                                </label>
                                <input
                                    type="text"
                                    name="allocator"
                                    value={editedTask.allocator}
                                    onChange={handleFieldChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                    placeholder="Quién asigna la tarea"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Prioridad
                                </label>
                                <select
                                    name="priority"
                                    value={editedTask.priority}
                                    onChange={handleFieldChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                >
                                    <option value={Priority.BAJA}>Baja</option>
                                    <option value={Priority.MEDIA}>Media</option>
                                    <option value={Priority.ALTA}>Alta</option>
                                    <option value={Priority.URGENTE}>Urgente</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Fecha Límite
                                </label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formatDateForInput(editedTask.deadline)}
                                    onChange={handleFieldChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100 dark:[color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Progreso: <span className="font-semibold">{editedTask.progress || 0}%</span>
                            </label>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="range"
                                    name="progress"
                                    min="0"
                                    max="100"
                                    step="10"
                                    value={editedTask.progress || 0}
                                    onChange={handleFieldChange}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600"
                                />
                                <div className="flex space-x-1">
                                    {[0, 25, 50, 75, 100].map(value => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => handleFieldChange({ target: { name: 'progress', value } })}
                                            className={`px-2 py-1 text-xs rounded ${
                                                (editedTask.progress || 0) === value 
                                                    ? 'bg-indigo-600 text-white' 
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-gray-300'
                                            }`}
                                        >
                                            {value}%
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Rol/Cargo
                            </label>
                            <input
                                type="text"
                                name="user.role"
                                value={editedTask.user.role}
                                onChange={handleFieldChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
                                placeholder="Rol o cargo del responsable"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !editedTask.title.trim() || !editedTask.user.name.trim() || !editedTask.allocator.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Guardando...
                                </div>
                            ) : (
                                'Guardar Tarea'
                            )}
                        </button>
                    </div>

                    <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                        <p>💡 <kbd>Ctrl + Enter</kbd> para guardar rápido • <kbd>Esc</kbd> para cancelar</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditTaskModal;