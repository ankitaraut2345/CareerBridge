const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  canUsersChat,
  getOrCreateConversation,
  getConversationsForUser,
  getConversationById,
  getMessages,
} = require('../services/chatStore.service');
const { BadRequestError } = require('../utils/error');

/**
 * GET /api/chat/conversations
 * Returns all conversations for the authenticated user (sorted newest-first).
 */
router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const conversations = await getConversationsForUser(req.user.id);
    res.json({ success: true, data: conversations });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/chat/conversations
 * Open (or retrieve existing) conversation with another user.
 * Body: { otherUserId: string }
 */
router.post('/conversations', authenticate, async (req, res, next) => {
  try {
    const { otherUserId } = req.body;
    if (!otherUserId) throw new BadRequestError('otherUserId is required.');
    if (otherUserId === req.user.id) throw new BadRequestError('Cannot chat with yourself.');

    const conversation = await getOrCreateConversation(req.user.id, otherUserId);
    res.status(200).json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/chat/conversations/:id
 * Returns conversation metadata (participant check enforced).
 */
router.get('/conversations/:id', authenticate, async (req, res, next) => {
  try {
    const conversation = await getConversationById(req.params.id, req.user.id);
    res.json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/chat/conversations/:id/messages
 * Returns paginated messages for a conversation.
 * Query params: limit (default 50), before (ISO date cursor for older messages)
 */
router.get('/conversations/:id/messages', authenticate, async (req, res, next) => {
  try {
    // Verify participant access first
    await getConversationById(req.params.id, req.user.id);

    const limit = Math.min(parseInt(req.query.limit || '50', 10), 100);
    const before = req.query.before || null;
    const messages = await getMessages(req.params.id, { limit, before });
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/chat/can-chat/:otherUserId
 * Check if the current user can initiate a chat with another user.
 */
router.get('/can-chat/:otherUserId', authenticate, async (req, res, next) => {
  try {
    const { otherUserId } = req.params;
    if (otherUserId === req.user.id) {
      return res.json({ success: true, canChat: false, reason: 'Cannot chat with yourself.' });
    }
    const result = await canUsersChat(req.user.id, otherUserId);
    res.json({
      success: true,
      canChat: result.allowed,
      contextType: result.contextType || null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
