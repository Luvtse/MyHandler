import { apiService, apiRequestData } from '@/lib/api/client';
import { User, UserRole } from '@/types/auth';

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  isVerified?: boolean;
  businessInfo?: {
    companyName: string;
    accountCode: string;
    taxId?: string;
    businessType?: string;
    industry?: string;
  };
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  secondaryRoles?: UserRole[];
  phone?: string;
  isVerified?: boolean;
  profilePicture?: string;
  businessInfo?: {
    companyName?: string;
    accountCode?: string;
    taxId?: string;
    businessType?: string;
    industry?: string;
  };
}

export interface UserFilters {
  role?: UserRole;
  isVerified?: boolean;
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  limit?: number;
}

export interface UserResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<UserRole, number>;
  newUsersThisMonth: number;
  verifiedUsers: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface UserActivityResponse {
  activities: UserActivity[];
  total: number;
}

const apiGet = async <T>(url: string): Promise<T> => apiRequestData<T>({ method: 'GET', url });

const apiPost = async <T>(url: string, body: any): Promise<T> => apiRequestData<T>({ method: 'POST', url, data: body });

const apiPatch = async <T>(url: string, body?: any): Promise<T> => apiRequestData<T>({ method: 'PATCH', url, data: body });

const apiDelete = async (url: string): Promise<void> => {
  const { success, error } = await apiService.request<unknown>({ method: 'DELETE', url });
  if (!success) throw new Error(error || 'Request failed');
};

class UserService {
  async getUsers(filters?: UserFilters): Promise<UserResponse> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.isVerified !== undefined) params.append('isVerified', String(filters.isVerified));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    return apiGet<UserResponse>(`/users?${params.toString()}`);
  }

  async getUserById(id: string): Promise<User> {
    return apiGet<User>(`/users/${id}`);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return apiPost<User>('/users', userData);
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    return apiPatch<User>(`/users/${id}`, userData);
  }

  async updateApproval(id: string, isApproved: boolean): Promise<User> {
    return apiPatch<User>(`/users/${id}/approval`, { isApproved });
  }

  async deleteUser(id: string): Promise<void> {
    await apiDelete(`/users/${id}`);
  }

  async getUserStats(): Promise<UserStats> {
    return apiGet<UserStats>('/users/stats');
  }

  async getUserActivities(userId?: string, page = 1, limit = 50): Promise<UserActivityResponse> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    params.append('page', String(page));
    params.append('limit', String(limit));

    return apiGet<UserActivityResponse>(`/users/activities?${params.toString()}`);
  }

  async toggleUserStatus(id: string): Promise<User> {
    return apiPatch<User>(`/users/${id}/toggle-status`);
  }

  async verifyUser(id: string): Promise<User> {
    return apiPatch<User>(`/users/${id}/verify`);
  }

  async assignRole(id: string, role: UserRole): Promise<User> {
    return apiPatch<User>(`/users/${id}/role`, { role });
  }

  async resetUserPassword(id: string): Promise<{ temporaryPassword: string }> {
    return apiPost<{ temporaryPassword: string }>(`/users/${id}/reset-password`, undefined);
  }

  async exportUsers(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const { success, data, error } = await apiService.request<Blob>({ method: 'GET', url: `/users/export?format=${format}`, responseType: 'blob' });
    if (!success || !data) throw new Error(error || 'Request failed');
    return data;
  }

  async bulkImportUsers(users: CreateUserRequest[]): Promise<{ success: number; failed: number; errors: string[] }> {
    return apiPost<{ success: number; failed: number; errors: string[] }>(`/users/bulk-import`, { users });
  }
}

export const userService = new UserService();
