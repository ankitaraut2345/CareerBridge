import api from './api';

/**
 * Chat REST API service for CareerBridge Phase 10
 */

/** Get all conversations for the authenticated user */
export const getConversations = async () => {
  const res = await api.get('/chat/conversations');
  return res.data || [];
};

/** Open or retrieve an existing conversation with another user */
export const openConversation = async (otherUserId) => {
  const res = await api.post('/chat/conversations', { otherUserId });
  return res.data;
};

/** Get a conversation by id */
export const getConversationById = async (conversationId) => {
  const res = await api.get(`/chat/conversations/${conversationId}`);
  return res.data;
};

/** Get paginated messages for a conversation */
export const getMessages = async (conversationId, { limit = 50, before } = {}) => {
  const params = { limit };
  if (before) params.before = before;
  const res = await api.get(`/chat/conversations/${conversationId}/messages`, { params });
  return res.data || [];
};

/** Check if the current user can chat with another user */
export const canChat = async (otherUserId) => {
  const res = await api.get(`/chat/can-chat/${otherUserId}`);
  return res;
};

/** Send a message via REST */
export const sendMessage = async (conversationId, body) => {
  const res = await api.post(`/chat/conversations/${conversationId}/messages`, { body });
  return res.data;
};

