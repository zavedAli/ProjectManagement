import { apiClient } from './client';
import type { Workspace } from '../types';

export const workspaceApi = {
  getAll: async (signal?: AbortSignal): Promise<Workspace[]> => {
    const { data } = await apiClient.get('/workspaces', { signal });
    return data;
  },

  getById: async (id: string, signal?: AbortSignal): Promise<Workspace> => {
    const { data } = await apiClient.get(`/workspaces/${id}`, { signal });
    return data;
  },

  create: async (workspace: { name: string; slug: string }): Promise<Workspace> => {
    const { data } = await apiClient.post('/workspaces', workspace);
    return data;
  },

  update: async (id: string, updates: { name?: string; description?: string }): Promise<Workspace> => {
    const { data } = await apiClient.patch(`/workspaces/${id}`, updates);
    return data;
  },
};
