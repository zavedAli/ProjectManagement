import { apiClient } from './client';
import type { Project } from '../types';

export const projectApi = {
  getAll: async (workspaceId: string, signal?: AbortSignal, search?: string): Promise<Project[]> => {
    const { data } = await apiClient.get('/projects', { params: { workspaceId, ...(search ? { search } : {}) }, signal });
    return data;
  },

  getById: async (id: string, signal?: AbortSignal): Promise<Project> => {
    const { data } = await apiClient.get(`/projects/${id}`, { signal });
    return data;
  },

  create: async (project: { workspaceId: string; name: string; key: string; description?: string }): Promise<Project> => {
    const { data } = await apiClient.post('/projects', project);
    return data;
  },

  update: async (id: string, updates: { name?: string; description?: string; archived?: boolean }): Promise<Project> => {
    const { data } = await apiClient.patch(`/projects/${id}`, updates);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};
