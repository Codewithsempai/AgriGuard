import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (email: string, name: string, pass: string) => Promise<User>;
  logout: () => void;
  updateUser: (data: { name?: string; language?: string }) => Promise<User>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('agriguard_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('agriguard_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.getMe()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('agriguard_user', JSON.stringify(userData));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string): Promise<User> => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', pass);
    const res = await api.login(formData);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('agriguard_token', res.access_token);
    localStorage.setItem('agriguard_user', JSON.stringify(res.user));
    return res.user;
  };

  const register = async (email: string, name: string, pass: string): Promise<User> => {
    const newUser = await api.register({ email, name, password: pass });
    // After registration, log them in automatically
    await login(email, pass);
    return newUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('agriguard_token');
    localStorage.removeItem('agriguard_user');
  };

  const updateUser = async (data: { name?: string; language?: string }): Promise<User> => {
    const updated = await api.updateMe(data);
    setUser(updated);
    localStorage.setItem('agriguard_user', JSON.stringify(updated));
    return updated;
  };

  const refreshUser = async () => {
    if (token) {
      const u = await api.getMe();
      setUser(u);
      localStorage.setItem('agriguard_user', JSON.stringify(u));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
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
