'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi, getAuthToken, setAuthToken, removeAuthToken } from '@/lib/api';
import { toast } from 'sonner';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'customer' | 'admin';
  isBlocked: boolean;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const savedToken = getAuthToken();
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetchApi<{ user: User }>('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        setToken(savedToken);
      } else {
        removeAuthToken();
        setUser(null);
        setToken(null);
      }
    } catch {
      removeAuthToken();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
    toast.success('Signed out successfully.');
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedFields });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
