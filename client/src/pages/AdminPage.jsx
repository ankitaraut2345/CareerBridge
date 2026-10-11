import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboard } from '../services/dashboardService';
import {
  DoughnutChart,
  TrendChart,
} from '../components/charts/DashboardCharts';
import {
  Users,
  ShieldCheck,
  GraduationCap,
  Award,
  Building2,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Activity,
  Briefcase,
  FileText,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const AdminPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminDashboard();
      setDashboardData(res);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
      setError(err.message || 'We could not load your dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="h-44 rounded-3xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-96 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 rounded-3xl bg-white border border-rose-100 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Unable to load dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">{error || 'Something went wrong.'}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-[#4F46E5] text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const {
    stats,
    roleDistribution,
    alumniVerification,
    userGrowth = [],
    platformActivity,
    recentActivity = [],
  } = dashboardData;

  const roleChartData = [
    { label: 'Students', value: roleDistribution?.STUDENT || 0, color: '#4F46E5' },
    { label: 'Alumni', value: roleDistribution?.ALUMNI || 0, color: '#7C3AED' },
    { label: 'TPO Officers', value: roleDistribution?.TPO || 0, color: '#0284C7' },
    { label: 'Administrators', value: roleDistribution?.ADMIN || 0, color: '#172033' },
  ];

  const totalUsers = stats?.totalUsers || 0;
  const pendingAlumni = stats?.pendingAlumniCount || alumniVerification?.pending || 0;
  const verifiedAlumni = stats?.verifiedAlumniCount || 0;

  return (
    <div className="space-y-7 pb-10">
      {/* ─── 1. Hero Banner matching Image 2 SaaS design ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/90 border border-slate-200/80 p-6 sm:p-8 lg:p-9 shadow-xs">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#172033] tracking-tight leading-tight mb-2">
              Good Morning, {user?.name?.split(' ')[0] || 'Admin'} 👋
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Institutional platform governance: audit graduate credentials, monitor recruitment pipelines, and manage system telemetry.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/alumni-verification')}
                className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Alumni Verification Queue</span>
                {pendingAlumni > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#4F46E5] text-[10px] font-black">
                    {pendingAlumni}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/tpo/opportunities')}
                className="px-5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-[#7C3AED] border border-purple-200/80 text-xs sm:text-sm font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-[#7C3AED]" />
                <span>Audit Placement Drives</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end">
            <div className="px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-indigo-100 shadow-xs text-right">
              <span className="block text-xs font-bold text-slate-400 italic">Platform Telemetry</span>
              <span className="block text-sm font-extrabold text-[#10B981] italic">
                100% Operational
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. 3 Key Stat Cards matching Image 2 ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div
          onClick={() => navigate('/admin')}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#172033] leading-none">
              {totalUsers}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
              Total Platform Users
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
              Across all 4 modules
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/alumni-verification')}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-200 transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#172033] leading-none">
              {pendingAlumni}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
              Pending Alumni Audits
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
              Awaiting degree verification
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/alumni-verification')}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#172033] leading-none">
              {verifiedAlumni}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
              Verified Alumni Mentors
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Active guidance credentials
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. Two-Column Dashboard Content Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Verification Banner & Ecosystem Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alumni Verification Alert Banner */}
          {pendingAlumni > 0 && (
            <div className="p-6 rounded-3xl bg-amber-50/80 border border-amber-200/80 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-200/80 text-amber-900 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172033]">
                    {pendingAlumni} Alumni profiles awaiting degree verification
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Review graduation credentials to unlock student mentorship and referral capabilities.
                  </p>
                </div>
              </div>

              <Link
                to="/admin/alumni-verification"
                className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-xs font-bold hover:bg-indigo-700 transition-colors self-start sm:self-auto flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-xs"
              >
                <span>Review Submissions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Platform Ecosystem Metrics */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="pb-4 mb-4 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-[#172033]">Platform Ecosystem Telemetry</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time aggregate data across all 4 modules</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Placement Drives</span>
                <p className="text-2xl font-extrabold text-[#172033] mt-2">
                  {platformActivity?.totalOpportunities || 0}
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Campus Drives</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Applications</span>
                <p className="text-2xl font-extrabold text-[#172033] mt-2">
                  {platformActivity?.totalApplications || 0}
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Student Submissions</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Mentorships</span>
                <p className="text-2xl font-extrabold text-[#172033] mt-2">
                  {platformActivity?.totalMentorships || 0}
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">1-on-1 Engagements</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Referral Jobs</span>
                <p className="text-2xl font-extrabold text-[#172033] mt-2">
                  {platformActivity?.totalReferralOpportunities || 0}
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Posted by Alumni</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Referral Requests</span>
                <p className="text-2xl font-extrabold text-[#172033] mt-2">
                  {platformActivity?.totalReferralRequests || 0}
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Candidate Inquiries</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
                <span className="text-xs font-bold text-slate-500">Notifications</span>
                <p className="text-2xl font-extrabold text-[#172033] mt-2">
                  {platformActivity?.totalNotifications || 0}
                </p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">Dispatched Alerts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Roles Breakdown & Quick Actions */}
        <div className="space-y-6">
          {/* Institutional Roles Breakdown */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="pb-4 mb-2 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-[#172033]">User Roles Breakdown</h2>
              <p className="text-xs text-slate-400 mt-0.5">Institutional membership distribution</p>
            </div>
            <DoughnutChart data={roleChartData} size={170} />
          </div>

          {/* Quick Actions Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-extrabold text-[#172033] mb-4">Governance Navigation</h2>
            <div className="space-y-2">
              <Link
                to="/admin/alumni-verification"
                className="p-3 rounded-2xl hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Alumni Verification Queue</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4F46E5] transition-colors" />
              </Link>

              <Link
                to="/tpo/opportunities"
                className="p-3 rounded-2xl hover:bg-purple-50/60 border border-slate-100 hover:border-purple-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span>Audit Placement Drives</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#7C3AED] transition-colors" />
              </Link>

              <Link
                to="/settings"
                className="p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span>System Settings &amp; Telemetry</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
