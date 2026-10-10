const express = require('express');
const router = express.Router();
const {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAsReadHandler,
  markAsUnreadHandler,
  markAllAsReadHandler,
  deleteNotificationHandler,
} = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Protect all notification routes
router.use(authenticate);

// 1. Fetch notifications & unread count
router.get('/', getNotificationsHandler);
router.get('/unread-count', getUnreadCountHandler);

// 2. Read states
router.patch('/read-all', markAllAsReadHandler);
router.patch('/:id/read', markAsReadHandler);
router.patch('/:id/unread', markAsUnreadHandler);

// 3. Delete notification
router.delete('/:id', deleteNotificationHandler);

module.exports = router;
