import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { STATUS_COLORS, PRIORITY_COLORS, TrashIcon, CalendarIcon, Priority, ItemTypes } from '../constants';

const formatDateForInput = (date) => {
    if (!date) return '';
    try {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("Error al formatear la fecha:", e);
        return '';
    }
};

const TaskCard = ({ task, columns = [], onEdit, onDelete, onSave }) => {
    const [editingField, setEditingField] = useState(null);
    const [editedTask, setEditedTask] = useState(task);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!editingField) {
            setEditedTask(task);
        }
    }, [task, editingField]);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.TASK,
        item: { 
            id: task.id,
            currentColumn: columns.find(col => col.tasks?.some(t => t.id === task.id))?.id 
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [task.id, columns]);

    const findTaskColumn = () => {
        if (!columns || columns.length === 0) {
            return null;
        }
        for (const column of columns) {
            const taskInColumn = column.tasks?.find(t => t.id === task.id);
            if (taskInColumn) {
                return column;
            }
        }
        return null;
    };

    const getColumnName = () => {
        const column = findTaskColumn();
        return column ? column.title : 'Sin Estado';
    };

    const getStatusColor = () => {
        const column = findTaskColumn();
        if (!column) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        if (column.color) {
            return column.color;
        }
        return STATUS_COLORS[column.title] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setEditedTask(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!editingField) return;

        setIsSaving(true);
        
        try {
            let finalDeadline = editedTask.deadline;
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

            await onSave(taskToSave);
        } catch (err) {
            console.error('Error saving task from card:', err);
            setEditedTask(task);
        } finally {
            setIsSaving(false);
            setEditingField(null);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.tagName.toLowerCase() !== 'textarea') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            setEditedTask(task);
            setEditingField(null);
        }
    };

    const handleStartEditing = (field) => {
        setEditedTask(task);
        setEditingField(field);
    };

    return (
        <div
            ref={drag}
            style={{ 
                opacity: isDragging ? 0.5 : 1,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onDoubleClick={onEdit}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-4 space-y-3 hover:shadow-lg transition-all duration-200 dark:bg-slate-700 dark:border-slate-600 cursor-grab relative"
            title="Arrastrar para mover entre columnas | Doble clic para editar en detalle"
        >
            {isDragging && (
                <div className="absolute inset-0 bg-blue-100 bg-opacity-20 border-2 border-dashed border-blue-400 rounded-lg pointer-events-none"></div>
            )}

            {isSaving && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-lg z-10 dark:bg-slate-700 dark:bg-opacity-70">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
            )}

            <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">{task.id}</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors dark:text-gray-500 dark:hover:text-red-500"
                    disabled={isSaving}
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
                    disabled={isSaving}
                />
            ) : (
                <h4 
                    onClick={(e) => { e.stopPropagation(); handleStartEditing('title'); }} 
                    className="font-bold text-gray-800 min-h-[1.5rem] dark:text-gray-100"
                >
                    {task.title || <span className="text-gray-400 dark:text-gray-500 italic">Sin Título</span>}
                </h4>
            )}

            {editingField === 'description' ? (
                <textarea
                    name="description"
                    value={editedTask.description}
                    onChange={handleFieldChange}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    onClick={e => e.stopPropagation()}
                    rows={2}
                    className="text-sm w-full border border-gray-300 rounded-md px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-gray-100 dark:border-slate-600 cursor-text"
                    autoFocus
                    disabled={isSaving}
                    placeholder="Descripción de la tarea..."
                />
            ) : (
                <p 
                    onClick={(e) => { e.stopPropagation(); handleStartEditing('description'); }} 
                    className="text-sm text-gray-600 mt-1 min-h-[1.25rem] dark:text-gray-300"
                >
                    {task.description || <span className="text-gray-400 dark:text-gray-500 italic">Sin descripción</span>}
                </p>
            )}

            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getStatusColor()}`}>
                {getColumnName()}
            </span>

            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Progreso</span>
                    <span className="font-semibold">{task.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                            (task.progress || 0) >= 100 ? 'bg-green-600' :
                            (task.progress || 0) >= 75 ? 'bg-blue-600' :
                            (task.progress || 0) >= 50 ? 'bg-yellow-500' :
                            (task.progress || 0) >= 25 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${task.progress || 0}%` }}
                    ></div>
                </div>
            </div>

            <div className="flex items-center pt-2">
                <img className="h-8 w-8 rounded-full object-cover" src={task.user.avatarUrl} alt={task.user.name} />
                <div className="ml-3 text-sm">
                    <p className="font-semibold text-gray-900 dark:text-gray-50">{task.user.name}</p>
                    <div className="flex flex-col space-y-1">
                        {task.allocator && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Asignado por: <span className="font-medium">{task.allocator}</span>
                            </p>
                        )}
                        <div className="flex items-center space-x-2">
                            <p className="text-gray-500 dark:text-gray-400 text-xs">{task.user.role}</p>
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
                                    disabled={isSaving}
                                >
                                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            ) : (
                                <span 
                                    onClick={(e) => { e.stopPropagation(); handleStartEditing('priority'); }} 
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-md ${PRIORITY_COLORS[task.priority]}`}
                                >
                                    Prioridad {task.priority}
                                </span>
                            )}
                        </div>
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
                        disabled={isSaving}
                    />
                ) : (
                    task.deadline ? (
                        <div 
                            onClick={(e) => { e.stopPropagation(); handleStartEditing('deadline'); }} 
                            className={`flex items-center space-x-1 ${getDeadlineColor(task.deadline)}`}
                        >
                            <CalendarIcon />
                            <span>
                                {new Date(task.deadline).toLocaleDateString()}
                                <span className="ml-1 text-xs opacity-75">
                                    ({getDaysRemaining(task.deadline)})
                                </span>
                            </span>
                        </div>
                    ) : (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleStartEditing('deadline'); }} 
                            className="text-xs text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 flex items-center space-x-1"
                            disabled={isSaving}
                        >
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