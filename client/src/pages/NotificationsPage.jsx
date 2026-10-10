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
} from 'lucide-react';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { unreadCount, refreshUnreadCount } = useNotifications();

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionInProgress, setActionInProgress] = useState(null);

  // Fetch paginated notifications
  const fetchPageNotifications = useCallback(
    async (currentPage = 1, currentFilter = activeTab) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          limit: 15,
        };
        if (currentFilter === 'UNREAD') {
          params.isRead = false;
        }

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
    [activeTab]
  );

  useEffect(() => {
    fetchPageNotifications(page, activeTab);
  }, [fetchPageNotifications, page, activeTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setPage(1);
  };

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
      if (activeTab === 'UNREAD') {
        fetchPageNotifications(1, 'UNREAD');
      }
    } catch (err) {
      console.error('Mark all read error:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
                Notifications
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Stay informed with platform updates, requests, and opportunities
              </p>
            </div>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={actionInProgress === 'ALL'}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#4F46E5] bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-colors disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all as read</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fetchPageNotifications(page, activeTab)}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-[#172033] hover:bg-slate-50 transition-colors"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex items-center justify-between mt-6 mb-4">
        <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => handleTabChange('ALL')}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'ALL'
                ? 'bg-white text-[#172033] shadow-sm'
                : 'text-slate-600 hover:text-[#172033]'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('UNREAD')}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'UNREAD'
                ? 'bg-white text-[#4F46E5] shadow-sm'
                : 'text-slate-600 hover:text-[#172033]'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#4F46E5] block" />
            )}
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {totalCount} {totalCount === 1 ? 'notification' : 'notifications'}
        </span>
      </div>

      {/* Main Content Area */}
      {loading && notifications.length === 0 ? (
        <div className="space-y-3 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 animate-pulse flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/4" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 my-6 text-center rounded-2xl bg-white border border-rose-100 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Unable to load notifications</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
          <button
            type="button"
            onClick={() => fetchPageNotifications(page, activeTab)}
            className="mt-4 px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-semibold hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try again
          </button>
        </div>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-4 my-6 text-center rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#172033]">You're all caught up!</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'UNREAD'
              ? 'You have no unread notifications at this time.'
              : 'No notifications to show right now. When actions happen, you will see them here.'}
          </p>
        </div>
      ) : (
        /* Notification List */
        <div className="space-y-3 mt-4">
          {notifications.map((notif) => {
            const { icon: VisualIcon, color, badge } = getNotificationVisuals(notif.type);
            const notifId = notif._id || notif.id;
            const isItemBusy = actionInProgress === notifId;

            return (
              <div
                key={notifId}
                onClick={() => handleNotificationClick(notif)}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-150 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !notif.isRead
                    ? 'bg-indigo-50/20 border-indigo-200/80 shadow-sm hover:border-indigo-300'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Category icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center mt-0.5 ${color}`}
                  >
                    <VisualIcon className="w-5 h-5" />
                  </div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {badge}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                      {!notif.isRead && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                          Unread
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm sm:text-base font-bold ${
                        !notif.isRead ? 'text-[#172033]' : 'text-slate-800'
                      }`}
                    >
                      {notif.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.actionUrl && (
                      <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] group-hover:text-[#7C3AED] transition-colors">
                        <span>View details</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Individual notification actions */}
                <div
                  className="flex items-center gap-2 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => handleToggleRead(e, notif)}
                    disabled={isItemBusy}
                    title={notif.isRead ? 'Mark as unread' : 'Mark as read'}
                    className="p-2 rounded-xl text-slate-500 hover:text-[#4F46E5] hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  >
                    {notif.isRead ? (
                      <RotateCcw className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4 text-[#4F46E5]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, notif)}
                    disabled={isItemBusy}
                    title="Delete notification"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-200">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            Previous
          </button>

          <span className="text-xs sm:text-sm text-slate-500 font-medium">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
