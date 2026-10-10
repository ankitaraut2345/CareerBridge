const mongoose = require('mongoose');
const { Notification, NOTIFICATION_TYPES } = require('../models/Notification.model');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/error');

const isDbConnected = () => mongoose.connection.readyState === 1;

// ─── Socket.IO Reference ──────────────────────────────────────────────────────
let _io = null;

const setIo = (ioInstance) => {
  _io = ioInstance;
};

const getIo = () => _io;

// ─── In-Memory Fallback Store ─────────────────────────────────────────────────
let NOTIFICATIONS_SEED = [];
try {
  NOTIFICATIONS_SEED = require('../seed/seedData').NOTIFICATIONS_SEED;
} catch {}

const memoryNotifications = (NOTIFICATIONS_SEED && NOTIFICATIONS_SEED.length > 0)
  ? NOTIFICATIONS_SEED.map((n, idx) => ({
      _id: `notif_seed_${idx + 1}`,
      id: `notif_seed_${idx + 1}`,
      recipientId: n.recipientKey,
      type: n.type,
      title: n.title,
      message: n.message,
      relatedEntityType: n.relatedEntityType || null,
      relatedEntityId: null,
      actionUrl: n.actionUrl || null,
      isRead: !!n.isRead,
      createdAt: new Date(Date.now() - (n.daysAgo || 0) * 86400000),
      updatedAt: new Date(Date.now() - (n.daysAgo || 0) * 86400000),
    }))
  : [];
let _memNotifIdCounter = 1;
const mkNotifId = () => `notif_${Date.now()}_${_memNotifIdCounter++}`;

const sid = (id) => (id ? id.toString() : '');

/**
 * Normalise notification for API / client response
 */
const formatNotification = (n) => {
  if (!n) return null;
  const doc = n.toObject ? n.toObject() : { ...n };
  return {
    ...doc,
    _id: sid(doc._id || doc.id),
    id: sid(doc._id || doc.id),
    recipientId: sid(doc.recipientId),
    relatedEntityId: doc.relatedEntityId ? sid(doc.relatedEntityId) : null,
  };
};

/**
 * Create a single in-app notification
 */
const createNotification = async ({
  recipientId,
  type,
  title,
  message,
  relatedEntityType = null,
  relatedEntityId = null,
  actionUrl = null,
}) => {
  if (!recipientId) return null;
  const rId = sid(recipientId);

  if (!NOTIFICATION_TYPES[type]) {
    console.warn(`[Notification] Unknown notification type: ${type}`);
  }

  // Prevent duplicate notifications within 30 seconds for identical event
  const now = Date.now();
  if (isDbConnected()) {
    try {
      const existing = await Notification.findOne({
        recipientId: rId,
        type,
        relatedEntityId: relatedEntityId ? sid(relatedEntityId) : null,
        createdAt: { $gte: new Date(now - 30000) },
      });
      if (existing) {
        return formatNotification(existing);
      }
    } catch (e) {
      console.warn('[Notification] DB duplicate check error:', e.message);
    }
  } else {
    const existing = memoryNotifications.find(
      (n) =>
        sid(n.recipientId) === rId &&
        n.type === type &&
        sid(n.relatedEntityId) === sid(relatedEntityId) &&
        now - new Date(n.createdAt).getTime() < 30000
    );
    if (existing) {
      return formatNotification(existing);
    }
  }

  let createdDoc = null;

  if (isDbConnected()) {
    try {
      createdDoc = await Notification.create({
        recipientId: rId,
        type,
        title: title.trim(),
        message: message.trim(),
        relatedEntityType,
        relatedEntityId: relatedEntityId ? sid(relatedEntityId) : null,
        actionUrl: actionUrl || null,
        isRead: false,
      });
    } catch (err) {
      console.error('[Notification] Failed to create in DB, using memory:', err.message);
    }
  }

  if (!createdDoc) {
    createdDoc = {
      _id: mkNotifId(),
      recipientId: rId,
      type,
      title: title.trim(),
      message: message.trim(),
      relatedEntityType,
      relatedEntityId: relatedEntityId ? sid(relatedEntityId) : null,
      actionUrl: actionUrl || null,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryNotifications.unshift(createdDoc);
  }

  const formatted = formatNotification(createdDoc);

  // Emit real-time Socket.IO event to recipient's room
  if (_io) {
    try {
      _io.to(`user:${rId}`).emit('notification:new', formatted);
      const unreadCount = await getUnreadCountForUser(rId);
      _io.to(`user:${rId}`).emit('notification:unread_count', { count: unreadCount });
    } catch (err) {
      console.error('[Notification] Socket emit error:', err.message);
    }
  }

  return formatted;
};

/**
 * Bulk create notifications (e.g. for opportunity announcements)
 */
const createBulkNotifications = async (notificationsList = []) => {
  if (!Array.isArray(notificationsList) || notificationsList.length === 0) return [];
  const results = [];
  for (const item of notificationsList) {
    try {
      const res = await createNotification(item);
      if (res) results.push(res);
    } catch (err) {
      console.error('[Notification] Bulk create item error:', err.message);
    }
  }
  return results;
};

/**
 * Get paginated notifications for an authenticated user
 */
const getNotificationsForUser = async (userId, { page = 1, limit = 20, isRead } = {}) => {
  const rId = sid(userId);
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  if (isDbConnected()) {
    const query = { recipientId: rId };
    if (isRead !== undefined && isRead !== null && isRead !== '') {
      query.isRead = isRead === 'true' || isRead === true;
    }

    const [total, docs] = await Promise.all([
      Notification.countDocuments(query),
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .lean(),
    ]);

    return {
      notifications: docs.map(formatNotification),
      pagination: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l) || 1,
      },
    };
  }

  // Memory fallback
  let list = memoryNotifications.filter((n) => sid(n.recipientId) === rId);
  if (isRead !== undefined && isRead !== null && isRead !== '') {
    const boolRead = isRead === 'true' || isRead === true;
    list = list.filter((n) => n.isRead === boolRead);
  }

  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = list.length;
  const paged = list.slice(skip, skip + l).map(formatNotification);

  return {
    notifications: paged,
    pagination: {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
};

/**
 * Get count of unread notifications for a user
 */
const getUnreadCountForUser = async (userId) => {
  const rId = sid(userId);
  if (isDbConnected()) {
    try {
      return await Notification.countDocuments({ recipientId: rId, isRead: false });
    } catch (e) {
      console.warn('[Notification] Count error in DB, fallback memory:', e.message);
    }
  }
  return memoryNotifications.filter((n) => sid(n.recipientId) === rId && !n.isRead).length;
};

/**
 * Mark a single notification as read (with strict ownership check)
 */
const markAsRead = async (notificationId, userId) => {
  const nId = sid(notificationId);
  const rId = sid(userId);

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(nId)) {
    const doc = await Notification.findById(nId);
    if (!doc) throw new NotFoundError('Notification not found.');
    if (sid(doc.recipientId) !== rId) {
      throw new ForbiddenError('You can only modify your own notifications.');
    }
    doc.isRead = true;
    await doc.save();

    const formatted = formatNotification(doc);
    if (_io) {
      const count = await getUnreadCountForUser(rId);
      _io.to(`user:${rId}`).emit('notification:unread_count', { count });
    }
    return formatted;
  }

  const mem = memoryNotifications.find((n) => sid(n._id || n.id) === nId);
  if (!mem) throw new NotFoundError('Notification not found.');
  if (sid(mem.recipientId) !== rId) {
    throw new ForbiddenError('You can only modify your own notifications.');
  }
  mem.isRead = true;
  mem.updatedAt = new Date();

  if (_io) {
    const count = await getUnreadCountForUser(rId);
    _io.to(`user:${rId}`).emit('notification:unread_count', { count });
  }

  return formatNotification(mem);
};

/**
 * Mark a single notification as unread (with strict ownership check)
 */
const markAsUnread = async (notificationId, userId) => {
  const nId = sid(notificationId);
  const rId = sid(userId);

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(nId)) {
    const doc = await Notification.findById(nId);
    if (!doc) throw new NotFoundError('Notification not found.');
    if (sid(doc.recipientId) !== rId) {
      throw new ForbiddenError('You can only modify your own notifications.');
    }
    doc.isRead = false;
    await doc.save();

    const formatted = formatNotification(doc);
    if (_io) {
      const count = await getUnreadCountForUser(rId);
      _io.to(`user:${rId}`).emit('notification:unread_count', { count });
    }
    return formatted;
  }

  const mem = memoryNotifications.find((n) => sid(n._id || n.id) === nId);
  if (!mem) throw new NotFoundError('Notification not found.');
  if (sid(mem.recipientId) !== rId) {
    throw new ForbiddenError('You can only modify your own notifications.');
  }
  mem.isRead = false;
  mem.updatedAt = new Date();

  if (_io) {
    const count = await getUnreadCountForUser(rId);
    _io.to(`user:${rId}`).emit('notification:unread_count', { count });
  }

  return formatNotification(mem);
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  const rId = sid(userId);

  if (isDbConnected()) {
    await Notification.updateMany({ recipientId: rId, isRead: false }, { $set: { isRead: true } });
  }

  memoryNotifications.forEach((n) => {
    if (sid(n.recipientId) === rId) {
      n.isRead = true;
      n.updatedAt = new Date();
    }
  });

  if (_io) {
    _io.to(`user:${rId}`).emit('notification:unread_count', { count: 0 });
  }

  return { success: true };
};

/**
 * Delete a notification (with strict ownership check)
 */
const deleteNotification = async (notificationId, userId) => {
  const nId = sid(notificationId);
  const rId = sid(userId);

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(nId)) {
    const doc = await Notification.findById(nId);
    if (!doc) throw new NotFoundError('Notification not found.');
    if (sid(doc.recipientId) !== rId) {
      throw new ForbiddenError('You can only delete your own notifications.');
    }
    await Notification.findByIdAndDelete(nId);

    if (_io) {
      const count = await getUnreadCountForUser(rId);
      _io.to(`user:${rId}`).emit('notification:unread_count', { count });
    }
    return { success: true };
  }

  const idx = memoryNotifications.findIndex((n) => sid(n._id || n.id) === nId);
  if (idx === -1) throw new NotFoundError('Notification not found.');
  if (sid(memoryNotifications[idx].recipientId) !== rId) {
    throw new ForbiddenError('You can only delete your own notifications.');
  }
  memoryNotifications.splice(idx, 1);

  if (_io) {
    const count = await getUnreadCountForUser(rId);
    _io.to(`user:${rId}`).emit('notification:unread_count', { count });
  }

  return { success: true };
};

module.exports = {
  setIo,
  getIo,
  NOTIFICATION_TYPES,
  createNotification,
  createBulkNotifications,
  getNotificationsForUser,
  getUnreadCountForUser,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  deleteNotification,
  memoryNotifications,
};
