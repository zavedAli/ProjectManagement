import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { queryKeys } from '../queryKeys';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: ({ signal }) => authApi.getMe(signal),
    enabled: !!localStorage.getItem('accessToken'),
    retry: false,
  });
};

export const useLogin = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      qc.setQueryData(queryKeys.auth.me(), data.user);
      navigate('/');
    },
  });
};

export const useRegister = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      authApi.register(email, password, name),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      qc.setQueryData(queryKeys.auth.me(), data.user);
      navigate('/');
    },
  });
};

export const useLogout = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      qc.clear();
      navigate('/login');
    },
  });
};

export const useUpdateAvatar = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (avatarUrl: string) => authApi.updateAvatar(avatarUrl),
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.auth.me(), user);
    },
  });
};
