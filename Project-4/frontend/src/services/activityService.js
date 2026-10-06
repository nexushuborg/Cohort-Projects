import api from './api';

export const activityService = {
  getCardActivity: async (cardId) => api.get(`/cards/${cardId}/activity`),
  getBoardActivity: async (boardId) => api.get(`/boards/${boardId}/activity`),
  getNotifications: async () => api.get('/notifications'),
  markNotificationRead: async (id) => api.put(`/notifications/${id}/read`),
  markAllNotificationsRead: async () => api.put('/notifications/read-all'),
};