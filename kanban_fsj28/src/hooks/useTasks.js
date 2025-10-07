import { useState, useCallback } from 'react';
import kanbanService from '../services/kanbanService';
import { transformApiTaskToUi } from '../utils/taskTransformers';

export const useTasks = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBoardData = useCallback(async (boardId) => {
    if (!boardId) return { columns: [], tasks: [] };
    
    setLoading(true);
    try {
      const [columnsApi, tasksApi] = await Promise.allSettled([
        kanbanService.columns.list(boardId),
        kanbanService.tasks.list(boardId),
      ]);

      let columns = [];
      if (columnsApi.status === 'fulfilled' && Array.isArray(columnsApi.value)) {
        columns = columnsApi.value.map(c => ({
          id: c.id,
          title: c.title || c.name || 'Sin título',
          tasks: []
        }));
      }

      const tasks = (tasksApi.status === 'fulfilled' && Array.isArray(tasksApi.value)) 
        ? tasksApi.value.map(transformApiTaskToUi) 
        : [];

      return { columns, tasks };
    } catch (err) {
      console.error('Error loading board data', err);
      setError(err.message || 'Error loading board data');
      return { columns: [], tasks: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (boardId, taskData) => {
    setLoading(true);
    try {
      const created = await kanbanService.tasks.create(boardId, taskData);
      return created;
    } catch (err) {
      console.error('Error creating task', err);
      setError(err.message || 'Error creating task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (taskId, taskData) => {
    setLoading(true);
    try {
      await kanbanService.tasks.update(taskId, taskData);
    } catch (err) {
      console.error('Error updating task', err);
      setError(err.message || 'Error updating task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    setLoading(true);
    try {
      await kanbanService.tasks.remove(taskId);
    } catch (err) {
      console.error('Error deleting task', err);
      setError(err.message || 'Error deleting task');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    loadBoardData,
    createTask,
    updateTask,
    deleteTask,
    clearError
  };
};