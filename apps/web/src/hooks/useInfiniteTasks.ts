import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/task.api';
import { queryKeys } from '../queryKeys';
import type { Task } from '../types';

export const useInfiniteTasks = (projectId: string, search?: string) => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.tasks.all(projectId), 'infinite', search],
    queryFn: ({ pageParam = 0, signal }) => taskApi.getAllPaginated(projectId, pageParam, 20, signal, search),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length * 20 : undefined;
    },
    initialPageParam: 0,
    enabled: !!projectId,
    staleTime: 1000 * 30,
  });
};

export const useTaskMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof taskApi.update>[1] }) =>
      taskApi.update(id, updates),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.tasks.detail(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.tasks.all(data.projectId) });
    },
  });
};
