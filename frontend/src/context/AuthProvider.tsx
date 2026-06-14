import { useEffect, useState, type ReactNode } from 'react';
import api from '../services/api';
import { isAxiosError } from 'axios';
import { AuthContext, type User } from './AuthContext';
import { useNotification } from './NotificationContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    showNotification('Wylogowano pomyślnie');
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await refreshUser();
    };
    initializeAuth();
  }, []);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
