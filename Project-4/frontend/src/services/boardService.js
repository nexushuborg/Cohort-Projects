import api from './api';

export const boardService = {
  getBoards: async (workspaceId) => api.get(`/workspaces/${workspaceId}/boards`),
  getBoardById: async (boardId) => api.get(`/boards/${boardId}`),
  createBoard: async (workspaceId, data) => api.post(`/workspaces/${workspaceId}/boards`, data),
  updateBoard: async (boardId, data) => api.put(`/boards/${boardId}`, data),
  deleteBoard: async (boardId) => api.delete(`/boards/${boardId}`),
  assignMembers: async (boardId, memberIds) => api.post(`/boards/${boardId}/members`, { memberIds }),
};