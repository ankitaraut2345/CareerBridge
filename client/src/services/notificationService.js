import api from './api';

/**
 * In-App Notification REST Service for CareerBridge Phase 11
 */

/**
 * Get paginated notifications for current authenticated user
 */
export const getNotifications = async ({ page = 1, limit = 20, isRead } = {}) => {
  const params = { page, limit };
  if (isRead !== undefined && isRead !== null && isRead !== '') {
    params.isRead = isRead;
  }
  const res = await api.get('/notifications', { params });
  return res.data;
};

/**
 * Get count of unread notifications
 */
export const getUnreadCount = async () => {
  const res = await api.get('/notifications/unread-count');
  return res.count ?? 0;
};

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
};

/**
 * Mark a single notification as unread
 */
export const markNotificationAsUnread = async (id) => {
  const res = await api.patch(`/notifications/${id}/unread`);
  return res.data;
};

/**
 * Mark all notifications as read for current user
 */
export const markAllNotificationsAsRead = async () => {
  const res = await api.patch('/notifications/read-all');
  return res;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (id) => {
  const res = await api.delete(`/notifications/${id}`);
  return res;
};

/**
 * Relative time formatter for human-readable timestamps
 */
export const formatTimeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const past = new Date(date);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 45) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;

  return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
