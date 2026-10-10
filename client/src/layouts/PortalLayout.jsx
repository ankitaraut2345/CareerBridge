import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import BrandLogo from '../components/BrandLogo';
import {
  Home,
  Briefcase,
  FileText,
  Bookmark,
  Sparkles,
  Users,
  GraduationCap,
  Link as LinkIcon,
  BarChart2,
  MessageSquare,
  Bell,
  User,
  Settings,
  HelpCircle,
  Search,
  ChevronRight,
  ChevronDown,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export const PortalLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const role = user?.role || 'STUDENT';
  const rolePath = role.toLowerCase();

  // Navigation Items matching the exact sidebar in all mockups
  const navSections = [
    {
      title: null,
      items: [
        {
          name: 'Dashboard',
          path: `/${rolePath}`,
          icon: Home,
          exact: true,
        },
      ],
    },
    {
      title: 'OPPORTUNITIES',
      items: [
        {
          name: 'Opportunities',
          path: role === 'STUDENT' ? '/student/opportunities' : '/opportunities',
          icon: Briefcase,
        },
        {
          name: 'My Applications',
          path: role === 'STUDENT' ? '/student/applications' : '/student/applications',
          icon: FileText,
          hidden: role !== 'STUDENT',
        },
        {
          name: 'Saved Opportunities',
          path: '/student/saved-opportunities',
          icon: Bookmark,
          hidden: role !== 'STUDENT',
        },
      ].filter((i) => !i.hidden),
    },
    {
      title: 'CAREER GROWTH',
      items: [
        {
          name: 'AI Assistant',
          path: '/student/ai-assistant',
          icon: Sparkles,
          badge: 'NEW',
          badgeColor: 'bg-[#7C3AED] text-white',
        },
        {
          name: 'Alumni Network',
          path: '/student/mentors',
          icon: Users,
        },
        {
          name: 'Mentorship',
          path: role === 'ALUMNI' ? '/alumni/mentorship' : '/student/mentorship',
          icon: GraduationCap,
        },
        {
          name: 'Referrals',
          path: role === 'ALUMNI' ? '/alumni/referrals' : '/student/referrals',
          icon: LinkIcon,
        },
        {
          name: 'Career Roadmap',
          path: '/student/roadmap',
          icon: BarChart2,
        },
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        {
          name: 'Messages',
          path: '/chat',
          icon: MessageSquare,
        },
        {
          name: 'Notifications',
          path: '/notifications',
          icon: Bell,
          dot: unreadCount > 0,
        },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        {
          name: 'My Profile',
          path: role === 'ALUMNI' ? '/alumni/profile' : '/student/profile',
          icon: User,
        },
        {
          name: 'Settings',
          path: '/settings',
          icon: Settings,
        },
        {
          name: 'Help & Support',
          path: '/help',
          icon: HelpCircle,
        },
      ],
    },
  ];

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/student/opportunities?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActiveRoute = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-[#172033]">
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-200/80 bg-white transition-all duration-300 z-30 sticky top-0 h-screen ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-100 flex-shrink-0">
          {!sidebarCollapsed ? (
            <BrandLogo size="default" />
          ) : (
            <div className="mx-auto">
              <BrandLogo size="sm" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          {navSections.map((section, sIdx) => (
            <div key={sIdx}>
              {section.title && !sidebarCollapsed && (
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 select-none">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveRoute(item);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      title={sidebarCollapsed ? item.name : undefined}
                      className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 relative ${
                        active
                          ? 'bg-indigo-50/90 text-[#4F46E5] font-semibold shadow-2xs'
                          : 'text-slate-600 hover:text-[#172033] hover:bg-slate-50'
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#4F46E5] rounded-r-md" />
                      )}

                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          active ? 'text-[#4F46E5]' : 'text-slate-500 group-hover:text-[#172033]'
                        }`}
                      />

                      {!sidebarCollapsed && (
                        <span className="flex-1 truncate">{item.name}</span>
                      )}

                      {!sidebarCollapsed && item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {item.dot && (
                        <span className="w-2 h-2 rounded-full bg-[#7C3AED] flex-shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Mini Profile Card at Bottom */}
        <div className="p-3 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
          <Link
            to={role === 'ALUMNI' ? '/alumni/profile' : '/student/profile'}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-xs border border-transparent hover:border-slate-200 transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'JD'}
            </div>

            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-bold text-[#172033] truncate group-hover:text-[#4F46E5] transition-colors">
                  {user?.name || 'John Doe'}
                </div>
                <div className="text-[11px] text-slate-500 capitalize truncate">
                  {role.toLowerCase()}
                </div>
              </div>
            )}

            {!sidebarCollapsed && (
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#4F46E5] transition-colors flex-shrink-0" />
            )}
          </Link>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER OVERLAY ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[80vw] bg-white h-full flex flex-col shadow-2xl">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
              <BrandLogo size="default" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {navSections.map((section, sIdx) => (
                <div key={sIdx}>
                  {section.title && (
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                      {section.title}
                    </div>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActiveRoute(item);
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                            active
                              ? 'bg-indigo-50 text-[#4F46E5] font-semibold'
                              : 'text-slate-600 hover:text-[#172033] hover:bg-slate-50'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${active ? 'text-[#4F46E5]' : 'text-slate-500'}`} />
                          <span className="flex-1 truncate">{item.name}</span>
                          {item.badge && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT VIEWPORT ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 sm:h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <BrandLogo size="sm" />
          </div>

          {/* Search Input Box */}
          <form
            onSubmit={handleGlobalSearch}
            className="hidden sm:flex items-center flex-1 max-w-lg relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search opportunities, mentors, or resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-[#172033] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white focus:border-transparent transition-all"
            />
          </form>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Notifications Bell */}
            <Link
              to="/notifications"
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-[#4F46E5] hover:bg-slate-50 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white animate-pulse" />
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'JD'}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-[#172033] leading-tight">
                    {user?.name || 'John Doe'}
                  </div>
                  <div className="text-[11px] text-slate-500 capitalize leading-tight">
                    {role.toLowerCase()}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-[#172033]">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>

                  <Link
                    to={role === 'ALUMNI' ? '/alumni/profile' : '/student/profile'}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>

                  <Link
                    to="/help"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>Help &amp; Support</span>
                  </Link>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
