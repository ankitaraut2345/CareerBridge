import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import {
  Lock,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Building2,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context';
import api from '../services/api';

const QUICK_ROLES = [
  {
    role: 'STUDENT',
    title: 'Continue as Student',
    roleLabel: 'Student',
    icon: GraduationCap,
    iconBg: 'bg-indigo-50 text-[#4F46E5] group-hover:bg-[#4F46E5] group-hover:text-white',
    borderFocus: 'group-hover:border-[#4F46E5]',
  },
  {
    role: 'ALUMNI',
    title: 'Continue as Alumni',
    roleLabel: 'Alumni',
    icon: Briefcase,
    iconBg: 'bg-purple-50 text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white',
    borderFocus: 'group-hover:border-[#7C3AED]',
  },
  {
    role: 'TPO',
    title: 'Continue as TPO',
    roleLabel: 'TPO Officer',
    icon: Building2,
    iconBg: 'bg-sky-50 text-[#0284C7] group-hover:bg-[#38BDF8] group-hover:text-[#172033]',
    borderFocus: 'group-hover:border-[#38BDF8]',
  },
  {
    role: 'ADMIN',
    title: 'Continue as Admin',
    roleLabel: 'Administrator',
    icon: ShieldCheck,
    iconBg: 'bg-slate-100 text-[#172033] group-hover:bg-[#172033] group-hover:text-white',
    borderFocus: 'group-hover:border-[#172033]',
  },
];

export const LoginPage = () => {
  const { login, demoLogin, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [quickLoginRole, setQuickLoginRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoStatus, setDemoStatus] = useState({
    enabled: true,
    loaded: false,
  });

  // Check demo-login status dynamically from backend
  useEffect(() => {
    let isMounted = true;
    api
      .get('/auth/demo-login')
      .then((res) => {
        if (isMounted && res && typeof res.enabled === 'boolean') {
          setDemoStatus({ enabled: res.enabled, loaded: true });
        }
      })
      .catch(() => {
        if (isMounted) {
          // If check fails, default to enabled for local development or check env
          const envSetting = import.meta.env.VITE_ENABLE_DEMO_LOGIN;
          const isAllowed = envSetting !== 'false';
          setDemoStatus({ enabled: isAllowed, loaded: true });
        }
      });
    return () => {
      isMounted = false;
    };
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
      await login(form.email, form.password);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid credentials or login failed');
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role) => {
    if (quickLoginRole || isSubmitting) return; // Prevent duplicate clicks
    setError('');
    setQuickLoginRole(role);
    try {
      await demoLogin(role);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          `Quick login for ${role} failed. Please verify that demo mode is enabled.`
      );
      setQuickLoginRole(null);
    }
  };

  const isBusy = authLoading || isSubmitting || quickLoginRole !== null;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-[#F8FAFC]">
      <Card className="max-w-lg w-full text-center shadow-lg border border-slate-200" padding="lg">
        <div className="flex justify-center mb-5">
          <BrandLogo size="lg" />
        </div>

        <div className="w-12 h-12 bg-indigo-50 text-[#4F46E5] rounded-full flex items-center justify-center mx-auto mb-3 border border-indigo-100 shadow-sm">
          <Lock className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-bold text-[#172033] mb-1">Sign In to CareerBridge</h1>
        <p className="text-sm text-slate-500 mb-5">
          Enter your registered credentials or select a quick access role below
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start text-left gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <span className="flex-1 font-medium">{error}</span>
          </div>
        )}

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="e.g. user@careerbridge.edu"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              value={form.email}
              onChange={handleChange}
              disabled={isBusy}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
              value={form.password}
              onChange={handleChange}
              disabled={isBusy}
            />
          </div>

          <Button
            type="submit"
            fullWidth
            variant="primary"
            disabled={isBusy}
            className="mt-2"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Quick Access Section */}
        {demoStatus.enabled && (
          <div className="mt-7 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3 text-left">
              <div>
                <h2 className="text-sm font-bold text-[#172033] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#4F46E5]" />
                  Quick Access — Explore CareerBridge
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instant 1-click login for demonstration and role testing
                </p>
              </div>
              <span className="hidden sm:inline-flex text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Demo Mode
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {QUICK_ROLES.map(({ role, title, roleLabel, icon: Icon, iconBg, borderFocus }) => {
                const isCurrentLoading = quickLoginRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleQuickLogin(role)}
                    disabled={isBusy}
                    className={`group relative flex items-center p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${borderFocus}`}
                    title={`Instant login as ${roleLabel}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mr-3 transition-colors ${iconBg}`}
                    >
                      {isCurrentLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#172033] group-hover:text-[#4F46E5] truncate transition-colors">
                        {title}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between mt-0.5">
                        <span>{roleLabel}</span>
                        <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                          {isCurrentLoading ? 'Logging in...' : 'Quick Login'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-2 mt-6 pt-4 border-t border-slate-100">
          <Button to="/register" variant="outline" fullWidth disabled={isBusy} size="sm">
            Need an account? Register here
          </Button>
          <Button to="/" variant="ghost" fullWidth icon={ArrowLeft} disabled={isBusy} size="sm">
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
