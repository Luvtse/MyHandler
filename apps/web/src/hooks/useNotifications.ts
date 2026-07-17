import { useQuery, useMutation } from '@tanstack/react-query';
import { apiService, apiRequestData } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Hooks
export const useNotifications = (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}) => {
  return useQuery<Notification[]>({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const { success, data } = await apiService.request<{ data: Notification[] }>({ method: 'GET', url: '/notifications', params });
      return (success && (data as any)?.data) || [];
    },
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery<number>({
    queryKey: ['unreadNotificationCount'],
    queryFn: async () => {
      const { success, data } = await apiService.request<{ data: number }>({ method: 'GET', url: '/notifications/unread-count' });
      return (success && (data as any)?.data) || 0;
    },
  });
};

export const useMarkNotificationAsRead = () => {
  return useMutation<{ success: boolean }, { message: string }, { id: string }>({
    mutationFn: async ({ id }) => {
      const { success, data, error } = await apiService.request<{ success: boolean }>({ method: 'PATCH', url: `/notifications/${id}/read` });
      if (!success) throw { message: error || 'Failed to mark notification as read' };
      return data as any;
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  return useMutation<{ success: boolean }, { message: string }, void>({
    mutationFn: async () => {
      const { success, data, error } = await apiService.request<{ success: boolean }>({ method: 'PATCH', url: '/notifications/mark-all-read' });
      if (!success) throw { message: error || 'Failed to mark all notifications as read' };
      return data as any;
    },
  });
};

export const useDeleteNotification = () => {
  return useMutation<{ success: boolean }, { message: string }, { id: string }>({
    mutationFn: async ({ id }) => {
      const { success, data, error } = await apiService.request<{ success: boolean }>({ method: 'DELETE', url: `/notifications/${id}` });
      if (!success) throw { message: error || 'Failed to delete notification' };
      return data as any;
    },
  });
};