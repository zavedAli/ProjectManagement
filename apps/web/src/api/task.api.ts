import { apiClient } from './client';
import type { Task, Comment, CreateTaskDTO, UpdateTaskDTO } from '../types';

export const taskApi = {
  getAll: async (projectId: string, signal?: AbortSignal, search?: string, sortBy?: string, sortOrder?: string): Promise<Task[]> => {
    const { data } = await apiClient.get('/tasks', { params: { projectId, ...(search ? { search } : {}), ...(sortBy ? { sortBy, sortOrder } : {}) }, signal });
    return data;
  },

  getAllPaginated: async (projectId: string, skip: number, take: number, signal?: AbortSignal, search?: string): Promise<Task[]> => {
    const { data } = await apiClient.get('/tasks', { params: { projectId, skip, take, ...(search ? { search } : {}) }, signal });
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

  uploadAttachment: async (taskId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteAttachment: async (attachmentId: string): Promise<void> => {
    await apiClient.delete(`/attachments/${attachmentId}`);
  },
};
