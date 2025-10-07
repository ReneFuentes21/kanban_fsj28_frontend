import { useState, useCallback } from 'react';
import kanbanService from '../services/kanbanService';

export const useBoards = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBoards = useCallback(async () => {
    setLoading(true);
    try {
      const apiBoards = await kanbanService.boards.list();
      const mapped = (Array.isArray(apiBoards) ? apiBoards : []).map(b => ({
        id: b.id,
        name: b.name,
        columns: []
      }));
      setBoards(mapped);
      return mapped;
    } catch (err) {
      console.error('Error loading boards', err);
      setError(err.message || 'Error loading boards');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createBoard = useCallback(async (boardName) => {
    setLoading(true);
    try {
      const created = await kanbanService.boards.create({ 
        name: boardName,
        numCards: 4
      });
      return created;
    } catch (err) {
      console.error('Error creating board', err);
      setError(err.message || 'Error creating board');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBoard = useCallback(async (boardId, updates) => {
    setLoading(true);
    try {
      await kanbanService.boards.update(boardId, updates);
      setBoards(prev => prev.map(b => b.id === boardId ? { ...b, ...updates } : b));
    } catch (err) {
      console.error('Error updating board', err);
      setError(err.message || 'Error updating board');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBoard = useCallback(async (boardId) => {
    setLoading(true);
    try {
      await kanbanService.boards.remove(boardId);
      // Actualizar el estado local incluso si falla la API
      setBoards(prev => prev.filter(b => b.id !== boardId));
      return true;
    } catch (err) {
      console.error('Error deleting board from API:', err);
      
      // Si el error es que el tablero no existe, lo eliminamos del estado local igualmente
      if (err.message?.includes('No query results') || err.message?.includes('not found')) {
        console.warn('Board no encontrado en API, eliminando del estado local');
        setBoards(prev => prev.filter(b => b.id !== boardId));
        return true;
      }
      
      setError(err.message || 'Error deleting board');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    boards,
    setBoards,
    loading,
    error,
    loadBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    clearError
  };
};