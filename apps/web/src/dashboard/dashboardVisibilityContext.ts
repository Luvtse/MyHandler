import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '@/lib/api/client';

export interface VisibilitySettings {
  [role: string]: {
    [featureKey: string]: boolean;
  };
}

interface DashboardVisibilityState {
  visibility: VisibilitySettings | null;
  isLoading: boolean;
  fetchVisibility: (force?: boolean) => Promise<void>;
  isInitialized: boolean;
}

const DashboardVisibilityContext = createContext<DashboardVisibilityState | undefined>(undefined);

export const DashboardVisibilityProvider = ({ children }: { children: React.ReactNode }) => {
  const [visibility, setVisibility] = useState<VisibilitySettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const fetchVisibility = async (force = false) => {
    // Don't fetch if already loaded unless forced
    if (isInitialized && !force) return;

    try {
      setIsLoading(true);
      const { success, data } = await apiService.request<{ settings?: VisibilitySettings }>({
        method: 'GET',
        url: '/admin/dashboard-visibility',
      });
      setVisibility((success && data && (data.settings || {})) || {});
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to fetch dashboard visibility:', error);
      setVisibility({}); // Set empty object as fallback
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    visibility,
    isLoading,
    fetchVisibility,
    isInitialized,
  };

  return React.createElement(
    DashboardVisibilityContext.Provider,
    { value },
    children
  );
};

export const useDashboardVisibility = (): DashboardVisibilityState => {
  const ctx = useContext(DashboardVisibilityContext);
  if (!ctx) {
    throw new Error('useDashboardVisibility must be used within a DashboardVisibilityProvider');
  }
  return ctx;
};

// Create a hook that lazy loads visibility when needed
export const useLazyDashboardVisibility = () => {
  const { visibility, isLoading, fetchVisibility, isInitialized } = useDashboardVisibility();
  
  useEffect(() => {
    if (!isInitialized) {
      fetchVisibility();
    }
  }, [isInitialized, fetchVisibility]);
  
  return { visibility, isLoading };
};