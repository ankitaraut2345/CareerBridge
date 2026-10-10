import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import {
  getNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  deleteNotification,
  formatTimeAgo,
} from '../services/notificationService';
import { getNotificationVisuals } from '../components/NotificationDropdown';
import {
  Bell,
  CheckCheck,
  Check,
  RotateCcw,
  Trash2,
  ExternalLink,
  Filter,
  RefreshCw,
  AlertCircle,
  Inbox,
  Sparkles,
  Briefcase,
  Users,
  Award,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { unreadCount, refreshUnreadCount } = useNotifications();

  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Opportunities' | 'Applications' | 'Mentorship' | 'Referrals' | 'System'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionInProgress, setActionInProgress] = useState(null);

  // Fetch paginated notifications
  const fetchPageNotifications = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          limit: 20,
        };

        const res = await getNotifications(params);
        setNotifications(res.data || []);
        if (res.pagination) {
          setPage(res.pagination.page);
          setTotalPages(res.pagination.pages || 1);
          setTotalCount(res.pagination.total || 0);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
        setError(err.message || 'Unable to load notifications. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPageNotifications(page);
  }, [fetchPageNotifications, page]);

  const handleNotificationClick = async (notif) => {
    const notifId = notif._id || notif.id;
    if (!notif.isRead && notifId) {
      try {
        await markNotificationAsRead(notifId);
        setNotifications((prev) =>
          prev.map((n) => ((n._id || n.id) === notifId ? { ...n, isRead: true } : n))
        );
        refreshUnreadCount();
      } catch (err) {
        console.error('Failed to mark read on click:', err);
      }
    }
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const handleToggleRead = async (e, notif) => {
    e.stopPropagation();
    const notifId = notif._id || notif.id;
    if (!notifId) return;

    setActionInProgress(notifId);
    try {
      if (notif.isRead) {
        await markNotificationAsUnread(notifId);
        setNotifications((prev) =>
          prev.map((n) => ((n._id || n.id) === notifId ? { ...n, isRead: false } : n))
        );
      } else {
        await markNotificationAsRead(notifId);
        setNotifications((prev) =>
          prev.map((n) => ((n._id || n.id) === notifId ? { ...n, isRead: true } : n))
        );
      }
      refreshUnreadCount();
    } catch (err) {
      console.error('Toggle read state error:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (e, notif) => {
    e.stopPropagation();
    const notifId = notif._id || notif.id;
    if (!notifId) return;

    setActionInProgress(notifId);
    try {
      await deleteNotification(notifId);
      setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== notifId));
      setTotalCount((prev) => Math.max(0, prev - 1));
      refreshUnreadCount();
    } catch (err) {
      console.error('Delete notification error:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionInProgress('ALL');
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      refreshUnreadCount();
    } catch (err) {
      console.error('Mark all read error:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  // Filter notifications by category tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'Opportunities') return n.type?.includes('OPPORTUNITY');
    if (activeTab === 'Applications') return n.type?.includes('APPLICATION') || n.type?.includes('INTERVIEW');
    if (activeTab === 'Mentorship') return n.type?.includes('MENTORSHIP');
    if (activeTab === 'Referrals') return n.type?.includes('REFERRAL');
    if (activeTab === 'System') return n.type?.includes('SYSTEM') || n.type?.includes('PROFILE');
    return true;
  });

  return (
    <div className="space-y-7 pb-10">
      {/* 1. SaaS Hero Banner matching Image 4 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#172033] tracking-tight leading-tight mb-2">
              Notifications
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Stay updated with real-time alerts on your applications, interviews, referrals, and drives.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={actionInProgress === 'ALL'}
                  className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark All Read</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => fetchPageNotifications(page)}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="hidden md:flex flex-col items-end justify-center">
            <div className="px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-indigo-100 shadow-xs text-right">
              <span className="block text-xs font-bold text-slate-400 italic">Push Center</span>
              <span className="block text-sm font-extrabold text-[#4F46E5] italic">
                {unreadCount > 0 ? `${unreadCount} Unread Alerts` : 'All Caught Up ✨'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Feature Guidance Cards matching Image 4 */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-100/70">
          {[
            { title: 'Drive Alerts', desc: 'Instant company announcements', icon: Briefcase, color: 'bg-blue-100 text-[#4F46E5]' },
            { title: 'Interview Updates', desc: 'Schedules and links', icon: Calendar, color: 'bg-purple-100 text-[#7C3AED]' },
            { title: 'Mentorship', desc: 'Session replies & notes', icon: Users, color: 'bg-emerald-100 text-emerald-700' },
            { title: 'Referral Status', desc: 'Alumni reviews & referrals', icon: Send, color: 'bg-amber-100 text-amber-700' },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 backdrop-blur-2xs border border-slate-200/60 shadow-2xs"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#172033] truncate">{card.title}</div>
                  <div className="text-[11px] text-slate-500 truncate">{card.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Filter Tabs matching Image 4 */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          {['All', 'Opportunities', 'Applications', 'Mentorship', 'Referrals', 'System'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-bold pb-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:block">
          {filteredNotifications.length} {filteredNotifications.length === 1 ? 'alert' : 'alerts'}
        </span>
      </div>

      {/* 3. Notification List matching Image 4 */}
      {loading && notifications.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-[#172033]">No notifications here</h3>
          <p className="text-xs text-slate-500">
            You're all caught up on alerts in this category.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredNotifications.map((notif) => {
            const notifId = notif._id || notif.id;
            const visuals = getNotificationVisuals(notif.type);
            const isRead = notif.isRead;

            return (
              <div
                key={notifId}
                onClick={() => handleNotificationClick(notif)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  isRead
                    ? 'bg-white border-slate-200/80 hover:border-slate-300'
                    : 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-300 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Colored icon box matching Image 4 */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-base shadow-2xs ${
                      visuals.bg || 'bg-indigo-100'
                    }`}
                  >
                    {visuals.icon || '🔔'}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm sm:text-base font-extrabold leading-tight ${
                          isRead ? 'text-[#172033]' : 'text-[#4F46E5]'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#4F46E5] flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                      {notif.message}
                    </p>

                    <div className="text-[11px] text-slate-400 font-medium">
                      {formatTimeAgo(notif.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 justify-end self-end sm:self-center flex-shrink-0">
                  {notif.actionUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(notif.actionUrl);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleToggleRead(e, notif)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title={isRead ? 'Mark as unread' : 'Mark as read'}
                  >
                    <Check className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, notif)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
