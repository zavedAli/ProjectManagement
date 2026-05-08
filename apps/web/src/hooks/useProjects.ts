import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../api/project.api';
import { queryKeys } from '../queryKeys';
import type { Project } from '../types';

export const useProjects = (workspaceId: string, search?: string) => {
  return useQuery({
    queryKey: [...queryKeys.projects.all(workspaceId), search],
    queryFn: ({ signal }) => projectApi.getAll(workspaceId, signal, search),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: ({ signal }) => projectApi.getById(id, signal),
    enabled: !!id,
  });
};

export const usePrefetchProject = () => {
  const qc = useQueryClient();

  return (id: string) => {
    qc.prefetchQuery({
      queryKey: queryKeys.projects.detail(id),
      queryFn: () => projectApi.getById(id),
      staleTime: 1000 * 60,
    });
  };
};

export const useCreateProject = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: projectApi.create,
    onMutate: async (newProject) => {
      await qc.cancelQueries({ queryKey: queryKeys.projects.all(newProject.workspaceId) });
      const previous = qc.getQueryData<Project[]>(queryKeys.projects.all(newProject.workspaceId));

      qc.setQueryData<Project[]>(queryKeys.projects.all(newProject.workspaceId), (old = []) => [
        { ...newProject, id: `temp-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), archived: false } as Project,
        ...old,
      ]);

      return { previous, workspaceId: newProject.workspaceId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.projects.all(context.workspaceId), context.previous);
      }
    },
    onSettled: (_data, _error, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.projects.all(variables.workspaceId) });
    },
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; description?: string; archived?: boolean } }) =>
      projectApi.update(id, updates),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.projects.detail(data.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.projects.all(data.workspaceId) });
    },
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: projectApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
