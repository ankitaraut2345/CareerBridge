import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeroBanner from '../components/PageHeroBanner';
import api from '../services/api';
import {
  Settings,
  Bell,
  Lock,
  Palette,
  Shield,
  Globe,
  Trash2,
  Edit2,
  Camera,
  Check,
  AlertCircle,
  Sparkles,
  Save,
} from 'lucide-react';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [editingAccount, setEditingAccount] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Account details state initialized from logged-in user / student profile
  const [accountForm, setAccountForm] = useState({
    fullName: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+91 98765 43210',
    college: "Vidya Pratishthan's Kamalnayan Bajaj Institute of Engineering and Technology",
    course: 'Computer Engineering',
    graduationYear: '2027',
  });

  // Load student profile if available
  useEffect(() => {
    api
      .get('/student/profile')
      .then((res) => {
        if (res.data) {
          const p = res.data;
          setAccountForm((prev) => ({
            ...prev,
            fullName: p.fullName || prev.fullName,
            phone: p.phone || prev.phone,
            college: p.college || prev.college,
            course: p.department || prev.course,
            graduationYear: p.graduationYear ? String(p.graduationYear) : prev.graduationYear,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Notification Preferences toggles
  const [notifications, setNotifications] = useState({
    newOpportunities: true,
    applicationUpdates: true,
    mentorshipUpdates: true,
    messages: true,
    systemUpdates: false,
  });

  // Privacy & Visibility preferences
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'Visible to Recruiters and Mentors',
    showEmail: false,
    showPhone: false,
  });

  const handleSaveAccount = async () => {
    try {
      await api.put('/student/profile', {
        fullName: accountForm.fullName,
        phone: accountForm.phone,
        college: accountForm.college,
        department: accountForm.course,
        graduationYear: Number(accountForm.graduationYear) || 2027,
      });
      setSaveSuccess(true);
      setEditingAccount(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setEditingAccount(false);
    }
  };

  const navTabs = [
    { id: 'account', name: 'Account Settings', icon: Settings },
    { id: 'notifications', name: 'Notification Preferences', icon: Bell },
    { id: 'privacy', name: 'Privacy & Visibility', icon: Lock },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'language', name: 'Language & Region', icon: Globe },
    { id: 'management', name: 'Account Management', icon: Trash2 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* ─── Hero Banner matching Image 2 ─── */}
      <PageHeroBanner
        title="Settings"
        subtitle="Manage your account, privacy, notifications, and preferences."
        tagline="Personalize Your Experience"
        taglineIcon={Sparkles}
      />

      {/* ─── Main Two-Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-7 items-start">
        {/* Left Sub-Navigation List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-1">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left cursor-pointer ${
                  active
                    ? 'bg-indigo-50/80 text-[#4F46E5] shadow-2xs border-l-4 border-[#7C3AED]'
                    : 'text-slate-600 hover:text-[#172033] hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#4F46E5]' : 'text-slate-400'}`} />
                <span className="truncate">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Cards Panel */}
        <div className="lg:col-span-3 space-y-6">
          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          {/* 1. Account Settings Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#172033]">Account Settings</h3>
                  <p className="text-xs text-slate-500">Update your personal information and account details.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (editingAccount) {
                    handleSaveAccount();
                  } else {
                    setEditingAccount(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-[#4F46E5] hover:text-[#4F46E5] text-xs font-semibold text-[#172033] transition-colors cursor-pointer"
              >
                {editingAccount ? (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar with Camera badge */}
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                  {accountForm.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#172033] text-white shadow-xs cursor-pointer hover:bg-[#4F46E5] transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Details Form Grid */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-6 w-full text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Full Name</label>
                  {editingAccount ? (
                    <input
                      type="text"
                      value={accountForm.fullName}
                      onChange={(e) => setAccountForm({ ...accountForm, fullName: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <div className="font-semibold text-sm text-[#172033]">{accountForm.fullName}</div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email</label>
                  <div className="font-semibold text-sm text-[#172033]">{accountForm.email}</div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Phone Number</label>
                  {editingAccount ? (
                    <input
                      type="text"
                      value={accountForm.phone}
                      onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <div className="font-semibold text-sm text-[#172033]">{accountForm.phone}</div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">College</label>
                  {editingAccount ? (
                    <input
                      type="text"
                      value={accountForm.college}
                      onChange={(e) => setAccountForm({ ...accountForm, college: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <div className="font-semibold text-sm text-[#172033] leading-snug">{accountForm.college}</div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Course</label>
                  {editingAccount ? (
                    <input
                      type="text"
                      value={accountForm.course}
                      onChange={(e) => setAccountForm({ ...accountForm, course: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <div className="font-semibold text-sm text-[#172033]">{accountForm.course}</div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Graduation Year</label>
                  {editingAccount ? (
                    <input
                      type="number"
                      value={accountForm.graduationYear}
                      onChange={(e) => setAccountForm({ ...accountForm, graduationYear: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    />
                  ) : (
                    <div className="font-semibold text-sm text-[#172033]">{accountForm.graduationYear}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Notification Preferences Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#172033]">Notification Preferences</h3>
                <p className="text-xs text-slate-500">Choose what notifications you want to receive.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {[
                {
                  key: 'newOpportunities',
                  title: 'New Opportunities',
                  desc: 'Get notified about new internship and job opportunities.',
                },
                {
                  key: 'applicationUpdates',
                  title: 'Application Updates',
                  desc: 'Receive updates on your application status.',
                },
                {
                  key: 'mentorshipUpdates',
                  title: 'Mentorship Updates',
                  desc: 'Get notified about mentorship requests and messages.',
                },
                {
                  key: 'messages',
                  title: 'Messages',
                  desc: 'Receive notifications for new messages.',
                },
                {
                  key: 'systemUpdates',
                  title: 'System Updates',
                  desc: 'Important announcements and platform updates.',
                },
              ].map(({ key, title, desc }) => (
                <div key={key} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#172033]">{title}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={notifications[key]}
                      onChange={() =>
                        setNotifications({ ...notifications, [key]: !notifications[key] })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Privacy & Visibility Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#172033]">Privacy &amp; Visibility</h3>
                <p className="text-xs text-slate-500">Control who can see your profile and information.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#172033]">Profile Visibility</div>
                  <div className="text-xs text-slate-500">Make your profile visible to recruiters and mentors.</div>
                </div>
                <select
                  value={privacy.profileVisibility}
                  onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-[#172033] bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                >
                  <option value="Visible to Recruiters and Mentors">Visible to Recruiters and Mentors</option>
                  <option value="Public to Entire Campus">Public to Entire Campus</option>
                  <option value="Private Only">Private Only</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-4 py-3 border-t border-slate-100">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#172033]">Show Email Address</div>
                  <div className="text-xs text-slate-500">Allow others to see your email address.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={privacy.showEmail}
                    onChange={() => setPrivacy({ ...privacy, showEmail: !privacy.showEmail })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 py-3 border-t border-slate-100">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#172033]">Show Phone Number</div>
                  <div className="text-xs text-slate-500">Allow others to see your phone number.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={privacy.showPhone}
                    onChange={() => setPrivacy({ ...privacy, showPhone: !privacy.showPhone })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
