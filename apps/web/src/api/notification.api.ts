import { apiClient } from './client';
import type { Notification } from '../types';

export const notificationApi = {
  getAll: async (signal?: AbortSignal): Promise<Notification[]> => {
    const { data } = await apiClient.get('/notifications', { signal });
    return data;
  },

  getUnreadCount: async (signal?: AbortSignal): Promise<{ count: number }> => {
    const { data } = await apiClient.get('/notifications/unread-count', { signal });
    return data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const { data } = await apiClient.patch(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/mark-all-read');
  },
};
