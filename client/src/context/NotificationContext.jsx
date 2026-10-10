import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getSocket } from '../services/socketService';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  deleteNotification as apiDeleteNotification,
} from '../services/notificationService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch unread count from server
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.warn('[Notification] Error fetching unread count:', err.message);
    }
  }, [isAuthenticated]);

  // Fetch latest preview list for dropdown
  const refreshRecentNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setRecentNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getNotifications({ page: 1, limit: 10 });
      setRecentNotifications(res.data || []);
      if (res.pagination?.total !== undefined) {
        // Also refresh unread count if needed
        const count = await getUnreadCount();
        setUnreadCount(count);
      }
    } catch (err) {
      console.warn('[Notification] Error fetching recent notifications:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initial load on authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshUnreadCount();
      refreshRecentNotifications();
    } else {
      setUnreadCount(0);
      setRecentNotifications([]);
    }
  }, [isAuthenticated, user, refreshUnreadCount, refreshRecentNotifications]);

  // Real-time Socket.IO listener for live notification alerts
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('careerbridge_token');
    if (!token) return;

    const socket = getSocket(token);

    const handleNewNotification = (notif) => {
      // Add to list and avoid duplicates
      setRecentNotifications((prev) => {
        if (prev.some((n) => (n._id || n.id) === (notif._id || notif.id))) return prev;
        return [notif, ...prev.slice(0, 9)];
      });
      // Increment unread count
      setUnreadCount((c) => c + 1);
    };

    const handleUnreadCountUpdate = ({ count }) => {
      if (typeof count === 'number') {
        setUnreadCount(count);
      }
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:unread_count', handleUnreadCountUpdate);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:unread_count', handleUnreadCountUpdate);
    };
  }, [isAuthenticated]);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setRecentNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('[Notification] Error marking notification as read:', err.message);
    }
  };

  // Mark single notification as unread
  const markAsUnread = async (id) => {
    try {
      await markNotificationAsUnread(id);
      setRecentNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === id ? { ...n, isRead: false } : n))
      );
      setUnreadCount((c) => c + 1);
    } catch (err) {
      console.error('[Notification] Error marking notification as unread:', err.message);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[Notification] Error marking all as read:', err.message);
    }
  };

  // Delete notification
  const removeNotification = async (id) => {
    try {
      await apiDeleteNotification(id);
      setRecentNotifications((prev) => {
        const item = prev.find((n) => (n._id || n.id) === id);
        if (item && !item.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => (n._id || n.id) !== id);
      });
    } catch (err) {
      console.error('[Notification] Error deleting notification:', err.message);
    }
  };

  const value = {
    unreadCount,
    recentNotifications,
    loading,
    refreshUnreadCount,
    refreshRecentNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      unreadCount: 0,
      recentNotifications: [],
      loading: false,
      refreshUnreadCount: () => {},
      refreshRecentNotifications: () => {},
      markAsRead: () => {},
      markAsUnread: () => {},
      markAllAsRead: () => {},
      removeNotification: () => {},
    };
  }
  return context;
};

export default NotificationContext;
