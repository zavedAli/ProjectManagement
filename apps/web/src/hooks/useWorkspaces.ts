import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../api/workspace.api';
import { queryKeys } from '../queryKeys';

export const useWorkspaces = () => {
  return useQuery({
    queryKey: queryKeys.workspaces.all(),
    queryFn: ({ signal }) => workspaceApi.getAll(signal),
    staleTime: 1000 * 60 * 5,
  });
};

export const useWorkspace = (id: string) => {
  return useQuery({
    queryKey: queryKeys.workspaces.detail(id),
    queryFn: ({ signal }) => workspaceApi.getById(id, signal),
    enabled: !!id,
  });
};

export const useCreateWorkspace = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: workspaceApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workspaces.all() });
    },
  });
};

export const useUpdateWorkspace = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; description?: string } }) =>
      workspaceApi.update(id, updates),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.workspaces.detail(variables.id) });
      qc.invalidateQueries({ queryKey: queryKeys.workspaces.all() });
    },
  });
};
