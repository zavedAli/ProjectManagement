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
  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      authApi.register(email, password, name),
  });
};

export const useVerifyOTP = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => authApi.verifyOTP(email, otp),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      qc.setQueryData(queryKeys.auth.me(), data.user);
      navigate('/');
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.resendOTP(email),
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

export const useGithubOAuth = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (code: string) => authApi.githubOAuth(code),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      qc.setQueryData(queryKeys.auth.me(), data.user);
      navigate('/');
    },
  });
};

export const useGoogleOAuth = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (token: string) => authApi.googleOAuth(token),
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      qc.setQueryData(queryKeys.auth.me(), data.user);
      navigate('/');
    },
  });
};
