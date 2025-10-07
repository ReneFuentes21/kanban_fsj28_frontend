import React, { useState, useEffect } from 'react';
import { Status, Priority } from '../constants';

const EditTaskModal = ({ task, onClose, onSave }) => {
    const [formData, setFormData] = useState(task);

    useEffect(() => {
        setFormData(task);
    }, [task]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (['name', 'role', 'avatarUrl'].includes(name)) {
            setFormData(prev => ({
                ...prev,
                user: { ...prev.user, [name]: value },
            }));
        } else if (name === 'deadline') {
            // Parse date string as local time to avoid timezone issues
            setFormData(prev => ({ ...prev, deadline: value ? new Date(value + 'T00:00:00') : null }));
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const taskToSave = {
            ...formData,
            title: formData.title.trim() || 'Nueva Tarea',
            description: formData.description.trim() || 'Descripción de la nueva tarea.',
            user: {
                ...formData.user,
                name: formData.user.name.trim() || 'Sin asignar',
                role: formData.user.role.trim() || 'N/A',
                avatarUrl: formData.user.avatarUrl.trim() || 'https://i.pravatar.cc/40',
            }
        };
        onSave(taskToSave);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-slate-800">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Editar Tarea</h3>
                        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">ID: {task.id}</p>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
                            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600" placeholder="Nueva Tarea" />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600" placeholder="Descripción de la nueva tarea." />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                                <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900 dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600">
                                    {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prioridad</label>
                                <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900 dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600">
                                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Límite</label>
                                <input
                                    type="date"
                                    name="deadline"
                                    id="deadline"
                                    value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600 [color-scheme:light] dark:[color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Creación</label>
                                <p className="mt-1 text-sm text-gray-500 pt-2 dark:text-gray-400">{new Date(formData.creationDate).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                            <p className="text-md font-semibold text-gray-800 mb-2 dark:text-gray-100">Asignado a</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                                    <input type="text" name="name" id="userName" value={formData.user.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600" placeholder="Sin asignar" />
                                </div>
                                <div>
                                    <label htmlFor="userRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
                                    <input type="text" name="role" id="userRole" value={formData.user.role} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600" placeholder="N/A" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="userAvatarUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL del Avatar</label>
                                <input type="text" name="avatarUrl" id="userAvatarUrl" value={formData.user.avatarUrl} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600" placeholder="https://i.pravatar.cc/40" />
                            </div>
                        </div>

                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 dark:bg-slate-900/50 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-600">
                            Cancelar
                        </button>
                        <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTaskModal;