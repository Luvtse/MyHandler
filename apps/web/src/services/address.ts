import { apiService } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export interface Address {
  id: string;
  line1?: string;
  city?: string;
  country?: string;
}

export interface CreateAddressDTO {
  line1: string;
  city: string;
  country: string;
}

export interface UpdateAddressDTO {
  line1?: string;
  city?: string;
  country?: string;
}

export interface AddressFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export const AddressService = {
  async list(filters: AddressFilters = {}) {
    const { success, data, error } = await apiService.request<{ data: Address[]; total: number; page: number; limit: number }>({
      method: 'GET',
      url: API_ENDPOINTS.addresses.list,
      params: filters,
    });
    if (!success || !data) throw new Error(error || 'Failed to load addresses');
    return data;
  },
};