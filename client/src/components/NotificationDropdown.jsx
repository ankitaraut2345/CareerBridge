import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { formatTimeAgo } from '../services/notificationService';
import {
  Bell,
  CheckCheck,
  Briefcase,
  Calendar,
  Users,
  Share2,
  MessageSquare,
  Building2,
  ArrowRight,
  Check,
  Trash2,
} from 'lucide-react';

/**
 * Returns appropriate icon and accent color based on notification category/type
 */
export const getNotificationVisuals = (type = '') => {
  if (type.startsWith('APPLICATION_') || type.includes('SHORTLIST') || type.includes('SELECT')) {
    return {
      icon: Briefcase,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      badge: 'Application',
    };
  }
  if (type.startsWith('INTERVIEW_')) {
    return {
      icon: Calendar,
      color: 'text-sky-600 bg-sky-50 border-sky-100',
      badge: 'Interview',
    };
  }
  if (type.startsWith('MENTORSHIP_')) {
    return {
      icon: Users,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      badge: 'Mentorship',
    };
  }
  if (type.startsWith('REFERRAL_')) {
    return {
      icon: Share2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      badge: 'Referral',
    };
  }
  if (type === 'NEW_CHAT_MESSAGE' || type.includes('CHAT')) {
    return {
      icon: MessageSquare,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      badge: 'Message',
    };
  }
  if (type.startsWith('OPPORTUNITY_')) {
    return {
      icon: Building2,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      badge: 'Opportunity',
    };
  }
  return {
    icon: Bell,
    color: 'text-slate-600 bg-slate-50 border-slate-100',
    badge: 'Update',
  };
};

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const {
    unreadCount,
    recentNotifications,
    loading,
    markAsRead,
    markAllAsRead,
    refreshRecentNotifications,
  } = useNotifications();

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      refreshRecentNotifications();
    }
  };

  const handleItemClick = async (notif) => {
    const notifId = notif._id || notif.id;
    if (!notif.isRead && notifId) {
      await markAsRead(notifId);
    }
    setIsOpen(false);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        className={`relative p-2 rounded-xl transition-all duration-150 border focus:outline-none focus:ring-2 focus:ring-[#4F46E5] ${
          isOpen
            ? 'bg-indigo-50 border-indigo-200 text-[#4F46E5]'
            : 'bg-white border-slate-200/80 text-slate-600 hover:text-[#172033] hover:bg-slate-50'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#4F46E5] text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#172033]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-semibold text-[#4F46E5] hover:text-[#7C3AED] flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List items */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
            {loading && recentNotifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <div className="inline-block w-4 h-4 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mb-2" />
                <p>Loading notifications...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-2 border border-slate-200">
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-semibold text-slate-700">You're all caught up!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No notifications right now.</p>
              </div>
            ) : (
              recentNotifications.map((notif) => {
                const { icon: VisualIcon, color } = getNotificationVisuals(notif.type);
                const notifId = notif._id || notif.id;

                return (
                  <div
                    key={notifId}
                    onClick={() => handleItemClick(notif)}
                    className={`group px-4 py-3 hover:bg-slate-50/90 transition-all cursor-pointer flex items-start gap-3 relative ${
                      !notif.isRead ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    {/* Visual Icon */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center mt-0.5 ${color}`}
                    >
                      <VisualIcon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs font-semibold truncate ${
                            !notif.isRead ? 'text-[#172033] font-bold' : 'text-slate-700'
                          }`}
                        >
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {notif.message}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notif.isRead && (
                      <div className="flex-shrink-0 self-center">
                        <span
                          className="w-2 h-2 rounded-full bg-[#4F46E5] block"
                          title="Unread"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer View All */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-[#4F46E5] hover:text-[#7C3AED] hover:bg-white rounded-lg transition-all"
            >
              <span>View all notifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
