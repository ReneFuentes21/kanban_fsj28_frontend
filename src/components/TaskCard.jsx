import React, { useState, useEffect } from 'react';
import { STATUS_COLORS, PRIORITY_COLORS, TrashIcon, CalendarIcon, Priority } from '../constants';

// Helper to format date object to 'YYYY-MM-DD' string for date inputs
const formatDateForInput = (date) => {
    if (!date) return '';
    try {
        const d = new Date(date);
        // Using local date components to prevent timezone shifts
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        return '';
    }
};

const TaskCard = ({ task, onEdit, onDelete, onSave }) => {
    const [editingField, setEditingField] = useState(null); // null | 'title' | 'description' | 'priority' | 'deadline'
    const [editedTask, setEditedTask] = useState(task);

    useEffect(() => {
        if (!editingField) {
            setEditedTask(task);
        }
    }, [task, editingField]);

    const getDeadlineColor = (deadline) => {
        if (!deadline) return 'text-gray-500 dark:text-gray-400';
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare dates only
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);

        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'text-red-600 font-semibold dark:text-red-400'; // Past due
        if (diffDays <= 3) return 'text-orange-500 font-semibold dark:text-orange-400'; // Nearing
        return 'text-gray-500 dark:text-gray-400';
    };

    const statusColor = STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-800';

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setEditedTask(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!editingField) return;

        let finalDeadline = editedTask.deadline;
        // If deadline was edited, it's a 'YYYY-MM-DD' string. Convert to Date.
        if (editingField === 'deadline' && typeof finalDeadline === 'string') {
            finalDeadline = finalDeadline ? new Date(finalDeadline + 'T00:00:00') : null;
        }

        const taskToSave = {
            ...task,
            ...editedTask,
            title: (editedTask.title || '').trim() || 'Sin Título',
            description: (editedTask.description || '').trim(),
            deadline: finalDeadline,
        };

        onSave(taskToSave);
        setEditingField(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.tagName.toLowerCase() !== 'textarea') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            setEditedTask(task); // Revert changes
            setEditingField(null);
        }
    };

    const handleStartEditing = (field) => {
        setEditedTask(task); // Reset to original task data before editing a field
        setEditingField(field);
    };

    return (
        <div
            onDoubleClick={onEdit}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-4 space-y-3 hover:shadow-lg transition-shadow duration-200 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
            title="Doble clic para editar en detalle"
        >
            <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{task.id}</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent double click event from firing on the parent
                        onDelete();
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors dark:text-gray-500 dark:hover:text-red-500"
                >
                    <TrashIcon />
                </button>
            </div>

            {editingField === 'title' ? (
                <input
                    type="text"
                    name="title"
                    value={editedTask.title}
                    onChange={handleFieldChange}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    onClick={e => e.stopPropagation()}
                    className="font-bold text-base w-full border border-gray-300 rounded-md px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-gray-100 dark:border-slate-600 cursor-text"
                    autoFocus
                />
            ) : (
                <h4 onClick={(e) => { e.stopPropagation(); handleStartEditing('title'); }} className="font-bold text-gray-800 min-h-[1.5rem] dark:text-gray-100">{task.title || <span className="text-gray-400 dark:text-gray-500 italic">Sin Título</span>}</h4>
            )}

            {editingField === 'description' ? (
                <textarea
                    name="description"
                    value={editedTask.description}
                    onChange={handleFieldChange}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    onClick={e => e.stopPropagation()}
                    rows={3}
                    className="text-sm w-full border border-gray-300 rounded-md px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-gray-100 dark:border-slate-600 cursor-text"
                    autoFocus
                />
            ) : (
                <p onClick={(e) => { e.stopPropagation(); handleStartEditing('description'); }} className="text-sm text-gray-600 mt-1 min-h-[1.25rem] dark:text-gray-300">{task.description || <span className="text-gray-400 dark:text-gray-500 italic">Sin Descripción</span>}</p>
            )}

            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColor}`}>
                {task.status}
            </span>

            <div className="flex items-center pt-2">
                <img className="h-8 w-8 rounded-full object-cover" src={task.user.avatarUrl} alt={task.user.name} />
                <div className="ml-3 text-sm">
                    <p className="font-semibold text-gray-900 dark:text-gray-50">{task.user.name}</p>
                    <div className="flex items-center space-x-2">
                        <p className="text-gray-500 dark:text-gray-400">{task.user.role}</p>
                        {editingField === 'priority' ? (
                            <select
                                name="priority"
                                value={editedTask.priority}
                                onChange={handleFieldChange}
                                onBlur={handleSave}
                                onKeyDown={handleKeyDown}
                                onClick={e => e.stopPropagation()}
                                className="text-xs font-semibold border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-gray-100 dark:border-slate-600 cursor-pointer"
                                autoFocus
                            >
                                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        ) : (
                            <span onClick={(e) => { e.stopPropagation(); handleStartEditing('priority'); }} className={`text-xs font-semibold px-2 py-0.5 rounded-md ${PRIORITY_COLORS[task.priority]}`}>
                                Prioridad {task.priority}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-600 pt-3 mt-3 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                    <span>Creado: {new Date(task.creationDate).toLocaleDateString()}</span>
                </div>

                {editingField === 'deadline' ? (
                    <input
                        type="date"
                        name="deadline"
                        value={formatDateForInput(editedTask.deadline)}
                        onChange={handleFieldChange}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        onClick={e => e.stopPropagation()}
                        className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-gray-100 dark:border-slate-600 dark:[color-scheme:dark] cursor-pointer"
                        autoFocus
                    />
                ) : (
                    task.deadline ? (
                        <div onClick={(e) => { e.stopPropagation(); handleStartEditing('deadline'); }} className={`flex items-center space-x-1 ${getDeadlineColor(task.deadline)}`}>
                            <CalendarIcon />
                            <span>{new Date(task.deadline).toLocaleDateString()}</span>
                        </div>
                    ) : (
                        <button onClick={(e) => { e.stopPropagation(); handleStartEditing('deadline'); }} className="text-xs text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 flex items-center space-x-1">
                            <CalendarIcon />
                            <span>Agregar Límite</span>
                        </button>
                    )
                )}
            </div>
        </div>
    );
};

export default TaskCard;