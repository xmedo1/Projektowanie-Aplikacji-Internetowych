import { createContext, useContext } from 'react';

export interface NotificationContextType {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
