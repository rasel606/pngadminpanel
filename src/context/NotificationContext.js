import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import io from 'socket.io-client';

export const NotificationContext = createContext();

export const useEnhancedNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://api.tiger55.online';
    const token = localStorage.getItem('token') || '';
    const newSocket = io(socketUrl, { 
      auth: { token },
      transports: ['websocket', 'polling']
    });
    
    newSocket.on('connect', () => {
      console.log('Notification socket connected');
      newSocket.emit('join', { role: 'admin' });
    });

    newSocket.on('admin_notification', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);
      setUnreadCount(prev => prev + 1);
      console.log('New admin notification:', notification);
    });

    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]);
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
      }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch(`/api/user/notification/${localStorage.getItem('userId')}/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    markAllAsRead,
    refetchNotifications: () => {
      fetch(`/api/user/notification/${localStorage.getItem('userId')}`)
        .then(res => res.json())
        .then(data => setNotifications(data));
    },
    // Stubs for EnhancedNotificationBell
    loading: false,
    syncing: false,
    workerStatus: 'disconnected',
    isOnline: navigator.onLine,
    markAsRead: async (id) => {
      console.log('Mark as read:', id);
      // Implement or use markAllAsRead
    },
    deleteNotification: async (id) => {
      console.log('Delete:', id);
    },
    syncNotifications: async () => {
      console.log('Syncing notifications');
    },
    workerInitialized: false
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
