import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Backpack,
  GraduationCap,
  Briefcase,
  Shield,
  Loader2,
  AlertCircle,
  X,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context';
import api from '../services/api';

const QUICK_ROLES = [
  {
    role: 'STUDENT',
    title: 'Student',
    badge: 'Blue',
    badgeColor: 'bg-[#2563EB] text-white',
    subtitle: 'Opportunities & Mentorship',
    icon: Backpack,
    iconBoxColor: 'bg-blue-50 text-blue-600 border border-blue-100',
    buttonHover: 'hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/40',
  },
  {
    role: 'ALUMNI',
    title: 'Alumni',
    badge: 'Been',
    badgeColor: 'bg-[#16A34A] text-white',
    subtitle: 'Referrals & Guidance',
    icon: GraduationCap,
    iconBoxColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    buttonHover: 'hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/40',
  },
  {
    role: 'TPO',
    title: 'TPO Officer',
    badge: 'Open',
    badgeColor: 'bg-[#F59E0B] text-white',
    subtitle: 'Placement Drives & Reports',
    icon: Briefcase,
    iconBoxColor: 'bg-amber-50 text-amber-600 border border-amber-100',
    buttonHover: 'hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50/40',
  },
  {
    role: 'ADMIN',
    title: 'Admin',
    badge: 'Red',
    badgeColor: 'bg-[#DC2626] text-white',
    subtitle: 'Verification & Oversight',
    icon: Shield,
    iconBoxColor: 'bg-rose-50 text-rose-600 border border-rose-100',
    buttonHover: 'hover:border-rose-500 hover:text-rose-600 hover:bg-rose-50/40',
  },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, enterDemoSandbox, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  // Auto-redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role) {
      navigate(`/${user.role.toLowerCase()}`, { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [quickLoginRole, setQuickLoginRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('careerbridge_remember_email');
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || quickLoginRole) return;
    setError('');
    setIsSubmitting(true);

    try {
      if (rememberMe) {
        localStorage.setItem('careerbridge_remember_email', form.email);
      } else {
        localStorage.removeItem('careerbridge_remember_email');
      }

      await login(form.email, form.password);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Invalid credentials. Please verify your email and password.'
      );
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (role) => {
    if (quickLoginRole || isSubmitting) return; // Prevent duplicate clicks
    setError('');
    setQuickLoginRole(role);

    try {
      enterDemoSandbox(role);
    } catch (err) {
      setError(
        err?.message ||
          `Unable to launch Demo Showcase Mode for ${role}. Please try again.`
      );
      setQuickLoginRole(null);
    }
  };

  const isBusy = authLoading || isSubmitting || quickLoginRole !== null;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      {/* Background ambient lighting matching reference visual */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-sky-200/50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 -left-24 w-[380px] h-[380px] bg-blue-200/40 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-200/50 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-[400px] h-[400px] bg-violet-200/45 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] bg-indigo-100/50 rounded-full blur-[110px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_rgba(79,70,229,0.08)] p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 relative items-stretch">
          
          {/* Vertical Divider for desktop screens */}
          <div className="hidden lg:block absolute left-1/2 top-2 bottom-2 w-[1px] bg-slate-200 -translate-x-1/2" />

          {/* ─── LEFT COLUMN: Sign In Section ─── */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Official Stacked CareerBridge Logo */}
              <div className="mb-5 sm:mb-6">
                <Link to="/" className="inline-block transition-transform hover:scale-[1.01]">
                  <img
                    src="/careerbridge-logo.png"
                    alt="CareerBridge"
                    className="h-16 sm:h-20 w-auto object-contain"
                  />
                </Link>
              </div>

              {/* Heading */}
              <h1 className="text-2xl sm:text-[28px] font-bold text-[#172033] mb-6 tracking-tight">
                Sign in to CareerBridge
              </h1>

              {/* Error Message Banner */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                  <span className="flex-1 font-medium leading-relaxed">{error}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isBusy}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm sm:text-base text-[#172033] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all shadow-xs"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={isBusy}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm sm:text-base text-[#172033] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all shadow-xs"
                  />
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                    />
                    <span className="font-medium text-slate-700">Keep me logged in</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-slate-600 hover:text-[#4F46E5] font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isBusy}
                  className="w-full mt-4 py-3 px-4 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] active:bg-[#312E81] text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom helper navigation links */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
              <Link
                to="/register"
                className="text-[#4F46E5] hover:text-[#3730A3] font-medium transition-colors"
              >
                Need an account? Register here
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Quick Access Role Hub ─── */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Header Title */}
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-[24px] font-bold text-[#172033] tracking-tight">
                  Quick Access Role Hub
                </h2>
              </div>

              {/* 2x2 Role Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {QUICK_ROLES.map(
                  ({
                    role,
                    title,
                    badge,
                    badgeColor,
                    subtitle,
                    icon: Icon,
                    iconBoxColor,
                    buttonHover,
                  }) => {
                    const isRoleLoading = quickLoginRole === role;
                    return (
                      <div
                        key={role}
                        className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                      >
                        {/* Top row: Icon + Role Name + Badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBoxColor}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm text-[#172033]">{title}</span>
                          </div>

                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}
                          >
                            {badge}
                          </span>
                        </div>

                        {/* Subtitle */}
                        <p className="text-xs text-slate-500 mt-2.5 mb-3.5 font-normal">
                          {subtitle}
                        </p>

                        {/* 1-click test Button */}
                        <button
                          type="button"
                          onClick={() => handleQuickLogin(role)}
                          disabled={isBusy}
                          className={`w-full py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-[#172033] shadow-2xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer ${buttonHover}`}
                        >
                          {isRoleLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4F46E5]" />
                              <span>Logging in...</span>
                            </>
                          ) : (
                            <span>1-click test</span>
                          )}
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Subtle note at bottom */}
            <div className="mt-8 pt-4 text-center">
              <p className="text-xs text-slate-400">
                1-Click test launches Demo Showcase Mode with isolated, fictional data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#172033]">Password Assistance</h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              For campus security and credential protection, account passwords are managed by your
              institution's Training &amp; Placement Office (TPO) or System Administrator.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5 mb-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Demo Accounts:</strong> You can use the 1-click test buttons to log in
                  instantly.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>
                  <strong>Institutional Accounts:</strong> Contact{' '}
                  <span className="font-mono text-indigo-600">admin@careerbridge.edu</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#4338CA] hover:bg-[#3730A3] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
