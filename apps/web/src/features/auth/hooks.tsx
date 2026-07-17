// src/features/auth/hooks.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import { User, UserRole, Permission, ROLE_PERMISSIONS } from '@/types/auth';
import { AuthService, RegisterDTO } from '@/features/auth/lib/service'; // ← Import RegisterDTO
import React, { createContext, useContext, ReactNode, useEffect } from 'react';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>; // ← Fix: add proper type
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  isRole: (role: UserRole) => boolean;
  resetError: () => void;
  updateUser: (userData: Partial<User>) => void;
  setUser: (user: User | null) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { accessToken, refreshToken } = await AuthService.login({ email, password });
          const profile = await AuthService.getProfile();
          set({ user: profile });
          toast.success('Welcome back!');
        } catch (error: any) {
          const errorMessage = typeof error === 'string' ? error : 'An error occurred during authentication';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      
      register: async (data: RegisterDTO) => { // ← Fix: name the parameter + type it
        set({ isLoading: true, error: null });
        try {
          const { accessToken, refreshToken } = await AuthService.register(data); // ← Fix: use 'data'
          const profile = await AuthService.getProfile();
          set({ user: profile });
          toast.success('Account created successfully!');
        } catch (error: any) {
          const errorMessage = typeof error === 'string' ? error : 'An error occurred during registration';
          set({ error: errorMessage });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await AuthService.logout();
          set({ user: null, error: null });
          toast.success('Logged out successfully');
        } catch (error: any) {
          const errorMessage = typeof error === 'string' ? error : 'An error occurred during logout';
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },
      
      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        if (ROLE_PERMISSIONS[user.role].includes(permission)) return true;
        if (user.secondaryRoles && user.secondaryRoles.length > 0) {
          return user.secondaryRoles.some(role => ROLE_PERMISSIONS[role].includes(permission));
        }
        return false;
      },
      
      isRole: (role) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === role) return true;
        if (user.secondaryRoles && user.secondaryRoles.includes(role)) return true;
        return false;
      },

      resetError: () => set({ error: null }),

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface AuthContextType extends AuthStore {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthStore();

  useEffect(() => {
    return () => {
      auth.resetError();
    };
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};