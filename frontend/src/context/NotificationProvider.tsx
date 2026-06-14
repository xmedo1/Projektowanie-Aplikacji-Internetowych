import { useState, type ReactNode } from 'react';
import { NotificationContext } from './NotificationContext';
import Notification from '../components/Notification';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && <Notification message={notification.message} type={notification.type} />}
    </NotificationContext.Provider>
  );
}
