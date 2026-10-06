import api from './api';

export const cardService = {
  getCards: async (boardId) => api.get(`/boards/${boardId}/cards`),
  createCard: async (data) => api.post('/cards', data),
  updateCard: async (cardId, data) => api.put(`/cards/${cardId}`, data),
  deleteCard: async (cardId) => api.delete(`/cards/${cardId}`),
  moveCard: async (payload) => api.put('/cards/move', payload),
  getWorkspaceLabels: async (workspaceId) => api.get(`/workspaces/${workspaceId}/labels`),
  createWorkspaceLabel: async (workspaceId, labelData) =>
    api.post(`/workspaces/${workspaceId}/labels`, labelData),
  attachLabelToCard: async (cardId, labelId) => api.post(`/cards/${cardId}/labels`, { labelId }),
  detachLabelFromCard: async (cardId, labelId) => api.delete(`/cards/${cardId}/labels/${labelId}`),
  assignUserToCard: async (cardId, userId) => api.post(`/cards/${cardId}/assignees`, { userId }),
  unassignUserFromCard: async (cardId, userId) => api.delete(`/cards/${cardId}/assignees/${userId}`),
};