import { useEffect, useState, type ReactNode } from 'react';
import api from '../services/api';
import { isAxiosError } from 'axios';
import { AuthContext, type User } from './AuthContext';
import Notification from '../components/Notification';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

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

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser, showNotification }}>
      {children}
      <Notification message={notification} />
    </AuthContext.Provider>
  );
}
