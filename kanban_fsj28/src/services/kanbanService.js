// src/services/kanbanService.js
import api from './apiClient';

const boards = {
  list: async () => {
    const resp = await api.get('/boards');
    return resp.data;
  },
  get: async (id) => {
    const resp = await api.get(`/boards/${id}`);
    return resp.data;
  },
  create: async (payload) => {
    const fullPayload = {
      ...payload,
      numCards: payload.numCards || 4
    };
    const resp = await api.post('/boards', fullPayload);
    return resp.data;
  },
  update: async (id, payload) => {
    const resp = await api.patch(`/boards/${id}`, payload);
    return resp.data;
  },
  remove: async (id) => {
    const resp = await api.delete(`/boards/${id}`);
    return resp.data;
  }
};

// Columns - en tu API se llaman "cards"
const columns = {
  list: async (boardId) => {
    const resp = await api.get(`/boards/${boardId}/cards`);
    return resp.data;
  },
  create: async (boardId, payload) => {
    const resp = await api.post(`/boards/${boardId}/cards`, payload);
    return resp.data;
  },
  update: async (columnId, payload) => {
    const resp = await api.patch(`/cards/${columnId}`, payload);
    return resp.data;
  },
  remove: async (columnId) => {
    const resp = await api.delete(`/cards/${columnId}`);
    return resp.data;
  }
};

// Tasks - usar PUT en lugar de PATCH para actualizar
const tasks = {
  list: async (boardId) => {
    try {
      const resp = await api.get(`/tasks?boardId=${boardId}`);
      return resp.data;
    } catch (error) {
      console.warn('Error loading tasks, trying alternative endpoints:', error);
      try {
        const resp = await api.get(`/tasks?board_id=${boardId}`);
        return resp.data;
      } catch (e) {
        try {
          const resp = await api.get(`/items?boardId=${boardId}`);
          return resp.data;
        } catch (e2) {
          console.error('All task endpoints failed');
          return [];
        }
      }
    }
  },
  create: async (boardId, payload) => {
    const resp = await api.post('/tasks', { 
      ...payload, 
      boardId
    });
    return resp.data;
  },
  update: async (taskId, payload) => {
    // Cambiar PATCH por PUT
    const resp = await api.put(`/tasks/${taskId}`, payload);
    return resp.data;
  },
  remove: async (taskId) => {
    const resp = await api.delete(`/tasks/${taskId}`);
    return resp.data;
  }
};

export default { boards, columns, tasks };