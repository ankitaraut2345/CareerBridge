const asyncHandler = require('express-async-handler');
const {
  getNotificationsForUser,
  getUnreadCountForUser,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
} = require('../services/notificationStore.service');

/**
 * GET /api/notifications
 * Returns paginated notifications for the authenticated user
 */
const getNotificationsHandler = asyncHandler(async (req, res) => {
  const { page, limit, isRead } = req.query;
  const result = await getNotificationsForUser(req.user.id, { page, limit, isRead });

  res.status(200).json({
    success: true,
    data: result.notifications,
    pagination: result.pagination,
  });
});

/**
 * GET /api/notifications/unread-count
 * Returns the unread notification count
 */
const getUnreadCountHandler = asyncHandler(async (req, res) => {
  const count = await getUnreadCountForUser(req.user.id);

  res.status(200).json({
    success: true,
    count,
  });
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
const markAsReadHandler = asyncHandler(async (req, res) => {
  const updated = await markAsRead(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    data: updated,
  });
});

/**
 * PATCH /api/notifications/:id/unread
 * Mark a single notification as unread
 */
const markAsUnreadHandler = asyncHandler(async (req, res) => {
  const updated = await markAsUnread(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    data: updated,
  });
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for current user
 */
const markAllAsReadHandler = asyncHandler(async (req, res) => {
  await markAllAsRead(req.user.id);

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read.',
  });
});

/**
 * DELETE /api/notifications/:id
 * Delete a single notification
 */
const deleteNotificationHandler = asyncHandler(async (req, res) => {
  await deleteNotification(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Notification deleted.',
  });
});

module.exports = {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAsReadHandler,
  markAsUnreadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
};
