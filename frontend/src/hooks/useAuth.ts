import { useState, useCallback } from 'react';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  role: 'admin' | 'member' | 'trainer' | null;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    role: null,
  });

  const login = useCallback((email: string, _password: string, role: 'admin' | 'member' | 'trainer' = 'admin') => {
    // Mock login - in real app, this would call an API
    const mockUser: User = {
      id: '1',
      name: role === 'admin' ? 'Admin User' : role === 'trainer' ? 'Trainer User' : 'Member User',
      email,
      role,
      status: 'active',
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    setAuth({
      user: mockUser,
      role,
    });

    return { success: true, user: mockUser };
  }, []);

  const logout = useCallback(() => {
    setAuth({
      user: null,
      role: null,
    });
  }, []);

  const forgotPassword = useCallback(async (_email: string) => {
    // Mock forgot password
    return { success: true, message: 'Password reset link sent to your email' };
  }, []);

  return {
    ...auth,
    login,
    logout,
    forgotPassword,
  };
}
