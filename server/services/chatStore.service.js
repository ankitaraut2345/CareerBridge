const mongoose = require('mongoose');
const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const Mentorship = require('../models/Mentorship.model');
const ReferralRequest = require('../models/ReferralRequest.model');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/error');
const { findUserById } = require('./userStore.service');

const isDbConnected = () => mongoose.connection.readyState === 1;

let CONVERSATIONS_SEED = [];
try {
  CONVERSATIONS_SEED = require('../seed/seedData').CONVERSATIONS_SEED;
} catch {}

const memConversations = [];
const memMessages = [];
let _memConvIdCounter = 1;
let _memMsgIdCounter = 1;

if (CONVERSATIONS_SEED && CONVERSATIONS_SEED.length > 0) {
  CONVERSATIONS_SEED.forEach((c) => {
    const convId = `mem_conv_${_memConvIdCounter++}`;
    let lastMsgText = '';
    let lastMsgDate = new Date();

    (c.messages || []).forEach((m) => {
      const msgDate = new Date(Date.now() - (m.minutesAgo || 0) * 60000);
      memMessages.push({
        _id: `mem_msg_${_memMsgIdCounter++}`,
        conversationId: convId,
        senderId: m.senderKey,
        body: m.body,
        createdAt: msgDate,
        updatedAt: msgDate,
      });
      lastMsgText = m.body;
      lastMsgDate = msgDate;
    });

    memConversations.push({
      _id: convId,
      id: convId,
      participants: c.participantKeys,
      contextType: c.contextType,
      contextId: null,
      lastMessage: lastMsgText,
      lastMessageAt: lastMsgDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });
}

const mkConvId = () => `mem_conv_${_memConvIdCounter++}`;
const mkMsgId = () => `mem_msg_${_memMsgIdCounter++}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalise an id to string for comparison
 */
const sid = (id) => (id ? id.toString() : '');

/**
 * Enrich conversation with details of the other participant
 */
const enrichConversation = async (conv, myUserId) => {
  if (!conv) return null;
  const c = conv.toObject ? conv.toObject() : { ...conv };
  const participants = (c.participants || []).map(sid);
  const myIdStr = sid(myUserId);
  const otherId = participants.find((p) => p !== myIdStr) || participants[0];

  let otherName = 'User';
  let otherRole = '';
  if (otherId) {
    try {
      const u = await findUserById(otherId);
      if (u) {
        otherName = u.name || 'User';
        otherRole = u.role || '';
      }
    } catch {}
  }

  return {
    ...c,
    _id: c._id ? c._id.toString() : c.id,
    otherParticipant: {
      id: otherId,
      name: otherName,
      role: otherRole,
    },
  };
};

/**
 * Check whether two users share an active Mentorship or accepted ReferralRequest.
 * Returns { allowed: boolean, contextType, contextId }
 */
const canUsersChat = async (userAId, userBId) => {
  const a = sid(userAId);
  const b = sid(userBId);

  if (isDbConnected()) {
    // Check active mentorship
    const mentorship = await Mentorship.findOne({
      $or: [
        { studentId: a, alumniId: b },
        { studentId: b, alumniId: a },
      ],
      status: { $in: ['ACCEPTED', 'COMPLETED'] },
    });
    if (mentorship) {
      return {
        allowed: true,
        contextType: 'MENTORSHIP',
        contextId: mentorship._id,
      };
    }

    // Check accepted referral request
    const referral = await ReferralRequest.findOne({
      $or: [
        { studentId: a, alumniId: b },
        { studentId: b, alumniId: a },
      ],
      status: { $in: ['ACCEPTED', 'REFERRED', 'COMPLETED'] },
    });
    if (referral) {
      return {
        allowed: true,
        contextType: 'REFERRAL',
        contextId: referral._id,
      };
    }

    return { allowed: false };
  }

  // Memory fallback — always allow in offline mode (demo purposes)
  return { allowed: true, contextType: 'MENTORSHIP', contextId: null };
};

// ─── Conversation CRUD ────────────────────────────────────────────────────────

/**
 * Get or create a conversation between two users.
 * Enforces uniqueness so duplicates are never created.
 */
const getOrCreateConversation = async (userAId, userBId) => {
  const a = sid(userAId);
  const b = sid(userBId);

  if (isDbConnected()) {
    // Find existing conversation that contains BOTH participants
    let conv = await Conversation.findOne({
      participants: { $all: [a, b], $size: 2 },
    });
    if (conv) return conv;

    // Check relationship before creating
    const { allowed, contextType, contextId } = await canUsersChat(a, b);
    if (!allowed) {
      throw new ForbiddenError(
        'You can only chat with someone you have an active Mentorship or Referral relationship with.'
      );
    }

    conv = await Conversation.create({
      participants: [a, b],
      contextType,
      contextId,
    });
    return enrichConversation(conv, a);
  }

  // Memory fallback
  let conv = memConversations.find(
    (c) =>
      c.participants.includes(a) && c.participants.includes(b) && c.participants.length === 2
  );
  if (conv) return enrichConversation(conv, a);

  conv = {
    _id: mkConvId(),
    participants: [a, b],
    contextType: 'MENTORSHIP',
    contextId: null,
    lastMessage: '',
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memConversations.push(conv);
  return enrichConversation(conv, a);
};

/**
 * Get all conversations for a user (sorted by most recent message).
 */
const getConversationsForUser = async (userId) => {
  const u = sid(userId);
  let list = [];

  if (isDbConnected()) {
    list = await Conversation.find({ participants: u }).sort({ lastMessageAt: -1 }).lean();
  } else {
    list = memConversations
      .filter((c) => c.participants.map(sid).includes(u))
      .sort((a, b) => {
        const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return tb - ta;
      });
  }

  return Promise.all(list.map((c) => enrichConversation(c, u)));
};

/**
 * Get a single conversation by id, verifying the requesting user is a participant.
 */
const getConversationById = async (conversationId, requestingUserId) => {
  const u = sid(requestingUserId);
  let conv = null;

  if (isDbConnected()) {
    conv = await Conversation.findById(conversationId);
    if (!conv) throw new NotFoundError('Conversation not found.');
    if (!conv.participants.map(sid).includes(u)) {
      throw new ForbiddenError('You are not a participant in this conversation.');
    }
  } else {
    conv = memConversations.find((c) => sid(c._id) === sid(conversationId));
    if (!conv) throw new NotFoundError('Conversation not found.');
    if (!conv.participants.map(sid).includes(u)) {
      throw new ForbiddenError('You are not a participant in this conversation.');
    }
  }

  return enrichConversation(conv, u);
};

// ─── Message CRUD ─────────────────────────────────────────────────────────────

/**
 * Retrieve paginated messages for a conversation (oldest-first, page from cursor).
 */
const getMessages = async (conversationId, { limit = 50, before } = {}) => {
  const convId = sid(conversationId);

  if (isDbConnected()) {
    const query = { conversationId: convId };
    if (before) query.createdAt = { $lt: new Date(before) };
    return Message.find(query).sort({ createdAt: -1 }).limit(limit).then((msgs) => msgs.reverse());
  }

  let msgs = memMessages.filter((m) => sid(m.conversationId) === convId);
  if (before) {
    const cutoff = new Date(before).getTime();
    msgs = msgs.filter((m) => new Date(m.createdAt).getTime() < cutoff);
  }
  return msgs
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-limit);
};

/**
 * Persist a new message and update the conversation's lastMessage snapshot.
 */
const saveMessage = async (conversationId, senderId, body) => {
  const convId = sid(conversationId);
  const sId = sid(senderId);

  if (!body || !body.trim()) {
    throw new BadRequestError('Message body cannot be empty.');
  }

  const trimmed = body.trim();
  if (trimmed.length > 2000) {
    throw new BadRequestError('Message cannot exceed 2000 characters.');
  }

  if (isDbConnected()) {
    const msg = await Message.create({ conversationId: convId, senderId: sId, body: trimmed });
    // Update the conversation snapshot
    await Conversation.findByIdAndUpdate(convId, {
      lastMessage: trimmed.length > 80 ? trimmed.slice(0, 80) + '…' : trimmed,
      lastMessageAt: msg.createdAt,
    });
    return msg;
  }

  const msg = {
    _id: mkMsgId(),
    conversationId: convId,
    senderId: sId,
    body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memMessages.push(msg);

  const conv = memConversations.find((c) => sid(c._id) === convId);
  if (conv) {
    conv.lastMessage = body.length > 80 ? body.slice(0, 80) + '…' : body;
    conv.lastMessageAt = msg.createdAt;
  }

  return msg;
};

module.exports = {
  canUsersChat,
  getOrCreateConversation,
  getConversationsForUser,
  getConversationById,
  getMessages,
  saveMessage,
};
