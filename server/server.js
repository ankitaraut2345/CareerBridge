require('dotenv').config();
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { seedDemoUsersIntoDb } = require('./services/userStore.service');
const { verifyToken } = require('./utils/jwt');
const { findUserById } = require('./services/userStore.service');
const {
  canUsersChat,
  getOrCreateConversation,
  getMessages,
  saveMessage,
} = require('./services/chatStore.service');
const { setIo, createNotification } = require('./services/notificationStore.service');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and seed demo users if DB is online
connectDB()
  .then(() => {
    seedDemoUsersIntoDb();
  })
  .catch((err) => {
    if ((process.env.NODE_ENV || '').trim().toLowerCase() === 'production') {
      console.error('💥 Fatal: MongoDB connection failed in production. Halting process:', err.message);
      process.exit(1);
    }
  });

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const httpServer = http.createServer(app);

// ─── Socket.IO Setup ──────────────────────────────────────────────────────────
const socketClientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.trim().replace(/\/+$/, '') : null;
const socketVercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.trim().replace(/\/+$/, '')}` : null;

const socketAllowedOrigins = [
  socketClientUrl,
  socketVercelUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

const isLegitimateSocketOrigin = (origin) => {
  return /^https:\/\/[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*\.vercel\.app$/.test(origin);
};

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (
        !origin ||
        process.env.NODE_ENV !== 'production' ||
        socketAllowedOrigins.includes(origin) ||
        isLegitimateSocketOrigin(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by Socket.IO CORS policy'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Wire Socket.IO instance to notification store for real-time alerts
setIo(io);

/**
 * Socket.IO JWT Authentication Middleware
 * Validates the JWT token sent in the handshake auth object.
 */
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required: no token provided.'));
    }

    const decoded = verifyToken(token);
    const user = await findUserById(decoded.userId);

    if (!user) return next(new Error('User not found.'));
    if (user.isActive === false) return next(new Error('Account is deactivated.'));

    // Attach authenticated user to socket
    socket.user = {
      id: user._id ? user._id.toString() : user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    next(new Error('Invalid or expired token.'));
  }
});

/**
 * Socket.IO Event Handlers
 */
io.on('connection', (socket) => {
  const { id: userId, name: userName } = socket.user;
  console.log(`💬 [Chat] User connected: ${userName} (${userId}) — socket: ${socket.id}`);

  // Join a personal room so targeted events can be sent to this user
  socket.join(`user:${userId}`);

  /**
   * chat:join — client requests to join a conversation room
   * Data: { conversationId }
   */
  socket.on('chat:join', async ({ conversationId } = {}) => {
    try {
      if (!conversationId) {
        socket.emit('chat:error', { message: 'conversationId is required.' });
        return;
      }

      // Verify this user is a participant
      const { getConversationById } = require('./services/chatStore.service');
      const conv = await getConversationById(conversationId, userId);

      socket.join(`conv:${conversationId}`);
      console.log(`💬 [Chat] ${userName} joined conversation ${conversationId}`);

      // Send the last 50 messages as the initial payload
      const messages = await getMessages(conversationId, { limit: 50 });
      socket.emit('chat:history', { conversationId, messages });
    } catch (err) {
      socket.emit('chat:error', { message: err.message || 'Could not join conversation.' });
    }
  });

  /**
   * chat:send — client sends a new message
   * Data: { conversationId, body }
   */
  socket.on('chat:send', async ({ conversationId, body } = {}) => {
    try {
      if (!conversationId || !body?.trim()) {
        socket.emit('chat:error', { message: 'conversationId and body are required.' });
        return;
      }

      if (body.trim().length > 2000) {
        socket.emit('chat:error', { message: 'Message cannot exceed 2000 characters.' });
        return;
      }

      // Re-validate participant membership on every send (security)
      const { getConversationById } = require('./services/chatStore.service');
      const conv = await getConversationById(conversationId, userId);

      const message = await saveMessage(conversationId, userId, body.trim());

      const payload = {
        _id: message._id,
        conversationId,
        senderId: userId,
        senderName: userName,
        body: message.body,
        createdAt: message.createdAt,
      };

      // Broadcast to all sockets in the conversation room (including sender)
      io.to(`conv:${conversationId}`).emit('chat:message', payload);

      // Notify the other participant if not active in this conversation
      try {
        const otherId = (conv?.participants || [])
          .map((p) => (typeof p === 'object' && p !== null ? (p._id || p.id || '').toString() : p.toString()))
          .find((p) => p && p !== userId);
        if (otherId) {
          createNotification({
            recipientId: otherId,
            type: 'NEW_CHAT_MESSAGE',
            title: 'New Message',
            message: `${userName}: "${body.trim().length > 60 ? body.trim().slice(0, 60) + '…' : body.trim()}"`,
            relatedEntityType: 'Conversation',
            relatedEntityId: conversationId,
            actionUrl: '/chat',
          }).catch((err) => console.error('[Notification] Error creating chat notification:', err.message));
        }
      } catch (notifErr) {
        console.error('[Notification] Chat notification trigger error:', notifErr.message);
      }
    } catch (err) {
      socket.emit('chat:error', { message: err.message || 'Failed to send message.' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`💬 [Chat] User disconnected: ${userName} (${userId})`);
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🚀 CareerBridge Server running on port ${PORT}`);
  console.log(`🔗 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth API ready at: http://localhost:${PORT}/api/auth`);
  console.log(`💬 Socket.IO chat ready on ws://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
});
