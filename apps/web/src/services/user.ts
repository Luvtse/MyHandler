import { apiService } from '@/lib/api/client';

export interface UserSummary {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
}

export const UserService = {
  async getUsers(filters: UserFilters = {}) {
    const { success, data, error } = await apiService.request<{ data: UserSummary[]; total: number; page: number; limit: number }>({
      method: 'GET',
      url: '/users',
      params: filters,
    });
    if (!success || !data) throw new Error(error || 'Failed to load users');
    return data;
  },

  async deleteUser(id: string) {
    const { success, data, error } = await apiService.request<{ message: string }>({
      method: 'DELETE',
      url: `/users/${id}`,
    });
    if (!success) throw new Error(error || 'Failed to delete user');
    return data;
  },
};