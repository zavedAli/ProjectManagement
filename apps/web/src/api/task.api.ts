import { apiClient } from './client';
import type { Task, Comment, CreateTaskDTO, UpdateTaskDTO } from '../types';

export const taskApi = {
  getAll: async (projectId: string, signal?: AbortSignal, search?: string, sortBy?: string, sortOrder?: string): Promise<Task[]> => {
    const { data } = await apiClient.get('/tasks', { params: { projectId, ...(search ? { search } : {}), ...(sortBy ? { sortBy, sortOrder } : {}) }, signal });
    return data;
  },

  getById: async (id: string, signal?: AbortSignal): Promise<Task> => {
    const { data } = await apiClient.get(`/tasks/${id}`, { signal });
    return data;
  },

  create: async (projectId: string, task: CreateTaskDTO): Promise<Task> => {
    const { data } = await apiClient.post('/tasks', { projectId, ...task });
    return data;
  },

  update: async (id: string, updates: UpdateTaskDTO): Promise<Task> => {
    const { data } = await apiClient.patch(`/tasks/${id}`, updates);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },

  addComment: async (taskId: string, content: string): Promise<Comment> => {
    const { data } = await apiClient.post(`/tasks/${taskId}/comments`, { content });
    return data;
  },
};
