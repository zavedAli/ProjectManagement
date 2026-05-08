import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/task.api';
import { queryKeys } from '../queryKeys';
import type { Task, Comment } from '../types';

export const useTasks = (projectId: string, search?: string, sortBy?: string, sortOrder?: string) => {
  return useQuery({
    queryKey: [...queryKeys.tasks.all(projectId), search, sortBy, sortOrder],
    queryFn: ({ signal }) => taskApi.getAll(projectId, signal, search, sortBy, sortOrder),
    enabled: !!projectId,
    staleTime: 1000 * 30,
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: ({ signal }) => taskApi.getById(id, signal),
    enabled: !!id,
  });
};

export const useCreateTask = (projectId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof taskApi.create>[1]) => taskApi.create(projectId, data),
    onMutate: async (newTask) => {
      await qc.cancelQueries({ queryKey: queryKeys.tasks.all(projectId) });
      const previous = qc.getQueryData<Task[]>(queryKeys.tasks.all(projectId));

      qc.setQueryData<Task[]>(queryKeys.tasks.all(projectId), (old = []) => [
        ...old,
        { ...newTask, id: `temp-${Date.now()}`, projectId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), position: old.length } as Task,
      ]);

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.tasks.all(projectId), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks.all(projectId) });
    },
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof taskApi.update>[1] }) =>
      taskApi.update(id, updates),
    onMutate: async ({ id, updates }) => {
      const task = qc.getQueryData<Task>(queryKeys.tasks.detail(id));
      if (!task) return;

      await qc.cancelQueries({ queryKey: queryKeys.tasks.all(task.projectId) });
      const previous = qc.getQueryData<Task[]>(queryKeys.tasks.all(task.projectId));

      qc.setQueryData<Task[]>(queryKeys.tasks.all(task.projectId), (old = []) =>
        old.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );

      return { previous, projectId: task.projectId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous && context?.projectId) {
        qc.setQueryData(queryKeys.tasks.all(context.projectId), context.previous);
      }
    },
    onSettled: (data) => {
      if (data) {
        qc.setQueryData(queryKeys.tasks.detail(data.id), data);
        qc.invalidateQueries({ queryKey: queryKeys.tasks.all(data.projectId) });
      }
    },
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: taskApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useAddComment = (taskId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => taskApi.addComment(taskId, content),
    onMutate: async (content) => {
      await qc.cancelQueries({ queryKey: queryKeys.tasks.detail(taskId) });
      const previous = qc.getQueryData(queryKeys.tasks.detail(taskId));

      qc.setQueryData<Task>(queryKeys.tasks.detail(taskId), (old) => {
        if (!old) return old;
        return {
          ...old,
          comments: [
            ...(old.comments || []),
            { id: `temp-${Date.now()}`, content, taskId, userId: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Comment,
          ],
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.tasks.detail(taskId), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
    },
  });
};
