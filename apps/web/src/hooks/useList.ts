import { useState, useCallback, useEffect } from 'react';
import { useApi } from './useApi';

export interface ListFilters {
  search?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface UseListOptions {
  initialFilters?: ListFilters;
  defaultLimit?: number;
  autoLoad?: boolean;
  debounceMs?: number;
}

export function useList<T>(
  fetchFunction: (filters: ListFilters) => Promise<ListResponse<T>>,
  options: UseListOptions = {}
) {
  const {
    initialFilters = {},
    defaultLimit = 10,
    autoLoad = true,
    debounceMs = 300
  } = options;

  const [filters, setFilters] = useState<ListFilters>({
    page: 1,
    limit: defaultLimit,
    ...initialFilters
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const {
    data: response,
    isLoading,
    error,
    execute: fetchData
  } = useApi<ListResponse<T>>(fetchFunction);

  // Debounce filter changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [filters, debounceMs]);

  // Fetch data when filters change
  useEffect(() => {
    if (autoLoad) {
      fetchData(debouncedFilters);
    }
  }, [debouncedFilters, autoLoad, fetchData]);

  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({
      ...prev,
      search,
      page: 1 // Reset to first page when search changes
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setFilters(prev => ({
      ...prev,
      limit,
      page: 1 // Reset to first page when limit changes
    }));
  }, []);

  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when any filter changes
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: defaultLimit,
      ...initialFilters
    });
  }, [defaultLimit, initialFilters]);

  const refresh = useCallback(() => {
    fetchData(filters);
  }, [fetchData, filters]);

  return {
    // Data
    items: response?.data ?? [],
    total: response?.total ?? 0,
    isLoading,
    error,

    // Pagination
    page: filters.page ?? 1,
    limit: filters.limit ?? defaultLimit,
    totalPages: Math.ceil((response?.total ?? 0) / (filters.limit ?? defaultLimit)),

    // Filters
    filters,
    search: filters.search ?? '',

    // Actions
    setSearch,
    setPage,
    setLimit,
    setFilter,
    resetFilters,
    refresh
  };
}

// Example usage:
/*
const {
  items: users,
  total,
  isLoading,
  page,
  limit,
  totalPages,
  search,
  setSearch,
  setPage,
  setLimit,
  setFilter,
  resetFilters,
  refresh
} = useList(UserService.getUsers, {
  initialFilters: {
    role: 'customer',
    isActive: true
  },
  defaultLimit: 20
});

// In component:
<Input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search users..."
/>

<Select
  value={filters.role}
  onChange={(e) => setFilter('role', e.target.value)}
>
  <option value="">All roles</option>
  <option value="customer">Customer</option>
  <option value="admin">Admin</option>
</Select>

{users.map(user => (
  <UserCard key={user.id} user={user} />
))}

<Pagination
  page={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
*/