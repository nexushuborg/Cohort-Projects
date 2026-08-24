import api from './api';

export const workspaceService = {
  getWorkspaces: async () => api.get('/workspaces'),
  getWorkspaceById: async (id) => api.get(`/workspaces/${id}`),
  createWorkspace: async (data) => api.post('/workspaces', data),
  updateWorkspace: async (id, data) => api.put(`/workspaces/${id}`, data),
  deleteWorkspace: async (id) => api.delete(`/workspaces/${id}`),
  inviteMember: async (workspaceId, email, role = 'Member') =>
    api.post(`/workspaces/${workspaceId}/members`, { email, role }),
  updateMemberRole: async (workspaceId, userId, role) =>
    api.put(`/workspaces/${workspaceId}/members/${userId}`, { role }),
  removeMember: async (workspaceId, userId) =>
    api.delete(`/workspaces/${workspaceId}/members/${userId}`),
  leaveWorkspace: async (workspaceId) => api.post(`/workspaces/${workspaceId}/leave`),
};