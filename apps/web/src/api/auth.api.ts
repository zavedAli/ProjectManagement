import { apiClient } from './client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/register', { email, password, name });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getMe: async (signal?: AbortSignal): Promise<User> => {
    const { data } = await apiClient.get('/auth/me', { signal });
    return data;
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    const { data } = await apiClient.post('/auth/refresh');
    return data;
  },

  updateAvatar: async (avatarUrl: string): Promise<User> => {
    const { data } = await apiClient.patch('/auth/avatar', { avatarUrl });
    return data;
  },

  githubOAuth: async (code: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/auth/github', { code });
    return data;
  },
};
