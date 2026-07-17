import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api/client';

export interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
) {
  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await apiFunction(...args);
        setData(result);

        if (showSuccessToast && successMessage) {
          toast.success(successMessage);
        }

        onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError: ApiError = {
          message:
            err instanceof Error
              ? err.message
              : 'An unexpected error occurred',
        };
        setError(apiError);

        if (showErrorToast) {
          toast.error(apiError.message);
        }

        onError?.(apiError);
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction, onSuccess, onError, showSuccessToast, showErrorToast, successMessage]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}

// Example usage:
/*
const {
  data: user,
  isLoading,
  error,
  execute: login
} = useApi(AuthService.login, {
  onSuccess: (data) => {
    // Handle successful login
  },
  showSuccessToast: true,
  successMessage: 'Successfully logged in!'
});

// In component:
const handleLogin = async (credentials: LoginDTO) => {
  try {
    await login(credentials);
    navigate('/dashboard');
  } catch (error) {
    // Error is already handled by useApi
  }
};
*/