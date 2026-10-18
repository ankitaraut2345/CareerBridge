import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSocket, disconnectSocket } from '../../services/socketService';
import {
  getConversations,
  openConversation,
  getMessages,
  sendMessage,
} from '../../services/chatService';
import {
  MessageCircle,
  Send,
  Loader2,
  AlertCircle,
  User,
  Wifi,
  WifiOff,
  ChevronLeft,
  Hash,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateDivider = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const needsDateDivider = (messages, index) => {
  if (index === 0) return true;
  const prev = new Date(messages[index - 1].createdAt).toDateString();
  const curr = new Date(messages[index].createdAt).toDateString();
  return prev !== curr;
};

const getOtherParticipant = (conv, myId) => {
  const participants = conv.participants || [];
  return participants.find((p) => p.toString() !== myId.toString()) || null;
};

const getAvatarInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
};

const CONTEXT_COLORS = {
  MENTORSHIP: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Mentorship' },
  REFERRAL: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Referral' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const ConversationItem = ({ conv, isActive, myId, participantsMap, onClick }) => {
  const otherId = getOtherParticipant(conv, myId);
  const otherName = conv.otherParticipant?.name || participantsMap[otherId] || 'User';
  const otherRole = conv.otherParticipant?.role;
  const ctx = CONTEXT_COLORS[conv.contextType] || CONTEXT_COLORS.MENTORSHIP;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-slate-100 flex items-center gap-3 hover:bg-slate-50 transition-colors ${
        isActive ? 'bg-indigo-50 border-l-4 border-l-[#4F46E5]' : 'border-l-4 border-l-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white flex items-center justify-center font-bold text-sm">
        {getAvatarInitials(otherName)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-[#172033] text-sm truncate">{otherName}</p>
          {conv.lastMessageAt && (
            <span className="text-[10px] text-slate-400 flex-shrink-0">
              {formatTime(conv.lastMessageAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-slate-500 truncate">
            {conv.lastMessage || 'No messages yet'}
          </p>
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${ctx.bg} ${ctx.text}`}>
            {ctx.label}
          </span>
        </div>
      </div>
    </button>
  );
};

const MessageBubble = ({ msg, isMine }) => (
  <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
    <div
      className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
        isMine
          ? 'bg-[#4F46E5] text-white rounded-br-sm'
          : 'bg-white border border-slate-200 text-[#172033] rounded-bl-sm'
      }`}
    >
      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.body}</p>
      <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
        {formatTime(msg.createdAt)}
      </p>
    </div>
  </div>
);

const DateDivider = ({ label }) => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 h-px bg-slate-200" />
    <span className="text-xs text-slate-400 font-medium px-2">{label}</span>
    <div className="flex-1 h-px bg-slate-200" />
  </div>
);

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-6">
    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-[#4F46E5]" />
    </div>
    <h3 className="text-base font-bold text-[#172033] mb-1">{title}</h3>
    <p className="text-sm text-slate-500 max-w-xs">{subtitle}</p>
  </div>
);

// ─── Main ChatPage ─────────────────────────────────────────────────────────────

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get('with');

  // State
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [participantsMap, setParticipantsMap] = useState({});
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const activeConvIdRef = useRef(null);

  // Keep ref in sync for use inside socket callbacks
  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  // ── Socket.IO Initialisation ───────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('careerbridge_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const socket = getSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => {
      console.error('[Chat] connect_error:', err.message);
      setConnected(false);
    });

    // Receive a new message
    socket.on('chat:message', (msg) => {
      // Only append if message belongs to the currently open conversation
      if (msg.conversationId === activeConvIdRef.current) {
        setMessages((prev) => {
          // Avoid duplicates (e.g. from optimistic updates, though we don't use them here)
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
      // Update conversation list snapshot
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversationId
            ? { ...c, lastMessage: msg.body, lastMessageAt: msg.createdAt }
            : c
        )
      );
    });

    // Initial message history from chat:join
    socket.on('chat:history', ({ conversationId, messages: history }) => {
      if (conversationId === activeConvIdRef.current) {
        setMessages(history);
        setLoadingMsgs(false);
      }
    });

    socket.on('chat:error', ({ message }) => {
      setError(message);
      setLoadingMsgs(false);
      setSending(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('chat:message');
      socket.off('chat:history');
      socket.off('chat:error');
    };
  }, [navigate]);

  // ── Load Conversations ─────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const convs = await getConversations();
      setConversations(convs);

      // Build a name map for participants (we'll resolve from conversation metadata)
      // For demo, use placeholder names — in production, populate via API
      const map = {};
      convs.forEach((c) => {
        (c.participants || []).forEach((pid) => {
          if (!map[pid]) map[pid] = null; // placeholder
        });
      });
      setParticipantsMap(map);
    } catch (err) {
      setError('Failed to load conversations.');
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Auto-open conversation from ?with=userId param ─────────────────────────
  useEffect(() => {
    if (!targetUserId || loadingConvs) return;
    const initConv = async () => {
      try {
        const conv = await openConversation(targetUserId);
        // Refresh conversations list to include new one
        const convs = await getConversations();
        setConversations(convs);
        handleSelectConversation(conv._id);
        // Remove query param so it doesn't re-trigger
        setSearchParams({});
      } catch (err) {
        setError(err.message || 'Cannot open chat with that user.');
      }
    };
    initConv();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId, loadingConvs]);

  // ── Scroll to bottom when messages change ─────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Select / Join a Conversation ──────────────────────────────────────────
  const handleSelectConversation = useCallback((convId) => {
    if (!convId || convId === activeConvIdRef.current) return;

    setActiveConvId(convId);
    setMessages([]);
    setLoadingMsgs(true);
    setError(null);
    setMobileShowChat(true);

    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit('chat:join', { conversationId: convId });
    } else {
      // Fallback: load via REST
      getMessages(convId)
        .then((msgs) => {
          setMessages(msgs);
          setLoadingMsgs(false);
        })
        .catch(() => {
          setError('Failed to load messages.');
          setLoadingMsgs(false);
        });
    }

    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // ── Polling fallback when running in REST mode (e.g. serverless) ──────────
  useEffect(() => {
    if (connected || !activeConvId) return;

    const interval = setInterval(() => {
      getMessages(activeConvId)
        .then((msgs) => {
          if (Array.isArray(msgs)) {
            setMessages((prev) => {
              if (
                msgs.length !== prev.length ||
                (msgs.length > 0 && msgs[msgs.length - 1]?._id !== prev[prev.length - 1]?._id)
              ) {
                return msgs;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }, 6000);

    return () => clearInterval(interval);
  }, [connected, activeConvId]);

  // ── Send a Message ────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const body = draft.trim();
    if (!body || !activeConvIdRef.current || sending) return;

    const socket = socketRef.current;
    if (socket && socket.connected) {
      setSending(true);
      socket.emit('chat:send', { conversationId: activeConvIdRef.current, body });
      setDraft('');
      setSending(false);
    } else {
      // Fallback: send via REST (supports serverless / Vercel deployment)
      const convId = activeConvIdRef.current;
      setSending(true);
      sendMessage(convId, body)
        .then((res) => {
          const newMsg = res.data || res;
          setMessages((prev) => {
            if (prev.some((m) => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
          });
          setConversations((prev) =>
            prev.map((c) =>
              c._id === convId
                ? { ...c, lastMessage: newMsg.body, lastMessageAt: newMsg.createdAt }
                : c
            )
          );
          setDraft('');
          setError(null);
        })
        .catch((err) => {
          setError(err.response?.data?.message || err.message || 'Failed to send message.');
        })
        .finally(() => {
          setSending(false);
        });
    }
    inputRef.current?.focus();
  }, [draft, sending]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const activeConv = conversations.find((c) => c._id === activeConvId);
  const myId = user?.id;

  // ── UI Helpers ────────────────────────────────────────────────────────────
  const getConvDisplayName = (conv) => {
    if (!conv) return 'Conversation';
    if (conv.otherParticipant?.name) return conv.otherParticipant.name;
    const otherId = getOtherParticipant(conv, myId);
    return participantsMap[otherId] || `User (${String(otherId).slice(-6)})`;
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#172033] flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#4F46E5]" />
              Messages
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Chat with your mentors and referrers
            </p>
          </div>
          {/* Connection indicator */}
          <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
            connected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}>
            {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {connected ? 'Live' : 'Offline'}
          </div>
        </div>
      </div>

      {/* Chat Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex h-[calc(100vh-200px)] min-h-[500px]">

          {/* ── Sidebar (Conversation List) ── */}
          <div
            className={`${
              mobileShowChat ? 'hidden' : 'flex'
            } md:flex w-full md:w-80 lg:w-96 flex-col border-r border-slate-200 bg-white flex-shrink-0`}
          >
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                Conversations
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-[#4F46E5] animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <EmptyState
                  icon={Hash}
                  title="No conversations yet"
                  subtitle="Start a chat from a Mentorship or Referral page."
                />
              ) : (
                conversations.map((conv) => (
                  <ConversationItem
                    key={conv._id}
                    conv={conv}
                    isActive={conv._id === activeConvId}
                    myId={myId}
                    participantsMap={participantsMap}
                    onClick={() => handleSelectConversation(conv._id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Message Window ── */}
          <div
            className={`${
              !mobileShowChat ? 'hidden' : 'flex'
            } md:flex flex-1 flex-col min-w-0`}
          >
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="px-4 sm:px-6 py-3 border-b border-slate-200 bg-white flex items-center gap-3 flex-shrink-0">
                  {/* Mobile back button */}
                  <button
                    onClick={() => setMobileShowChat(false)}
                    className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {getAvatarInitials(getConvDisplayName(activeConv))}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#172033] text-sm truncate">
                        {getConvDisplayName(activeConv)}
                      </p>
                      {activeConv.otherParticipant?.role && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                          {activeConv.otherParticipant.role}
                        </span>
                      )}
                    </div>
                    {activeConv.contextType && (
                      <span className={`text-[10px] font-bold uppercase ${
                        CONTEXT_COLORS[activeConv.contextType]?.text || 'text-slate-500'
                      }`}>
                        via {CONTEXT_COLORS[activeConv.contextType]?.label || activeConv.contextType}
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-0.5 bg-slate-50/40">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-5 h-5 text-[#4F46E5] animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <EmptyState
                      icon={MessageCircle}
                      title="No messages yet"
                      subtitle="Say hello! Be the first to send a message."
                    />
                  ) : (
                    messages.map((msg, idx) => (
                      <React.Fragment key={msg._id || idx}>
                        {needsDateDivider(messages, idx) && (
                          <DateDivider label={formatDateDivider(msg.createdAt)} />
                        )}
                        <MessageBubble
                          msg={msg}
                          isMine={String(msg.senderId) === String(myId)}
                        />
                      </React.Fragment>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Error banner */}
                {error && (
                  <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                    <button
                      onClick={() => setError(null)}
                      className="ml-auto underline hover:no-underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Composer */}
                <div className="flex-shrink-0 border-t border-slate-200 bg-white px-4 sm:px-6 py-3">
                  <div className="flex items-end gap-3">
                    <textarea
                      ref={inputRef}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                      rows={1}
                      className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all max-h-32 overflow-y-auto"
                      style={{ minHeight: '44px' }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!draft.trim() || sending}
                      className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      aria-label="Send message"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 px-1">
                    Messages are visible to both participants only.
                  </p>
                </div>
              </>
            ) : (
              /* No conversation selected */
              <EmptyState
                icon={MessageCircle}
                title="Select a conversation"
                subtitle="Choose a conversation from the sidebar, or start one from a Mentorship or Referral page."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
