import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notification.api';
import { queryKeys } from '../queryKeys';
import type { Notification } from '../types';

export const useNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications.all(),
    queryFn: ({ signal }) => notificationApi.getAll(signal),
    refetchInterval: 1000 * 30,
    refetchIntervalInBackground: false,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: ({ signal }) => notificationApi.getUnreadCount(signal),
    refetchInterval: 1000 * 30,
    refetchIntervalInBackground: false,
  });
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onMutate: async (notificationId: string) => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications.all() });
      const previous = qc.getQueryData(queryKeys.notifications.all());

      qc.setQueryData<Notification[]>(queryKeys.notifications.all(), (old = []) =>
        old.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.notifications.all(), context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all() });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });
};
